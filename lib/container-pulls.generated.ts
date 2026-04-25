/**
 * GHCR pull counts baked into the bundle.
 *
 * GitHub Container Registry doesn't expose a public JSON API for pull counts
 * (they're only on the HTML package page) and github.com blocks cross-origin
 * requests — so we can't fetch them client-side. Counts below were scraped
 * by hand from each package's GHCR page; bump them when you remember to,
 * or write a `scripts/scrape-ghcr-pulls.ts` and wire it into CI to refresh
 * this file automatically on each build.
 *
 * The key is the "owner/repo" slug that comes after "ghcr:" in a Company's
 * `package` field. Missing keys surface as "no download stat" in the UI,
 * which is the same graceful fallback as any other missing metric.
 */
export const CONTAINER_PULLS: Record<string, number> = {
  // Scraped 2026-04-25 from github.com/sourcebot-dev/sourcebot/pkgs/container/sourcebot
  'sourcebot-dev/sourcebot': 412_574,
};
