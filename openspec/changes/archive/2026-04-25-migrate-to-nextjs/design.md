# Design — Migrate to Next.js

## Directory layout (post-migration)

```
/
├── app/
│   ├── layout.tsx                 # root layout, fonts, JSON-LD, PostHog provider, RRW button, NavBar
│   ├── page.tsx                   # CLI / terminal (default)
│   ├── cli/page.tsx               # re-exports app/page's Terminal (canonical = /)
│   ├── companies/page.tsx         # Portfolio tab
│   ├── team/page.tsx              # Team tab
│   ├── about/page.tsx             # About tab
│   ├── about/legal/page.tsx       # meta-refresh → redriverwest.com/legal
│   ├── blog/page.tsx              # Blog index (cards)
│   ├── blog/[slug]/page.tsx       # MDX post (generateStaticParams)
│   ├── not-found.tsx              # 404
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── ascii-logo/                # AsciiLogo.tsx + AsciiLogo.module.css
│   ├── nav-bar/                   # NavBar.tsx, NavIndicator.tsx, NavBar.module.css
│   ├── red-river-button/
│   ├── terminal/                  # Terminal.tsx, PromptBar.tsx, Neofetch.tsx, BootAnimation.tsx
│   ├── file-tree/
│   ├── cards/                     # ProfileCard, PortfolioCard, BlogPostCard
│   └── posthog-provider.tsx
├── lib/
│   ├── filesystem.ts              # typed virtual FS
│   ├── team.ts                    # TeamMember[] — source of truth
│   ├── portfolio.ts               # PortfolioCompany[] — source of truth
│   ├── blog.ts                    # getAllPosts() reading content/blog/*.mdx frontmatter
│   ├── commands.ts                # Command dispatcher
│   ├── tea.ts                     # Tea cipher (class static methods)
│   └── github-stats.ts            # client-side repo-stats fetcher
├── content/
│   └── blog/
│       ├── next-decade.mdx
│       ├── licenses.mdx
│       ├── community-value.mdx
│       ├── europe-sovereignty.mdx
│       ├── browser-redefined.mdx
│       ├── projet-product-fit.mdx
│       ├── project-to-market.mdx
│       └── french-coss.mdx
├── public/
│   ├── CNAME
│   ├── favicon.jpeg
│   ├── font.ttf                   # retained as fallback if subset fails
│   ├── ButtonWebSitev2.png
│   ├── card.png
│   ├── portfolio/**
│   └── team/**
├── styles/
│   ├── globals.css                # CSS variables, font-face, base reset
│   └── terminal.module.css        # shared terminal tokens
├── tests/e2e/
│   └── smoke.spec.ts
├── .github/workflows/deploy.yml
├── biome.json
├── next.config.mjs
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
├── playwright.config.ts
└── .nvmrc
```

## Routing map (old → new)

| Old URL | New route | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Terminal, unchanged UX |
| `/cli/` | `app/cli/page.tsx` | renders same `<Terminal />`; canonical `/` |
| `/companies/` | `app/companies/page.tsx` | was `sessionStorage` redirect |
| `/team/` | `app/team/page.tsx` | was `sessionStorage` redirect |
| `/about/` | `app/about/page.tsx` | was `sessionStorage` redirect |
| `/about/legal/` | `app/about/legal/page.tsx` | meta-refresh + link to RRW legal |
| `/blog/` | `app/blog/page.tsx` | cards index |
| `/blog/<slug>/` | `app/blog/[slug]/page.tsx` | MDX body |
| 404 | `app/not-found.tsx` | replaces `404.html` |

`trailingSlash: true` in `next.config.mjs` preserves the trailing-slash URLs
already indexed.

## Component contracts

### `<AsciiLogo />`
```ts
type Props = {
  href?: string;           // optional wrap in <Link>; default = "/"
  className?: string;
  ariaLabel?: string;      // default = "commit"
};
```
Renders the 5-line ASCII block. Source of truth for the logo art — used by
`<NavBar />` and `<Neofetch />`.

### `<NavBar />`
```ts
type Tab = { id: TabId; label: string; href: Route };
type Props = { tabs: Tab[] };  // active tab derived from usePathname()
```
- Each tab is an `<a>` wrapped by `next/link`
- Active tab gets `aria-current="page"`, not `.active`
- Dash-indicator animates to active tab via `getBoundingClientRect` on mount +
  route change; respects `prefers-reduced-motion` (snap, no transition)

### `<PromptBar />`
```ts
type Props = {
  prompt: string;                  // e.g. "user@commit.fund"
  cwd: string;                     // appended to prompt
  onSubmit: (line: string) => void;
  suggest: (input: string) => string[];
  disabled?: boolean;              // true during boot animation
};
```
- Auto-resizing input, blinking cursor positioned at text end
- Up/Down arrow → history
- Tab → autocomplete (uses `suggest`)
- Enter → `onSubmit`, clears input

### `<Terminal />`
Owns: output lines, cwd state, command history, `<PromptBar />`, `<Neofetch />`,
`<BootAnimation />`. Delegates command dispatch to `lib/commands.ts`.
Output lines are React nodes (not HTML strings) — solves the xss-via-string
patterns in the legacy code.

### `<FileTree />`
Renders a typed `FsNode` tree as an expandable list. Shared between
`/companies`, `/team`, `/about`, `/blog` tab pages for the non-terminal
navigation mode.

## Data shapes

```ts
// lib/filesystem.ts
export type FsNode =
  | { type: 'dir';  name: string; children: FsNode[] }
  | { type: 'file'; name: string; content: string };

// lib/team.ts
export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  location: string;
  github: string;
  linkedin?: string;
  avatar: string;        // /team/*.png
};

// lib/portfolio.ts
export type PortfolioCompany = {
  slug: string;
  company: string;
  oneLiner: string;
  website?: string;      // undefined = placeholder (greyed)
  github?: string;
  package?: string;      // npm:foo or pypi:foo, for stats
  story?: string;        // pre-commit companies
  avatar: string;
  folder: 'pre-commit' | 'active';
};

// content/blog/*.mdx frontmatter
export type BlogPost = {
  slug: string;
  title: string;
  author: string;
  date: string;          // ISO
  description: string;
};
```

`lib/filesystem.ts` derives the virtual FS tree from `team.ts`, `portfolio.ts`,
and `getAllPosts()` — one source of truth, no drift.

## Commands (ported verbatim, typed)

```ts
type Command = {
  name: string;
  description: string;
  hidden?: boolean;
  run: (args: string[], ctx: Ctx) => ReactNode | Promise<ReactNode>;
};
```

Ported: `ls`, `cat`, `cd`, `help`, `clear`, `decrypt`, `secret`, `whois`,
`neofetch` (hidden), `profile`, `portfolioProfile`, `blogPost`, `legalNotice`,
`email` (interactive). Same dispatch order, same output, same easter eggs.

## Deployment

`next.config.mjs`:
```js
export default {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
};
```

GitHub Action (`.github/workflows/deploy.yml`):
1. checkout
2. `actions/setup-node@v4` with `.nvmrc`
3. `pnpm install --frozen-lockfile`
4. `pnpm biome check .`
5. `pnpm tsc --noEmit`
6. `pnpm playwright test` (against `pnpm build && pnpm exec serve out/`)
7. On `main`: `pnpm build` → upload `out/` → `actions/deploy-pages@v4`

## Accessibility additions

- All nav tabs are `<a>`, focusable, with `aria-current="page"` on active
- Terminal input has `aria-label="Terminal command input"`
- `role="log" aria-live="polite"` on output pane so screen readers announce
  command results
- `prefers-reduced-motion: reduce` disables boot scroll, tab-indicator
  transition, and cursor blink
- Color contrast audited (current palette already passes AA on body text)

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Font subsetting breaks box-drawing characters used in the nav separator | Build-time check: render separator, compare against reference; fall back to full `font.ttf` if any glyph missing |
| GitHub Pages loses trailing-slash canonical URLs | `trailingSlash: true` in config; Playwright smoke asserts `/blog/licenses/` returns the MDX body |
| PostHog init blocks first paint | Load via `next/script strategy="afterInteractive"` inside `PostHogProvider` |
| Terminal HTML-string output gets XSS'd when ported naively to React | Output nodes are React elements from day one; no `dangerouslySetInnerHTML` except for pre-sanitized blog MDX |
| GH API rate-limit on portfolio pages | Client-side only, on-mount, with `sessionStorage` cache (TTL 1h); already how it works today but we'll add the cache |
