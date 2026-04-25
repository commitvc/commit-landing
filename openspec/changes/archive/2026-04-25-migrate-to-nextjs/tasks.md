# Tasks — Migrate to Next.js

## Phase 1 — Scaffold
- [ ] `package.json`, `pnpm-lock.yaml` (Next 15, React 19, TS 5.x, MDX, Biome, Playwright)
- [ ] `tsconfig.json` (strict)
- [ ] `next.config.mjs` (`output: 'export'`, `trailingSlash: true`, unoptimized images, MDX config)
- [ ] `biome.json`
- [ ] `.nvmrc` → `22`
- [ ] `styles/globals.css` (CSS vars, `@font-face`, base reset) — palette extracted from current `index.html`
- [ ] Move assets: `favicon.jpeg`, `font.ttf`, `ButtonWebSitev2.png`, `card.png`, `CNAME`, `portfolio/`, `team/` → `public/`
- [ ] `app/layout.tsx` — minimal, renders children
- [ ] `app/page.tsx` — "hello" placeholder
- [ ] `pnpm build` passes, `out/` generated

## Phase 2 — Shared chrome
- [ ] `components/ascii-logo/` with static art constant + `.module.css`
- [ ] `components/nav-bar/` with animated dash indicator, `usePathname` for active, `aria-current="page"`
- [ ] `components/red-river-button/`
- [ ] `components/posthog-provider.tsx` (client, `afterInteractive`)
- [ ] `app/layout.tsx` wires: JSON-LD, `next/font/local` MesloLGS NF, PostHog provider, RRW button, NavBar
- [ ] `app/sitemap.ts`, `app/robots.ts`
- [ ] Snapshot test: nav renders 5 tabs, active = `/`

## Phase 3 — Static tab pages
- [ ] `lib/team.ts` — 4 members extracted from current `index.html` FS
- [ ] `lib/portfolio.ts` — 10 pre-commit + 3 active companies, same
- [ ] `lib/filesystem.ts` — derives FS tree from team/portfolio/blog data
- [ ] `components/file-tree/` — expandable tree navigator
- [ ] `components/cards/ProfileCard.tsx`, `PortfolioCard.tsx` (with GH stats mount)
- [ ] `lib/github-stats.ts` — client fetch w/ `sessionStorage` 1h cache
- [ ] `app/team/page.tsx`, `app/companies/page.tsx`, `app/about/page.tsx`

## Phase 4 — Blog
- [ ] Install `@next/mdx`, `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`
- [ ] Convert 8 blog posts to `content/blog/*.mdx` (preserve headings, OG tags, canonical URLs, dates)
- [ ] `lib/blog.ts` — `getAllPosts()`, `getPost(slug)` reading frontmatter
- [ ] `components/cards/BlogPostCard.tsx`
- [ ] `app/blog/page.tsx` — index
- [ ] `app/blog/[slug]/page.tsx` + `generateStaticParams` + `generateMetadata`
- [ ] Article JSON-LD per post

## Phase 5 — Terminal
- [ ] `lib/tea.ts` — Tea cipher ported, typed, unit-tested
- [ ] `lib/commands.ts` — command dispatcher, all commands returning React nodes
- [ ] `components/terminal/PromptBar.tsx` — input, cursor, history, autocomplete
- [ ] `components/terminal/Terminal.tsx` — output pane, cwd state, dispatches commands
- [ ] `components/terminal/Neofetch.tsx` — collapsible card
- [ ] `app/page.tsx` + `app/cli/page.tsx` render `<Terminal />`
- [ ] Parity check vs legacy index.html: same commands, same output strings

## Phase 6 — Animations
- [ ] `components/terminal/BootAnimation.tsx` — boot sequence, `prefers-reduced-motion` aware
- [ ] Neofetch intro animation
- [ ] NavBar indicator animation (already in phase 2, tune here)
- [ ] Cursor blink — CSS animation, paused on reduced-motion

## Phase 7 — Polish & cutover
- [ ] `app/not-found.tsx` — 404
- [ ] `app/about/legal/page.tsx` — meta-refresh + link fallback
- [ ] A11y sweep: focus-visible, landmarks, aria-live log, color contrast
- [ ] Lighthouse pass on `/`, `/blog`, `/blog/licenses/`
- [ ] `tests/e2e/smoke.spec.ts` — visits 5 tabs, runs `ls`, `cat`, `help`, `clear`
- [ ] `.github/workflows/deploy.yml` — lint, tsc, Playwright, build, deploy `out/` to Pages
- [ ] Delete legacy files: `index.html`, `404.html`, `shared/`, `about/`, `blog/`, `cli/`, `companies/`, `team/index.html`
- [ ] Update root `README.md` with dev + deploy instructions
- [ ] Merge `migrate/nextjs` → `main`, first production deploy
