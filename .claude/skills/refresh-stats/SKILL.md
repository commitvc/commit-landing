---
name: refresh-stats
description: Refresh the baked portfolio stats (GitHub stars/forks/contributors, npm/PyPI downloads, Docker/GHCR pulls, release and app downloads) in lib/stats.generated.ts, sanity-check the diff, and open a PR. Use when the user asks to refresh, update or check the company stats, download counts or Docker pulls, or before a deploy when the committed numbers are stale.
---

# Refresh the baked portfolio stats

## How stats reach the site

- `scripts/fetch-stats.mjs` writes `lib/stats.generated.ts`. It runs as `pnpm prebuild`, so **every Vercel deploy already refetches** before `next build`. A fetch that fails falls back to the committed value for that company.
- The committed file is therefore the **fallback**, not the live source. If it goes stale, any deploy that hits a rate limit (pypistats 429s are common, and Vercel builds run without a `GITHUB_TOKEN`) ships months-old numbers for that company. This skill keeps the fallback fresh.
- In the browser, `lib/github-stats.ts` re-fetches GitHub repo stats, `npm:` and `gh-releases:` on page load. Everything else (pypi, docker, ghcr, gh-installers) stays at the baked value until the next deploy.

## Steps

1. Branch from an up-to-date `main` (never commit on `main`).
2. Run `pnpm fetch-stats`. Locally it authenticates with `gh auth token`.
3. Read every `[fetch-stats]` line. A line saying "kept previous" means that value was **not** refreshed. pypistats rate-limits per IP: run the script again a minute later. Don't edit the generated file by hand.
4. Review `git diff lib/stats.generated.ts` before committing. Stop and report to the user, rather than committing, if you see:
   - **A drop** in a cumulative count (docker, ghcr, gh-releases, gh-installers). These only ever go up, so a drop means the source moved, was renamed or now paginates differently.
   - **A monthly count (npm, pypi) moving more than ~3× either way.** It can be real, but check the registry page first.
   - **A `language` or `license` flip**, or `repo: null`. These usually mean the repo was restructured, archived or made private. A language-detection quirk gets a `language` override in `lib/companies.ts`, but only after checking the repo's real source.
   - **A company that has disappeared from the file.** That's expected only for stealth entries and frozen acquisitions (`acquiredBy` without `keepLiveStats`).
5. Run `pnpm lint` and `pnpm typecheck`. The script formats the output with Biome, so lint should be clean.
6. Commit `lib/stats.generated.ts` alone as `chore: refresh baked portfolio stats`. Put a short table of the notable moves in the body. Open a PR.

## Choosing a download source for a company

Set `package` on the company in `lib/companies.ts`. The prefixes are documented on `PackageRef`. Rule of thumb: pick the channel most real users install from, and count installs, not update traffic.

- `npm:` / `pypi:`: monthly downloads of a library or CLI published to that registry.
- `docker:` / `ghcr:`: cumulative pulls for self-hosted servers.
- `gh-releases:`: all release assets, for CLIs shipped as prebuilt binaries. It returns nothing if the repo has more than 100 releases.
- `gh-installers:`: desktop apps. It counts only `.dmg/.exe/.msi/.AppImage/.deb/.rpm` across all pages of stable releases. Use it instead of `gh-releases:` for Electron apps, where auto-update `.yml` and `.zip` traffic would inflate the count about 30×.

A new prefix needs changes in three places: `PackageRef` in `lib/companies.ts`, `DownloadKind` and `downloadLabel` in `lib/github-stats.ts`, and `fetchDownload` in `scripts/fetch-stats.mjs`.
