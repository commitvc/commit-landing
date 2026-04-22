# Spec — static-export-deploy

## Purpose
The site builds to a fully static `out/` directory and deploys to GitHub
Pages via a GitHub Action on every push to `main`.

## Requirements

- `pnpm build` MUST produce an `out/` directory ready to serve as a static site.
- `out/CNAME` MUST contain `commit.fund`, identical to the current root `CNAME`.
- The GitHub Action (`.github/workflows/deploy.yml`) MUST:
  1. check out the repo
  2. set up Node from `.nvmrc`
  3. install dependencies with `pnpm install --frozen-lockfile`
  4. run `pnpm biome check .`
  5. run `pnpm tsc --noEmit`
  6. run `pnpm playwright test` against a built site (`pnpm build` + local serve)
  7. on `main`: upload `out/` as a Pages artifact and deploy via
     `actions/deploy-pages@v4`
- MUST fail the build if Biome, tsc, or Playwright fail.
- MUST NOT deploy from non-`main` branches.
- Preview-URL artifacts for PRs MAY be added in a follow-up (out of scope here).

## Non-goals
- Vercel preview deploys. Staying on GitHub Pages per user decision.
