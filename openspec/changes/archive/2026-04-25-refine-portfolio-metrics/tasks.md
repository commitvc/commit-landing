## 1. Remove the broken API route

- [x] 1.1 Delete `app/api/package-downloads/route.ts`
- [x] 1.2 Delete the now-empty `app/api/` directory
- [x] 1.3 Confirm `pnpm build` passes (was failing on this route)

## 2. Live fetching with mixed CORS strategies

- [x] 2.1 In `lib/github-stats.ts`: `fetchRepo` calls `api.github.com/repos/<owner>/<repo>` directly
- [x] 2.2 `npmLastMonth` calls `api.npmjs.org/...` directly
- [x] 2.3 `pypiLastMonth` calls `pypistats.org/...` via `https://api.codetabs.com/v1/proxy/?quest=...`
- [x] 2.4 `dockerPullCount` calls `hub.docker.com/v2/...` via the same proxy
- [x] 2.5 `ghcr:` packages read from `lib/container-pulls.generated.ts` baked map
- [x] 2.6 sessionStorage cache (1h TTL) keyed on `<github>|<package>` wraps the parallel fetch
- [x] 2.7 Cache reads handle expired entries (return null → fresh fetch)
- [x] 2.8 Cache writes swallow `QuotaExceededError` silently
- [x] 2.9 File header comment documents the CORS strategy and Cloudflare-Worker self-hosting alternative

## 3. Acquired-company tracking gate

- [x] 3.1 In `CompanyCard.tsx`: compute `skipLiveFetch = !!company.acquiredBy || !!company.stealth`
- [x] 3.2 The `useEffect` returns early when `skipLiveFetch`
- [x] 3.3 Pass `effectiveStats = skipLiveFetch ? { repo: null, download: null } : stats` to `ProjectSection`
- [x] 3.4 `hasAnyProjectInfo` re-computed to honour the gate (skip live triggers when only github/package would have rendered something)
- [x] 3.5 Add `language: 'Python'` to `keep` in `lib/companies.ts`
- [x] 3.6 Add `license: 'MIT'`, `language: 'C++'` to `graphcore` in `lib/companies.ts`

## 4. GHCR baked count refresh

- [x] 4.1 Update `lib/container-pulls.generated.ts` Sourcebot entry from `410_000` to `412_574`
- [x] 4.2 Update the file's "Scraped YYYY-MM-DD" comment

## 5. seoDescription field

- [x] 5.1 Add `seoDescription?: string` to the `TeamMember` type in `lib/team.ts` (with docstring)
- [x] 5.2 Populate `seoDescription` for all 4 team members (~110-125 chars each)
- [x] 5.3 Add `seoDescription?: string` to the `Company` type in `lib/companies.ts` (with docstring)
- [x] 5.4 Populate `seoDescription` for all non-stealth companies (~110-150 chars each)
- [x] 5.5 In `app/(chrome)/(tabs)/team/[slug]/page.tsx`: `description` falls back `seoDescription → description → name+role placeholder`
- [x] 5.6 In `app/(chrome)/(tabs)/companies/[slug]/page.tsx`: same fallback chain (after the stealth special case)
- [x] 5.7 In `app/(chrome)/(tabs)/companies/pre-commit/[slug]/page.tsx`: same fallback chain

## 6. Verification

- [x] 6.1 Open a non-acquired non-stealth company page → `# project` block shows live stars/forks/contributors/downloads
- [x] 6.2 Open an acquired company page → `# project` block shows only static facts (license, language, firstCommit)
- [x] 6.3 Open a stealth page → no `# project` block (StealthCard early-return)
- [x] 6.4 Inspect Network tab on an acquired company page → no api.github.com call, no codetabs call
- [x] 6.5 `pnpm build` passes (no API route to break)
- [x] 6.6 `pnpm typecheck` and `pnpm exec biome check` clean
