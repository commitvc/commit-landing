# commit-landing

The source for [commit.fund](https://commit.fund). Next.js 15 App Router, static
export, deployed by Vercel.

## Develop

```sh
pnpm install
pnpm dev            # http://localhost:3000
```

Node is pinned to 22 via `.nvmrc`. Package manager is pnpm.

## Quality gates

```sh
pnpm lint           # Biome
pnpm typecheck      # tsc --noEmit
pnpm test:e2e       # Playwright smoke tests (builds + serves locally)
pnpm build          # static export to out/
```

All four run in CI on every push.

## Content

- **Team**: [`lib/team.ts`](lib/team.ts) — typed records.
- **Portfolio**: [`lib/portfolio.ts`](lib/portfolio.ts).
- **About text**: [`lib/about.ts`](lib/about.ts).
- **Blog posts**: [`content/blog/*.mdx`](content/blog) — frontmatter-driven.
  New posts appear on the index and terminal automatically.
- **Virtual filesystem** (for the terminal): derived from the above via
  [`lib/filesystem.ts`](lib/filesystem.ts) — one source of truth.

## Architecture

Routes (all statically exported, trailing slash preserved):

| URL | File |
|---|---|
| `/`, `/cli/` | terminal (client-side state) |
| `/companies/` | portfolio cards + pre-commit history |
| `/team/` | member cards + advisors |
| `/about/` | readme + projects + contact |
| `/about/legal/` | redirect to redriverwest.com/legal |
| `/blog/` | index |
| `/blog/[slug]/` | MDX post, one route per file in `content/blog/` |

Shared chrome in [`components/`](components):

- `<AsciiLogo />` — source of truth for the commit logo.
- `<NavBar />` — 5 tabs, animated active-tab indicator, `aria-current="page"`,
  respects `prefers-reduced-motion`.
- `<RedRiverButton />` — top-right RRW button.
- `<Terminal />`, `<PromptBar />`, `<Neofetch />`, `<BootAnimation />` —
  the terminal experience. Commands dispatched via [`lib/commands.tsx`](lib/commands.tsx).

## Deploy

Vercel (project `commit-landing`, team `red-river-west`) builds and serves the
site: a preview per PR, production on `main`. Domains — apex 308s to
`www.commit.fund` — are configured in Vercel, not in the repo.

GitHub Actions only validates: [`ci.yml`](.github/workflows/ci.yml) runs
lint + typecheck + Playwright + `pnpm build` on every push and PR, and
publishes nothing. A green Actions run therefore does *not* mean the deploy
landed — check the Vercel commit status for that.

Portfolio stats are baked in at build time by `scripts/fetch-stats.mjs`, so
they only move when a build runs; the checked-in `lib/stats.generated.ts` is
the fallback.

## Specs

The migration and every component's contract are captured under
[`openspec/`](openspec). See
[`openspec/changes/migrate-to-nextjs/`](openspec/changes/migrate-to-nextjs) for
the design doc and capability specs.
