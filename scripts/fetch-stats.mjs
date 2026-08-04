/**
 * Build-time stats fetcher. Writes lib/stats.generated.ts.
 *
 * WHY THIS EXISTS
 *
 * The site is a static export, so there is no server to proxy through at
 * request time. Stats used to be fetched from the browser, which meant the
 * endpoints that block cross-origin reads (pypistats.org, hub.docker.com) had
 * to go through a public CORS proxy. That proxy has gone down more than once,
 * and because the failure path renders nothing, six companies silently lost
 * their downloads row without anyone noticing.
 *
 * CORS is a browser restriction, not a network one. Fetching here — in Node,
 * at build time — makes it disappear entirely. Two things fall out of that:
 *
 *   1. No third-party proxy, so there is nothing to go down.
 *   2. The numbers ship inside the static HTML, so crawlers and AI search see
 *      them. Client-fetched stats were invisible to every one of them.
 *
 * BEST EFFORT, NEVER DESTRUCTIVE
 *
 * The generated file is committed, and it is the source of truth for `next
 * build`. This script only ever *improves* it: any company whose fetch fails
 * keeps its previously committed numbers, and a total failure (no network, no
 * token, rate limited) leaves the file untouched and exits 0. A refresh
 * problem must never break a deploy.
 *
 * RATE LIMITS
 *
 * ~29 github.com calls per run against an unauthenticated limit of 60/hour per
 * IP — too tight to rely on. Pass a token via GITHUB_TOKEN (CI provides one
 * automatically) for 5000/hour. Locally the script falls back to `gh auth
 * token` if it is available.
 *
 * Run directly with `node scripts/fetch-stats.mjs`, or via `pnpm prebuild`.
 */

import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_PATH = resolve(ROOT, 'lib/stats.generated.ts');

// ── auth ────────────────────────────────────────────────────────────────────

function githubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    // Local convenience only — absent in CI, which sets GITHUB_TOKEN instead.
    return execFileSync('gh', ['auth', 'token'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

const TOKEN = githubToken();

// pypistats and crates.io both ask for an identifying User-Agent in their
// crawler policy; sending one everywhere is harmless and avoids 403s.
const UA = 'commit-landing-stats/1.0 (+https://commit.fund)';

async function getJson(url, { auth = false } = {}) {
  const headers = { Accept: 'application/json', 'User-Agent': UA };
  if (auth && TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return { json: await res.json(), headers: res.headers };
}

// ── github ──────────────────────────────────────────────────────────────────

function parseRepo(githubUrl) {
  const [, owner, repo] = new URL(githubUrl).pathname.replace(/\/$/, '').split('/');
  return owner && repo ? { owner, repo } : null;
}

async function fetchContributors(owner, repo) {
  // `per_page=1` turns the count into a pagination read: the last page number
  // *is* the contributor count, which avoids pulling every contributor object.
  const { json, headers } = await getJson(
    `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=1&anon=1`,
    { auth: true },
  );
  const last = headers.get('link')?.match(/[?&]page=(\d+)>; rel="last"/);
  if (last?.[1]) return Number.parseInt(last[1], 10);
  return Array.isArray(json) ? json.length : undefined;
}

async function fetchRepo(githubUrl) {
  const parsed = parseRepo(githubUrl);
  if (!parsed) return null;
  const { owner, repo } = parsed;
  const { json } = await getJson(`https://api.github.com/repos/${owner}/${repo}`, { auth: true });
  let contributors;
  try {
    contributors = await fetchContributors(owner, repo);
  } catch {
    contributors = undefined; // non-fatal: the rest of the repo stats still stand
  }
  const spdx = json.license?.spdx_id;
  return {
    stars: json.stargazers_count ?? 0,
    forks: json.forks_count ?? 0,
    openIssues: json.open_issues_count ?? 0,
    contributors,
    license: spdx && spdx !== 'NOASSERTION' ? spdx : undefined,
    language: json.language ?? undefined,
  };
}

// ── downloads ───────────────────────────────────────────────────────────────

async function npmLastMonth(name) {
  const { json } = await getJson(
    `https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(name)}`,
  );
  return typeof json.downloads === 'number' ? json.downloads : null;
}

async function pypiLastMonth(name) {
  // Direct — no proxy needed here, CORS was only ever a browser problem.
  const { json } = await getJson(
    `https://pypistats.org/api/packages/${encodeURIComponent(name)}/recent`,
  );
  return typeof json.data?.last_month === 'number' ? json.data.last_month : null;
}

async function dockerPulls(name) {
  const { json } = await getJson(`https://hub.docker.com/v2/repositories/${name}/`);
  return typeof json.pull_count === 'number' ? json.pull_count : null;
}

async function ghReleaseDownloads(repo) {
  const { json, headers } = await getJson(
    `https://api.github.com/repos/${repo}/releases?per_page=100`,
    { auth: true },
  );
  // >100 releases would make this page a partial sum. Report nothing rather
  // than a number that is quietly too low.
  if (headers.get('link')?.includes('rel="next"')) return null;
  if (!Array.isArray(json)) return null;
  let total = 0;
  for (const release of json) {
    for (const asset of release.assets ?? []) {
      if (typeof asset.download_count === 'number') total += asset.download_count;
    }
  }
  return total > 0 ? total : null;
}

/**
 * GHCR publishes pull counts on the HTML package page only — no JSON API — so
 * this is a scrape. Previously the numbers were pasted into a file by hand and
 * went 58% stale over three months; doing it here at least keeps it honest.
 * The exact count sits in the title attribute; the visible text is rounded.
 */
async function ghcrPulls(ownerRepo) {
  const [owner, repo] = ownerRepo.split('/');
  const url = `https://github.com/${owner}/${repo}/pkgs/container/${repo}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${res.status} — ${url}`);
  const html = await res.text();
  const m = html.match(/Total downloads<\/span>\s*<h3[^>]*title="(\d+)"/);
  return m?.[1] ? Number.parseInt(m[1], 10) : null;
}

async function fetchDownload(pkg) {
  if (pkg.startsWith('npm:'))
    return { kind: 'npm', count: await npmLastMonth(pkg.slice(4)), period: 'month' };
  if (pkg.startsWith('pypi:'))
    return { kind: 'pypi', count: await pypiLastMonth(pkg.slice(5)), period: 'month' };
  if (pkg.startsWith('docker:'))
    return { kind: 'docker', count: await dockerPulls(pkg.slice(7)), period: 'total' };
  if (pkg.startsWith('ghcr:'))
    return { kind: 'ghcr', count: await ghcrPulls(pkg.slice(5)), period: 'total' };
  if (pkg.startsWith('gh-releases:'))
    return { kind: 'gh-releases', count: await ghReleaseDownloads(pkg.slice(12)), period: 'total' };
  return null;
}

// ── previous values ─────────────────────────────────────────────────────────

/**
 * Load the committed generated file so a failed fetch can fall back to it.
 *
 * Imported rather than parsed: it is a real module, and its only import is a
 * type-only one that type stripping erases, so there is nothing to resolve at
 * runtime. An earlier version of this tried to regex the object into JSON and
 * silently returned {} every time — the file quotes its keys and string values
 * with single quotes, which JSON.parse rejects — so the fallback never fired.
 */
async function readPrevious() {
  try {
    const mod = await import(`${OUT_PATH}?t=${Date.now()}`);
    return mod.BAKED_STATS ?? {};
  } catch {
    // First run, or the file is missing/unparseable — nothing to fall back to.
    return {};
  }
}

// ── main ────────────────────────────────────────────────────────────────────

function group(n) {
  // Mirror the 650_814 style already used in the repo for large literals.
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '_');
}

function serialize(stats, fetchedAt) {
  const entries = Object.keys(stats)
    .sort()
    .map((slug) => {
      const { repo, download } = stats[slug];
      const parts = [];
      if (repo) {
        const r = [
          `stars: ${group(repo.stars)}`,
          `forks: ${group(repo.forks)}`,
          `openIssues: ${group(repo.openIssues)}`,
        ];
        if (repo.contributors !== undefined) r.push(`contributors: ${group(repo.contributors)}`);
        if (repo.license) r.push(`license: '${repo.license}'`);
        if (repo.language) r.push(`language: '${repo.language}'`);
        parts.push(`    repo: { ${r.join(', ')} },`);
      } else {
        parts.push('    repo: null,');
      }
      if (download && download.count != null) {
        parts.push(
          `    download: { kind: '${download.kind}', count: ${group(download.count)}, period: '${download.period}' },`,
        );
      } else {
        parts.push('    download: null,');
      }
      return `  '${slug}': {\n${parts.join('\n')}\n  },`;
    });

  return `/**
 * GENERATED FILE — do not edit by hand.
 *
 * Written by scripts/fetch-stats.mjs, which runs as \`pnpm prebuild\`. Committed
 * on purpose: it is the source of truth for \`next build\`, so the build never
 * depends on the network, and these numbers ship inside the static HTML where
 * crawlers and AI search can actually read them.
 *
 * To refresh: \`pnpm fetch-stats\` (needs GITHUB_TOKEN, or a logged-in \`gh\`).
 *
 * Last fetched: ${fetchedAt}
 */
import type { CompanyStats } from './github-stats';

export const BAKED_STATS: Record<string, CompanyStats> = {
${entries.join('\n')}
} as const;
`;
}

async function main() {
  // The e2e suite builds the site through Playwright's `webServer`, so a plain
  // CI run would fire this twice — once for the test build, once for the real
  // one. That doubles the API calls and, worse, the first pass eats the
  // pypistats quota so the second gets 429s. The tests assert the *shape* of
  // the stats, never specific values, so they're happy with committed numbers.
  if (process.env.SKIP_STATS_REFRESH) {
    console.log('[fetch-stats] SKIP_STATS_REFRESH set — using the committed values.');
    return;
  }

  const { COMPANIES } = await import(resolve(ROOT, 'lib/companies.ts'));
  const previous = await readPrevious();

  if (!TOKEN) {
    console.warn(
      '[fetch-stats] No GITHUB_TOKEN and no `gh auth token`. The unauthenticated\n' +
        '              limit is 60 req/hour and this run needs ~29 — expect failures,\n' +
        '              which will fall back to the committed values.',
    );
  }

  const stats = {};
  let ok = 0;
  let fellBack = 0;

  for (const c of COMPANIES) {
    // Mirror CompanyCard's skipLiveFetch rule, so the file doesn't carry
    // numbers that are never rendered. Stealth companies show a "permission
    // denied" card, and an acquisition freezes the card unless it explicitly
    // opts back in via keepLiveStats.
    if (c.stealth) continue;
    if (c.acquiredBy && !c.keepLiveStats) continue;

    const prev = previous[c.slug];
    let repo = null;
    let download = null;

    if (c.github) {
      try {
        repo = await fetchRepo(c.github);
      } catch (err) {
        repo = prev?.repo ?? null;
        if (repo) fellBack++;
        console.warn(`[fetch-stats] ${c.slug}: repo fetch failed (${err.message}) — kept previous`);
      }
    }

    if (c.package) {
      try {
        const d = await fetchDownload(c.package);
        download = d && d.count != null ? d : (prev?.download ?? null);
        if (!d || d.count == null) {
          if (download) fellBack++;
          console.warn(`[fetch-stats] ${c.slug}: no download count returned — kept previous`);
        }
      } catch (err) {
        download = prev?.download ?? null;
        if (download) fellBack++;
        console.warn(
          `[fetch-stats] ${c.slug}: download fetch failed (${err.message}) — kept previous`,
        );
      }
    }

    if (repo || download) {
      stats[c.slug] = { repo, download };
      ok++;
    } else if (prev) {
      stats[c.slug] = prev;
    }
  }

  if (ok === 0) {
    console.warn(
      '[fetch-stats] Nothing fetched successfully — leaving the committed file untouched.',
    );
    return;
  }

  writeFileSync(OUT_PATH, serialize(stats, new Date().toISOString().slice(0, 10)), 'utf8');

  // Hand the output to biome rather than trying to match its formatter by hand
  // (it unquotes identifier-safe keys, but not ones like 'better-auth', and
  // wraps long object literals). Keeping the file formatted means `pnpm lint`
  // can cover it like any other source file instead of needing an exclusion.
  try {
    execFileSync('pnpm', ['exec', 'biome', 'format', '--write', OUT_PATH], {
      stdio: 'ignore',
      cwd: ROOT,
    });
  } catch {
    console.warn('[fetch-stats] Could not run biome on the output — `pnpm lint` may flag it.');
  }

  console.log(
    `[fetch-stats] Wrote ${Object.keys(stats).length} companies to lib/stats.generated.ts` +
      `${fellBack ? ` (${fellBack} value(s) kept from the previous file)` : ''}`,
  );
}

main().catch((err) => {
  // Never fail the build over a refresh problem — the committed file stands.
  console.warn(`[fetch-stats] Refresh aborted: ${err.message}`);
  console.warn('[fetch-stats] Keeping the committed lib/stats.generated.ts.');
});
