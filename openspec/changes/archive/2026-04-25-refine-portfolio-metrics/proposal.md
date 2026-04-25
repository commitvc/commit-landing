## Why

Portfolio company pages render a `# project` block with up to six stats: License, Language, First Commit, Stars, Contributors, Downloads. Three of those are static (license, language, firstCommit baked in `lib/companies.ts`); three are live (stars, contributors, downloads from GitHub API and package registries).

Three problems converged:

1. **The original API route can't ship.** `app/api/package-downloads/route.ts` was a server-side proxy for PyPI/Docker Hub (both block CORS) and incidentally for npm (which allows CORS). The site builds with `output: 'export'` — there is no server runtime at request time — so the route silently produced a build error. We want the live freshness; we don't want to ship a broken build.

2. **Acquired companies show misleading "live" stats.** Keep (acquired by Elastic, repo dormant) and Graphcore (acquired by SoftBank, repo last touched 2023) had their stars/forks/contributors fetched live every page load. The live numbers don't change; the project is frozen; the live tracking adds noise without insight.

3. **Page-level descriptions get truncated by Google.** The team-detail and company-detail `<meta name="description">` were falling back to the long-form bio (`description` on TeamMember, ~400-600 chars; `about` on Company, 250-400 chars). Google truncates at ~160 chars on desktop SERP, mid-sentence. The truncated snippet read poorly.

This change reworks the metrics-fetching surface to keep live freshness without an API route, gates live tracking on lifecycle (acquired skips), and adds an optional `seoDescription` field on both `TeamMember` and `Company` that powers `<meta name="description">` and `og:description` while leaving the long-form prose for the page body.

## What Changes

- **Removed**: `app/api/package-downloads/route.ts` and its supporting `app/api/` directory.
- **Live client-side fetching restored** in `lib/github-stats.ts`:
  - `api.github.com` for repo facts (allows CORS, fetched directly)
  - `api.npmjs.org` for npm downloads (allows CORS, fetched directly)
  - `api.codetabs.com/v1/proxy/?quest=…` for PyPI and Docker Hub (block CORS, routed through the public codetabs proxy)
  - `lib/container-pulls.generated.ts` for GHCR pulls (no public JSON API; baked at build, refreshed manually)
  - sessionStorage cache (1h TTL) keyed on `<github>|<package>` so flipping between cards in a single visit re-uses fetches
- **Acquired companies skip the live fetch entirely.** When `Company.acquiredBy` is set, `CompanyCard` does not call `fetchCompanyStats`; the `# project` block renders only the static rows (license, language, firstCommit) from the `Company` overrides. The `(acq. X)` tag in the title carries the lifecycle context.
- **Static overrides added** for the two acquired companies so their cards still surface the relevant facts:
  - `keep`: `language: 'Python'`
  - `graphcore`: `license: 'MIT'`, `language: 'C++'`
- **Refreshed GHCR baked count** for Sourcebot (`410_000 → 412_574`).
- **Optional `seoDescription?: string`** on both `TeamMember` and `Company` types in `lib/team.ts` and `lib/companies.ts`. Each entry populated with a SERP-friendly short version (~110-150 chars). `generateMetadata` for `/team/[slug]/`, `/companies/[slug]/`, and `/companies/pre-commit/[slug]/` prefers it, falls back to the long form, falls back to a name+role placeholder.

## Capabilities

### New Capabilities

- `portfolio-stats-fetching`: the data-flow rules for repo + download stats, including the CORS strategy and sessionStorage cache.
- `acquired-company-tracking`: the lifecycle gate that skips live fetches for acquired companies and the static-override fallback chain.
- `seo-description-fields`: the optional `seoDescription` field on `TeamMember` and `Company` and its consumption in `generateMetadata`.

### Modified Capabilities

None directly. This change adds new capabilities; the existing `pre-commit-folder` capability is unaffected.
