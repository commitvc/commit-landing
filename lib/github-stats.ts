/**
 * Stats for the `# project` block of a CompanyCard.
 *
 * TWO LAYERS
 *
 * 1. Baked (lib/stats.generated.ts, written by scripts/fetch-stats.mjs at build
 *    time). This is the baseline every render starts from, so real numbers are
 *    present in the static HTML — which matters because the previous
 *    fetch-on-mount approach left every stat invisible to Google and to AI
 *    search, and invisible without JS.
 *
 * 2. Live refresh, client-side, for the endpoints that allow cross-origin
 *    reads. Purely additive: anything that fails keeps its baked value, so the
 *    worst case is numbers as fresh as the last deploy rather than no numbers.
 *
 * WHY THERE IS NO CORS PROXY ANY MORE
 *
 * pypistats.org and hub.docker.com block cross-origin reads, so the browser
 * used to reach them through a public CORS proxy. That proxy went down more
 * than once — most recently returning 521 while six companies silently showed
 * no downloads row at all, because the failure path renders nothing.
 *
 * CORS is a browser restriction, not a network one, so the build-time fetcher
 * reaches those endpoints directly and the proxy is simply gone. The trade-off
 * is deliberate: docker pulls and pypi downloads are as fresh as the last
 * build, which for cumulative counts on a marketing page is not a meaningful
 * loss, and is strictly better than the intermittent nothing it replaces.
 *
 * Refreshable in the browser: api.github.com and api.npmjs.org (both send
 * permissive CORS headers). Baked-only: pypi, docker, and ghcr — the last has
 * no JSON API at all and is scraped at build time.
 */

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

export type DownloadKind = 'npm' | 'pypi' | 'docker' | 'ghcr' | 'gh-releases';

export type DownloadStat = {
  kind: DownloadKind;
  count: number;
  /** Per-month for npm/pypi, cumulative for docker/ghcr/gh-releases. Used to
   *  pick the right trailing label ("/mo" vs nothing) at the render site. */
  period: 'month' | 'total';
};

export type CompanyStats = {
  repo: RepoStats | null;
  download: DownloadStat | null;
};

/** Sources the browser can reach directly. Everything else stays baked. */
function isLiveRefreshable(pkg: string): boolean {
  return pkg.startsWith('npm:') || pkg.startsWith('gh-releases:');
}

const CACHE_KEY_PREFIX = 'cmp-stats:v3:';
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

/** Cumulative downloads across every release asset. See the note in
 *  scripts/fetch-stats.mjs for why this beats a language registry for CLIs. */
async function ghReleaseDownloads(repo: string): Promise<number | null> {
  const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=100`);
  if (!res.ok) return null;
  // >100 releases would make this a partial sum — report nothing rather than a
  // number that is quietly too low.
  if (res.headers.get('link')?.includes('rel="next"')) return null;
  const json = (await res.json()) as Array<{ assets?: Array<{ download_count?: number }> }>;
  if (!Array.isArray(json)) return null;
  let total = 0;
  for (const release of json) {
    for (const asset of release.assets ?? []) {
      if (typeof asset.download_count === 'number') total += asset.download_count;
    }
  }
  return total > 0 ? total : null;
}

async function refreshDownload(pkg: string): Promise<DownloadStat | null> {
  try {
    if (pkg.startsWith('npm:')) {
      const count = await npmLastMonth(pkg.slice(4));
      return count != null ? { kind: 'npm', count, period: 'month' } : null;
    }
    if (pkg.startsWith('gh-releases:')) {
      const count = await ghReleaseDownloads(pkg.slice(12));
      return count != null ? { kind: 'gh-releases', count, period: 'total' } : null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Refresh what the browser can reach, falling back to `baked` field by field.
 *
 * Never returns less than it was given: a failed refresh yields the baked
 * value, so the card can only ever get *fresher*, never emptier.
 */
export async function refreshCompanyStats(
  baked: CompanyStats,
  githubUrl?: string,
  pkg?: string,
): Promise<CompanyStats> {
  const cacheKey = `${githubUrl ?? ''}|${pkg ?? ''}`;
  const cached = readCache(cacheKey);
  if (cached) return cached;

  const [repo, download] = await Promise.all([
    githubUrl ? fetchRepo(githubUrl) : Promise.resolve(null),
    pkg && isLiveRefreshable(pkg) ? refreshDownload(pkg) : Promise.resolve(null),
  ]);

  const stats: CompanyStats = {
    repo: repo ?? baked.repo,
    download: download ?? baked.download,
  };
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
    case 'gh-releases':
      return 'RELEASE DOWNLOADS';
  }
}
