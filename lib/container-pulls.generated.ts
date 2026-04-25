/**
 * GHCR pull counts baked into the bundle.
 *
 * GitHub Container Registry doesn't expose a public JSON API for pull counts
 * (they're only on the HTML package page) and github.com blocks cross-origin
 * requests — so we can't fetch them client-side. This file should be
 * regenerated at build time by scripts/scrape-ghcr-pulls.ts (TODO: wire into
 * CI) which fetches each package's HTML page and parses the total.
 *
 * The key is the "owner/repo" slug that comes after "ghcr:" in a Company's
 * `package` field. Missing keys surface as "no download stat" in the UI,
 * which is the same graceful fallback as any other missing metric.
 */
export const CONTAINER_PULLS: Record<string, number> = {
  // Scraped 2026-04-24 from github.com/sourcebot-dev/sourcebot/pkgs/container/sourcebot
  'sourcebot-dev/sourcebot': 410_000,
};
