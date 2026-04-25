# portfolio-stats-fetching Specification

## Purpose
TBD - created by archiving change refine-portfolio-metrics. Update Purpose after archive.
## Requirements
### Requirement: Portfolio stats are fetched live client-side, not baked at build

`CompanyCard` SHALL fetch repo facts and download counts at component mount via `lib/github-stats.ts` `fetchCompanyStats(githubUrl, package)`. The values are NOT baked into static JSON files at build time; visitors see numbers updated as recently as their last cache miss (1h TTL).

#### Scenario: client-side fetch on mount

- **WHEN** a non-acquired, non-stealth company page renders in a browser
- **THEN** the page's `useEffect` invokes `fetchCompanyStats` and the resulting `<Stat>` rows for STARS / CONTRIBUTORS / DOWNLOADS render with the latest values

### Requirement: GitHub repo facts use direct fetch to `api.github.com`

`api.github.com` allows cross-origin reads. `fetchRepo(githubUrl)` SHALL call `https://api.github.com/repos/<owner>/<repo>` directly with no proxy.

#### Scenario: direct GitHub fetch

- **WHEN** the network tab is inspected during a card render
- **THEN** there is a request to `https://api.github.com/repos/...` with no proxy URL wrapper

### Requirement: npm downloads use direct fetch to `api.npmjs.org`

`api.npmjs.org` allows cross-origin reads. `npmLastMonth(name)` SHALL call `https://api.npmjs.org/downloads/point/last-month/<name>` directly.

#### Scenario: npm direct fetch

- **WHEN** a company with `package: 'npm:<name>'` renders
- **THEN** there is a direct request to `api.npmjs.org/downloads/point/last-month/<name>`

### Requirement: PyPI and Docker Hub stats route through the codetabs CORS proxy

PyPI (`pypistats.org`) and Docker Hub (`hub.docker.com`) block cross-origin reads. Both SHALL be routed through a CORS proxy at `https://api.codetabs.com/v1/proxy/?quest=<encoded-target-url>`. The trailing slash on `/v1/proxy/` is required to avoid a 301 redirect on every call.

#### Scenario: PyPI via proxy

- **WHEN** a company with `package: 'pypi:<name>'` renders
- **THEN** the network request is to `https://api.codetabs.com/v1/proxy/?quest=...pypistats.org%2F...recent`

#### Scenario: Docker Hub via proxy

- **WHEN** a company with `package: 'docker:<owner>/<repo>'` renders
- **THEN** the network request is to `https://api.codetabs.com/v1/proxy/?quest=...hub.docker.com%2Fv2%2Frepositories%2F...`

### Requirement: GHCR pulls are baked, not fetched

GitHub Container Registry has no public JSON API for pull counts; counts are only on the rendered HTML package page. `lib/container-pulls.generated.ts` SHALL export `CONTAINER_PULLS: Record<string, number>` keyed by the `<owner>/<repo>` slug after `ghcr:` in a `Company.package` field.

#### Scenario: GHCR lookup is synchronous

- **WHEN** a company with `package: 'ghcr:<slug>'` is rendered
- **THEN** `lookupDownload` returns `{ kind: 'ghcr', count: CONTAINER_PULLS[slug], period: 'total' }` synchronously, no fetch

#### Scenario: missing GHCR key falls back gracefully

- **WHEN** a `ghcr:` package's slug is not in `CONTAINER_PULLS`
- **THEN** the download row renders nothing (the `<Stat>` component returns `null` for undefined values without loading)

### Requirement: sessionStorage cache de-duplicates fetches within a visit

`fetchCompanyStats` SHALL cache results in `sessionStorage` under the key prefix `cmp-stats:v2:`, keyed on `<githubUrl>|<package>`, with a 1-hour TTL. Cache reads expire silently; cache writes swallow `QuotaExceededError`.

#### Scenario: cache hit on repeat visit

- **WHEN** the user navigates from `/companies/pre-commit/twenty/` to `/companies/pre-commit/mastra/` and back to Twenty within an hour
- **THEN** the second Twenty visit reads from `sessionStorage` and does not re-issue the GitHub or Docker Hub fetches

#### Scenario: TTL expiry triggers fresh fetch

- **WHEN** a cached entry's `ts` is older than 1 hour from now
- **THEN** the cache returns null and `fetchCompanyStats` re-fetches

### Requirement: Failed fetches degrade silently to "no stat"

Each upstream call SHALL be wrapped in a try/catch (or `if (!res.ok) return null`). When a fetch fails (network error, rate limit, malformed response), the affected `<Stat>` row renders nothing — same UX as a missing GHCR baked count.

#### Scenario: codetabs proxy returns 429

- **WHEN** the codetabs proxy returns a non-OK status or a body that fails to parse as JSON
- **THEN** `pypiLastMonth` or `dockerPullCount` returns `null` and the DOWNLOADS row in the card simply doesn't render

#### Scenario: GitHub API rate-limited

- **WHEN** `fetchRepo` returns a non-OK status
- **THEN** the entire `repo` field is `null`, omitting STARS, CONTRIBUTORS, and any license/language that would have come from the repo's response

### Requirement: The CORS proxy is documented as replaceable

The header comment of `lib/github-stats.ts` SHALL include a note stating that the codetabs proxy is a third-party dependency, that the alternative (a self-hosted Cloudflare Worker) is a one-constant change, and a Worker template (~30 lines) ready to copy into a deploy.

#### Scenario: file header documents the trade-off

- **WHEN** `lib/github-stats.ts` is read
- **THEN** the top-of-file comment block names codetabs as the proxy, flags it as a third-party dependency, and includes a Cloudflare Worker template for self-hosting

