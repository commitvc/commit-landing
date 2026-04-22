export type GithubStats = {
  stars: number;
  forks: number;
  openIssues: number;
  downloads?: number;
};

const CACHE_KEY_PREFIX = 'gh-stats:v1:';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

type CacheEntry = { ts: number; data: GithubStats };

function readCache(key: string): GithubStats | null {
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

function writeCache(key: string, data: GithubStats): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: CacheEntry = { ts: Date.now(), data };
    window.sessionStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(entry));
  } catch {
    // quota or disabled storage — silently skip caching
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

async function fetchPackageDownloads(pkg: string): Promise<number | undefined> {
  try {
    if (pkg.startsWith('npm:')) {
      const name = pkg.slice(4);
      const res = await fetch(
        `https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(name)}`,
      );
      if (!res.ok) return undefined;
      const json = (await res.json()) as { downloads?: number };
      return json.downloads;
    }
    if (pkg.startsWith('pypi:')) {
      const name = pkg.slice(5);
      const res = await fetch(
        `https://pypistats.org/api/packages/${encodeURIComponent(name)}/recent`,
      );
      if (!res.ok) return undefined;
      const json = (await res.json()) as { data?: { last_month?: number } };
      return json.data?.last_month;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export async function fetchGithubStats(
  githubUrl: string,
  pkg?: string,
): Promise<GithubStats | null> {
  const cacheKey = `${githubUrl}|${pkg ?? ''}`;
  const cached = readCache(cacheKey);
  if (cached) return cached;

  const parsed = parseRepo(githubUrl);
  if (!parsed) return null;

  try {
    const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      stargazers_count?: number;
      forks_count?: number;
      open_issues_count?: number;
    };
    const downloads = pkg ? await fetchPackageDownloads(pkg) : undefined;
    const stats: GithubStats = {
      stars: json.stargazers_count ?? 0,
      forks: json.forks_count ?? 0,
      openIssues: json.open_issues_count ?? 0,
      ...(downloads !== undefined ? { downloads } : {}),
    };
    writeCache(cacheKey, stats);
    return stats;
  } catch {
    return null;
  }
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
