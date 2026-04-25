## Context

The original portfolio-stats fetching design was an `/api/package-downloads` route — a thin server-side proxy that the client called for every download stat. It worked for the dev server but was incompatible with `output: 'export'` (Next.js's static export — the deploy target is GitHub Pages). When the build started failing on this route, the first attempt at fixing it baked download counts at build time (a script + `lib/package-downloads.generated.ts`). The user pushed back: they wanted live freshness preserved, with sessionStorage caching as the existing design did.

Reverting to client-side fetching meant solving CORS for PyPI and Docker Hub, both of which block cross-origin browser requests. Three options were considered:

1. **Self-hosted Cloudflare Worker** — owned, free tier covers >>traffic. Requires a `wrangler` deploy outside the main repo.
2. **Public CORS proxy** — third-party dependency. `corsproxy.io` was the first try; their free tier tightened in 2025 and now requires a paid key for production-domain requests. `api.codetabs.com/v1/proxy/?quest=…` works, free, no key.
3. **Bake at build, refresh on each deploy** — what the previous fix did; user rejected.

We picked (2) because it's zero-infra and works today; the in-code documentation includes a self-hosting Cloudflare Worker template (Decision 4) so the migration is a one-constant change if codetabs ever follows corsproxy.io's path.

The acquired-company gating and the seoDescription field are independent improvements; both surfaced from the audit re-run after the metrics rework. Bundled here because they all live in the same data layer (`lib/companies.ts`, `lib/team.ts`, `lib/github-stats.ts`) and ship together cleanly.

## Goals / Non-Goals

**Goals**

1. Live freshness of portfolio stats preserved (no daily/weekly staleness from bake-at-build).
2. `pnpm build` produces a clean static export (no API routes).
3. Acquired companies don't show misleading "live" tracking; static facts still render.
4. `<meta name="description">` and `og:description` use a tight, SERP-friendly version on every team and company detail page.

**Non-Goals**

- Self-hosting a CORS proxy in this change. The codetabs URL is a single-constant swap if needed.
- Changing the visible card layout. The `# project` block still renders the same six rows; only the data sources and gating change.
- Rewriting the GHCR baked map mechanism. It stays manual + commented; a `scripts/scrape-ghcr-pulls.mjs` is referenced in the file's docstring but not in scope here.

## Decisions

### Decision 1: Live client-side fetch with mixed CORS strategies, not bake-at-build

`lib/github-stats.ts` calls four upstreams:

- `api.github.com/repos/<owner>/<repo>` — direct (CORS-allowed)
- `api.npmjs.org/downloads/point/last-month/<pkg>` — direct (CORS-allowed)
- `pypistats.org/api/packages/<pkg>/recent` — proxied (CORS-blocked)
- `hub.docker.com/v2/repositories/<name>/` — proxied (CORS-blocked)
- GHCR — has no public JSON API at all (HTML-only); read from baked `CONTAINER_PULLS` map

The proxy is `https://api.codetabs.com/v1/proxy/?quest=<encoded-target>`. The trailing slash on `/v1/proxy/` skips a 301 that would otherwise add a redirect on every call.

**Why not bake-at-build**: stale numbers degrade the page; the user's stated preference is freshness.

**Why mixed strategies, not "everything through the proxy"**: when an upstream allows CORS directly, going through a third-party proxy adds latency and a third-party SPOF for no benefit. Direct-where-possible is the right hygiene.

### Decision 2: sessionStorage cache, 1h TTL, keyed on `<github>|<package>`

Cached entry shape: `{ ts, data: CompanyStats }`. On read, expired entries return null and trigger a fresh fetch. On write, swallow `QuotaExceededError` silently — cache is best-effort.

**Why sessionStorage, not localStorage**: stats refresh on a new visit; long-tail users coming back after weeks shouldn't see weeks-stale numbers. 1h TTL within a session is the tradeoff.

**Why 1h**: tested empirically — visitors flipping between portfolio cards in the same browse session benefit from the cache; longer TTL doesn't add value because most sessions are short.

### Decision 3: GHCR pulls baked, not scraped at runtime

`lib/container-pulls.generated.ts` is a hand-edited TypeScript map: `Record<string, number>`. Updated by visiting `https://github.com/<owner>/<repo>/pkgs/container/<repo>` and reading the `Total downloads` value (visible in the rendered HTML, no JSON API).

**Why not scrape at runtime**: github.com blocks CORS and has no JSON endpoint for container pulls. A server-side scrape would require a runtime proxy (already ruled out by Decision 1's static export).

**Why not auto-refresh at build**: a `scripts/scrape-ghcr-pulls.mjs` would do this. Out of scope; tracked as TODO in the file's docstring. Manual updates are fine for a portfolio of <20 GHCR-published companies that don't shift dramatically week-to-week.

### Decision 4: Acquired companies skip the live fetch entirely

`CompanyCard.tsx` computes `skipLiveFetch = !!company.acquiredBy || !!company.stealth`. When set:

- The `useEffect` returns early (no GitHub or download API call)
- `effectiveStats = { repo: null, download: null }` flows through `ProjectSection`
- The live `<Stat>` rows (stars, contributors, downloads) hit their existing `!loading && !value → null` branch, omitting them
- The static rows (license, language, firstCommit) still render from `Company` overrides

**Why combine acquired + stealth**: same trigger (no live tracking), same outcome (static-only render). Stealth handling is upstream of `ProjectSection` (StealthCard early-return), but the gate doubles up as a defensive belt-and-braces.

**Why static overrides matter**: without a live fetch, the GitHub API isn't called, so `repo.license`, `repo.language` are unavailable. The static `Company.license` and `Company.language` fields fill the gap. Keep gets `language: 'Python'` added; Graphcore gets `license: 'MIT'` + `language: 'C++'`.

### Decision 5: `seoDescription` is optional with a fallback chain, not required

The fallback order in `generateMetadata`:

1. `seoDescription` if set
2. `description` (TeamMember) or `about` (Company) if set
3. A name+role/company+oneLiner placeholder

**Why optional**: adding a required field would break compilation and require populating every entry before merge. Optional-with-fallback lets the field roll out incrementally; today every team member and every non-stealth company has one set, but a future entry can ship without and still get a description.

**Voice**: terse, factual, credibility-first. No hobbies, no life context. Lead with role + 1 distinctive credential or what-it-does line. Acquired companies append `Acquired by X.`; pre-commit companies append `Backed by the >commit team before the fund.`

**Length target**: ~110-150 chars. Below 100 reads as too short; above 160 gets truncated by Google's desktop SERP.

## Risks / Trade-offs

- **Codetabs as third-party SPOF**: if codetabs goes down or rate-limits, PyPI and Docker Hub stats fall back to "no stat" via the existing try/catch. Same UX as a missing GHCR baked count. Mitigation: self-host the Worker (Decision 4 in the geo-optimization design references this).
- **Live numbers vary on each card load**: the cache absorbs this within a session, but cross-session views see different numbers. Acceptable — that's the point of "live."
- **GHCR drift**: baked count goes stale between manual refreshes. Today's drift on Sourcebot was ~0.6% (`410k` baked vs `412.5k` live) over ~24h. Acceptable for a multi-week deploy cadence.
- **Acquired companies that *aren't* dormant**: edge case. If an acquired company keeps its repo active (e.g., the acquirer maintains it), the live numbers would still be relevant. Today neither Keep nor Graphcore fits this — both are dormant or near-dormant. If a future acquired company is alive, we'd revisit the gate.
- **`seoDescription` drift**: people will update the long-form bio and forget the short one. Mitigation: documented fallback chain (long form is shippable if short isn't); periodic audit can catch drift.

## Migration Plan

Retroactive — code already shipped. The three new capabilities land in `openspec/specs/` after this change applies.

For future portfolio additions:

- New active-Fund-I company: provide all the usual fields plus `seoDescription` (140 char target) and the standard `# project` static fields (`firstCommit`, `license`, `language`).
- New pre-commit entry: same plus `thankInsight` and the founder list.
- New acquired company: set `acquiredBy: 'X'` and ensure `license` + `language` are baked (since the live fetch is skipped).
- New stealth entry: just `stealth: true` and the minimal fields per the stealth-portfolio capability.

## Open Questions

1. Should `acquired-company-tracking` further suppress the GitHub link in the header? Today the `(acq. X)` tag conveys the lifecycle but the GitHub link still renders. A reasonable argument exists either way.
2. When does `firstCommit` start to feel stale? Today every entry has one; if a 2019 commit shows on a 2026 page it might warrant pairing with an "active since" or "acquired in YYYY" rider.
