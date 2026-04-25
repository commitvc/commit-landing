/**
 * Client-side fetchers for the stats surfaced in the `# project` block of a
 * CompanyCard: GitHub repo facts (stars, forks, contributors, license,
 * primary language) and downloads/pulls from npm / PyPI / Docker Hub / GHCR.
 *
 * All values are fetched live from the browser so numbers stay fresh, with
 * a 1-hour sessionStorage cache so flipping between company files in the
 * same visit doesn't re-hit every API. GHCR pulls are the one exception —
 * github.com has no public JSON endpoint for container pulls (HTML-only),
 * so those are scraped at build time into lib/container-pulls.generated.ts.
 *
 * CORS strategy:
 *  - api.github.com  — allows cross-origin reads. Direct fetch.
 *  - api.npmjs.org   — allows cross-origin reads. Direct fetch.
 *  - pypistats.org   — blocks cross-origin. Routed through CORS_PROXY.
 *  - hub.docker.com  — blocks cross-origin. Routed through CORS_PROXY.
 *
 * The site ships as a static export (next.config.mjs `output: 'export'`),
 * so we can't run an own-hosted /api/* proxy at request time. The CORS
 * proxy below is a third-party dependency — see SELF-HOSTING note.
 */
import { CONTAINER_PULLS } from './container-pulls.generated';

/**
 * Public CORS proxy used for endpoints that block cross-origin browser
 * reads (pypistats.org, hub.docker.com). codetabs is a free service that
 * forwards the request from a server and returns the body with permissive
 * CORS headers — no API key, no signup. The trailing slash on `/v1/proxy/`
 * skips a 301 that would otherwise show up on every request.
 *
 * Trade-offs:
 *  - Third-party dependency. If codetabs is down or rate-limited, download
 *    counts gracefully render as "no stat" (same UX as a GHCR package
 *    without a baked count) — see the catch in fetchDownload below.
 *  - Free CORS proxies historically tighten policies over time
 *    (corsproxy.io did so in 2025). Worth periodically verifying.
 *
 * Self-hosting upgrade path: deploy a ~30-line Cloudflare Worker (free
 * tier: 100k req/day, dwarfs portfolio-page traffic) and swap the constant
 * below. Worker template:
 *
 *   export default {
 *     async fetch(req) {
 *       const target = new URL(req.url).searchParams.get('url');
 *       if (!target) return new Response('missing ?url=', { status: 400 });
 *       const upstream = await fetch(target, { headers: { Accept: 'application/json' } });
 *       return new Response(upstream.body, {
 *         status: upstream.status,
 *         headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json' },
 *       });
 *     },
 *   };
 *
 * Then `const CORS_PROXY = 'https://your-worker.workers.dev/?url='`.
 */
const CORS_PROXY = 'https://api.codetabs.com/v1/proxy/?quest=';
const viaProxy = (url: string) => `${CORS_PROXY}${encodeURIComponent(url)}`;

export type RepoStats = {
  stars: number;
  forks: number;
  openIssues: number;
  contributors?: number;
  /** SPDX identifier (e.g. "MIT", "Elastic-2.0"). */
  license?: string;
  /** Primary language per GitHub's detection (e.g. "TypeScript"). */
  language?: string;
};

export type DownloadKind = 'npm' | 'pypi' | 'docker' | 'ghcr';

export type DownloadStat = {
  kind: DownloadKind;
  count: number;
  /** Per-month for npm/pypi, cumulative for docker/ghcr. Used to pick the
   *  right trailing label ("/mo" vs nothing) at the render site. */
  period: 'month' | 'total';
};

export type CompanyStats = {
  repo: RepoStats | null;
  download: DownloadStat | null;
};

const CACHE_KEY_PREFIX = 'cmp-stats:v2:';
const CACHE_TTL_MS = 60 * 60 * 1000;

type CacheEntry = { ts: number; data: CompanyStats };

function readCache(key: string): CompanyStats | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (Date.now() - entry.ts > CACHE_TTL_MS) return null;
    return entry.data;
  } catch {
    return null;
  }
}

function writeCache(key: string, data: CompanyStats): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: CacheEntry = { ts: Date.now(), data };
    window.sessionStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(entry));
  } catch {
    // quota or disabled storage — silently skip
  }
}

function parseRepo(githubUrl: string): { owner: string; repo: string } | null {
  try {
    const u = new URL(githubUrl);
    const [, owner, repo] = u.pathname.replace(/\/$/, '').split('/');
    if (!owner || !repo) return null;
    return { owner, repo };
  } catch {
    return null;
  }
}

async function fetchContributors(owner: string, repo: string): Promise<number | undefined> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=1&anon=1`,
    );
    if (!res.ok) return undefined;
    const link = res.headers.get('link');
    if (link) {
      const m = link.match(/[?&]page=(\d+)>; rel="last"/);
      if (m?.[1]) return Number.parseInt(m[1], 10);
    }
    const arr = (await res.json()) as unknown[];
    return Array.isArray(arr) ? arr.length : undefined;
  } catch {
    return undefined;
  }
}

async function fetchRepo(githubUrl: string): Promise<RepoStats | null> {
  const parsed = parseRepo(githubUrl);
  if (!parsed) return null;
  try {
    const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      stargazers_count?: number;
      forks_count?: number;
      open_issues_count?: number;
      language?: string | null;
      license?: { spdx_id?: string | null } | null;
    };
    const contributors = await fetchContributors(parsed.owner, parsed.repo);
    return {
      stars: json.stargazers_count ?? 0,
      forks: json.forks_count ?? 0,
      openIssues: json.open_issues_count ?? 0,
      contributors,
      license:
        json.license?.spdx_id && json.license.spdx_id !== 'NOASSERTION'
          ? json.license.spdx_id
          : undefined,
      language: json.language ?? undefined,
    };
  } catch {
    return null;
  }
}

async function npmLastMonth(name: string): Promise<number | null> {
  // api.npmjs.org allows cross-origin reads — direct fetch.
  const res = await fetch(
    `https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(name)}`,
  );
  if (!res.ok) return null;
  const json = (await res.json()) as { downloads?: number };
  return typeof json.downloads === 'number' ? json.downloads : null;
}

async function pypiLastMonth(name: string): Promise<number | null> {
  // pypistats.org blocks cross-origin. Route through CORS_PROXY.
  const res = await fetch(
    viaProxy(`https://pypistats.org/api/packages/${encodeURIComponent(name)}/recent`),
  );
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: { last_month?: number } };
  return typeof json.data?.last_month === 'number' ? json.data.last_month : null;
}

async function dockerPullCount(name: string): Promise<number | null> {
  // hub.docker.com blocks cross-origin. Route through CORS_PROXY.
  const res = await fetch(viaProxy(`https://hub.docker.com/v2/repositories/${name}/`));
  if (!res.ok) return null;
  const json = (await res.json()) as { pull_count?: number };
  return typeof json.pull_count === 'number' ? json.pull_count : null;
}

async function fetchDownload(pkg: string): Promise<DownloadStat | null> {
  try {
    if (pkg.startsWith('ghcr:')) {
      // GHCR has no JSON endpoint — count is baked at build time.
      const name = pkg.slice(5);
      const count = CONTAINER_PULLS[name];
      return typeof count === 'number' ? { kind: 'ghcr', count, period: 'total' } : null;
    }
    if (pkg.startsWith('npm:')) {
      const count = await npmLastMonth(pkg.slice(4));
      return count != null ? { kind: 'npm', count, period: 'month' } : null;
    }
    if (pkg.startsWith('pypi:')) {
      const count = await pypiLastMonth(pkg.slice(5));
      return count != null ? { kind: 'pypi', count, period: 'month' } : null;
    }
    if (pkg.startsWith('docker:')) {
      const count = await dockerPullCount(pkg.slice(7));
      return count != null ? { kind: 'docker', count, period: 'total' } : null;
    }
    return null;
  } catch {
    return null;
  }
}

/** Fetch everything we need for a CompanyCard's `# project` block. */
export async function fetchCompanyStats(githubUrl?: string, pkg?: string): Promise<CompanyStats> {
  const cacheKey = `${githubUrl ?? ''}|${pkg ?? ''}`;
  const cached = readCache(cacheKey);
  if (cached) return cached;

  // Both fetches kick off in parallel — repo from api.github.com, downloads
  // from npm / pypistats / Docker Hub (the latter two via the CORS proxy).
  const [repo, download] = await Promise.all([
    githubUrl ? fetchRepo(githubUrl) : Promise.resolve(null),
    pkg ? fetchDownload(pkg) : Promise.resolve(null),
  ]);
  const stats: CompanyStats = { repo, download };
  writeCache(cacheKey, stats);
  return stats;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

/** UI label for a download kind (e.g. "NPM DOWNLOADS", "DOCKER PULLS"). */
export function downloadLabel(kind: DownloadKind): string {
  switch (kind) {
    case 'npm':
      return 'NPM DOWNLOADS';
    case 'pypi':
      return 'PYPI DOWNLOADS';
    case 'docker':
      return 'DOCKER PULLS';
    case 'ghcr':
      return 'GHCR PULLS';
  }
}
