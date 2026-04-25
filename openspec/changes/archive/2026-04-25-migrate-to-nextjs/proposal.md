## Why

The site is a single 2000-line `index.html` with inline JS, a hand-rolled tab router
built on `sessionStorage`, and eight duplicated per-post blog HTML files. Shipping
features (new portfolio company, new blog post, new tab) requires editing
parallel places, there is no type safety, no CI, and every new piece of chrome
(nav, logo, RRW button) is re-injected by `shared/nav.js` via string concatenation.

Migrating to Next.js 15 (App Router) with TypeScript gives us:

- Real component reuse for the nav, ASCII logo, prompt bar, cards, etc.
- Per-route metadata and structured data instead of one monolithic `<head>`
- A typed data layer (team, portfolio, blog) so content changes stop requiring
  edits in two files
- MDX blog posts with frontmatter, replacing the duplicated HTML-per-post pattern
- Real URLs (`/companies`, `/team`, `/about`, `/blog`) — kills the
  `sessionStorage.setItem('initTab')` redirect hack
- Static export to `out/` preserves the existing GitHub Pages + `CNAME` deploy

The terminal UX stays byte-for-byte identical (same commands, same easter eggs,
same boot animation, same prompt).

## What Changes

### Stack
- Next.js 15 App Router, React 19, TypeScript strict
- Static export (`output: 'export'`, `trailingSlash: true`) — GitHub Pages compatible
- pnpm, Node 22 LTS (`.nvmrc`)
- Biome for lint + format
- CSS Modules + CSS custom properties (theme palette centralized)
- MDX for blog posts
- Playwright smoke tests (5 tab routes + terminal happy path)
- PostHog via a `PostHogProvider` client component (kept)
- OpenSpec workflow kept for future changes

### Routes (all preserved, no 301s)
- `/` — CLI / terminal (default tab)
- `/cli` — alias of `/` (canonical = `/`)
- `/companies` — Portfolio tab
- `/team` — Team tab
- `/about` — About tab
- `/blog` — Blog index
- `/blog/[slug]` — 8 MDX posts
- `/about/legal` — meta-refresh + fallback link to `redriverwest.com/legal`
- `not-found.tsx` — 404

### Components (new)
- `<AsciiLogo />` — ASCII "commit" logo, shared between nav + neofetch
- `<NavBar />` — tab row with animated active-tab dash indicator
- `<RedRiverButton />` — top-right corner RRW button
- `<Terminal />` — output pane + PromptBar + boot animation host
- `<PromptBar />` — `user@commit.fund > _` input (history, autocomplete, cursor)
- `<Neofetch />` — collapsible intro card
- `<BootAnimation />` — boot sequence (respects `prefers-reduced-motion`)
- `<FileTree />` — tree navigator for non-CLI tabs
- `<ProfileCard />`, `<PortfolioCard />`, `<BlogPostCard />`

### Data layer (typed, single source of truth)
- `lib/filesystem.ts` — virtual FS as typed tree
- `lib/team.ts`, `lib/portfolio.ts` — structured records replacing runtime
  parsing of `.txt` files
- `content/blog/*.mdx` — blog posts with frontmatter (title, author, date,
  description, slug)
- `lib/commands.ts` — pure command dispatcher returning React nodes
- `lib/tea.ts` — Tea cipher, typed

### Quality upgrades bundled in
- Real `<Link>` + `<a>` navigation, `aria-current="page"` on active tab
- `prefers-reduced-motion` fallbacks for boot / neofetch / tab-indicator animations
- `app/sitemap.ts` + `app/robots.ts` auto-generated
- JSON-LD centralized in `app/layout.tsx`
- `next/font/local` for the MesloLGS NF font (subset to woff2 where feasible,
  fallback to the existing `font.ttf` if the box-drawing glyphs don't survive
  subsetting)
- GitHub Action: Biome + `tsc --noEmit` + Playwright + deploy `out/` to Pages
- GitHub portfolio stats kept as client-side fetch on mount (unchanged behavior)

## Capabilities

### New Capabilities
- `nextjs-app` — Next.js 15 App Router scaffold, TS strict, CSS Modules, static export
- `ascii-logo` — shared ASCII logo component
- `nav-bar` — tab navigation with animated active-tab indicator + real routing
- `prompt-bar` — typed input component with history, autocomplete, blinking cursor
- `terminal` — terminal page composing prompt + output + boot + neofetch
- `blog-mdx` — MDX-based blog with frontmatter and `generateStaticParams`
- `tab-routes` — `/cli`, `/companies`, `/team`, `/about`, `/blog` as first-class routes
- `static-export-deploy` — GitHub Actions build + export + Pages deploy

### Modified Capabilities
- `tab-nav` — replaced by `nav-bar` (active state via `aria-current`, not
  `class="active"`, real links for all tabs)
- `prompt-format` — unchanged behavior, reimplemented in `<PromptBar />`
- `whois-command`, `pre-commit-folder`, `rrw-and-linkedin` — unchanged behavior,
  reimplemented in TypeScript; specs remain authoritative

## Impact

- Replaces `index.html`, `shared/nav.js`, `about/index.html`, `team/index.html`,
  `cli/index.html`, `companies/index.html`, `blog/index.html` entirely
- Replaces `blog/*/index.html` × 8 with MDX files in `content/blog/`
- Replaces `about/legal/index.html` with a Next.js page doing meta-refresh
- Adds `app/`, `components/`, `lib/`, `content/`, `public/`, `styles/`,
  `tests/e2e/` directories
- Adds `package.json`, `pnpm-lock.yaml`, `next.config.mjs`, `tsconfig.json`,
  `biome.json`, `.nvmrc`, `playwright.config.ts`
- Assets (`favicon.jpeg`, `font.ttf`, `ButtonWebSitev2.png`, `card.png`,
  `portfolio/**`, `team/**`) move to `public/` — URLs preserved
- `CNAME` moved to `public/CNAME`
- New GitHub Action `.github/workflows/deploy.yml`
- Legacy HTML files deleted at the end of phase 7
