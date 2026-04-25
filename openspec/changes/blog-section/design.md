## Context

commit.fund is a single `index.html` SPA — vanilla JS, no build tooling, no framework, hosted on GitHub Pages with a custom `CNAME`. The terminal UI embeds a virtual filesystem in JS. The existing tab-navigation change introduced a tab bar (cli / portfolio / team / about); blog becomes a fifth tab.

The core constraint is **SEO/GEO indexability**: the terminal SPA is not crawlable (content rendered by JS at runtime). Blog posts need to exist as real, static HTML files at stable URLs.

A second constraint is **rich rendering**: some posts need article-quality layout (images, headings, callouts, code blocks) that can't live inside the terminal's `<pre>` output.

## Goals / Non-Goals

**Goals:**
- Blog posts live at real, crawlable URLs (`commit.fund/blog/<slug>.html`)
- Blog index at `commit.fund/blog/` or `commit.fund/blog/index.html`
- Article pages carry full SEO metadata (title, description, canonical, OpenGraph, schema.org `Article` JSON-LD)
- Terminal `blog` tab lists posts as files — clicking a post opens its URL in a new tab
- Terminal `cat blog/<slug>.txt` shows a teaser excerpt; full post linked to its URL
- Blog pages inherit commit's visual identity (monospace, red accent, dark terminal aesthetic) via a shared `blog/style.css`
- Zero build tooling — authors write HTML directly or from a simple template

**Non-Goals:**
- CMS, Markdown pipeline, or static site generator (out of scope for now)
- Comments, reactions, or social features
- Search within the blog
- RSS feed (can be added later)
- Pagination (not needed at low post volumes)

## Decisions

### 1. Static HTML files over a JS-rendered blog

**Decision:** Each post is a standalone `.html` file in `blog/`.

**Why:** JS-rendered content requires Googlebot/crawler to execute JS and wait — unreliable. Static HTML is indexed immediately and without preconditions. GitHub Pages serves any `.html` file at its path, so `blog/my-post.html` is reachable at `commit.fund/blog/my-post.html` with no config.

**Alternatives considered:**
- *Hash-routing SPA (`#blog/slug`)* — URLs not indexable, fragments excluded from canonical URLs
- *Separate Next.js/Astro site* — overkill, introduces a build step and separate deploy
- *Server-rendered at edge* — requires moving off GitHub Pages

### 2. Shared `blog/style.css` + HTML template

**Decision:** A single `blog/style.css` is shared by `blog/index.html` and all post pages. Each post follows a minimal HTML template.

**Why:** Keeps visual consistency without duplicating styles, and gives authors a clear starting point. No preprocessor needed.

**Page layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [ASCII >commit logo]              [Red River West button]  │  ← header, horizontally centered as a unit
├─────────────────────────────────────────────────────────────┤
│  cli  │  portfolio  │  team  │  about  │  > blog           │  ← tab bar, blog tab active (red > prefix)
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  <article content>                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Post template fields:**
```
<title>, <meta description>, <meta og:*>, JSON-LD Article, <link rel="canonical">
<header> — ASCII >commit logo (top-left) + RRW red button (top-right), full row centered
<nav> — tab bar: cli / portfolio / team / about / blog, with blog marked active
<article> with <h1>, byline (author, date), body content
<footer> with copyright + commit.fund link
```

**Header detail:** The header mirrors the visual chrome of the terminal landing. The ASCII `>commit` wordmark (same art as `neofetch`, unchanged) sits left; the Red River West red button (`ButtonWebSitev2.png` or equivalent) sits right. The whole header container is `max-width`-constrained and centered, same as the article body. ASCII art scale is kept as-is initially — adjust after visual review.

**Tab bar on static pages:** Rendered as a static HTML `<nav>` — no JS required. `blog` tab carries the red `>` active indicator. The other tabs link back to `commit.fund` (the SPA handles their content). This gives visual continuity: a visitor who lands on a blog post via search sees the same navigation they'd see inside the terminal.

### 3. Blog posts render inline in the terminal; "Open in full page" CTA links to static URL

**Decision:** Clicking a blog post file in the terminal (tab tree or `cat`) renders the full post content inline inside the SPA — same as team profiles or portfolio cards. At the bottom of the inline-rendered post, a styled "Open in full page" button links to the static `blog/<slug>.html` URL (opens in a new tab).

**Why:** Visitors arriving from the landing page stay in context — they're already in the terminal, they navigated there via the filesystem, they should be able to read the post without leaving. The static page exists for external traffic (search, social, direct links), not as the primary reading surface for terminal users.

**Post `.txt` file format (in virtual filesystem):**
```
Title: ...
Date: YYYY-MM-DD
Excerpt: ...
URL: /blog/<slug>.html
```

The `viewFile()` handler for blog post `.txt` files renders a `blogPost` card (title, date, excerpt) with an "Open in full page" `<a>` button at the bottom pointing to the `URL:` field. The inline view is a **teaser only** — the full article body lives exclusively in the static HTML. Storing body content twice (`.txt` + `.html`) would create a maintenance burden. No `window.open()` on click — the button is explicit and user-initiated.

### 4. Blog tab as a fifth tab in the terminal

**Decision:** Add `blog` to the tab bar alongside cli / portfolio / team / about.

**Why:** Consistent with the existing navigation pattern. No new interaction paradigm needed.

**Tab behavior:** `renderBlog()` calls `renderTabTree("blog")`. File click renders inline via a `blogPost` renderer (see Decision 3).

### 6. Static page tab bar uses `?tab=<name>` to deep-link back into the SPA

**Decision:** On the static blog pages, the four non-blog tabs (`cli`, `portfolio`, `team`, `about`) link to `https://commit.fund/?tab=<name>`. The `index.html` SPA reads the `tab` query param on `DOMContentLoaded` and calls `switchTab()` with that value after boot.

**Why:** Without deep-linking, clicking "portfolio" on a static page just lands the user on the CLI tab — they'd have to click again. One-step navigation back to any section is achievable with a minimal SPA change (read one query param, no routing library needed). The `blog` tab on static pages is simply not a link (it's the current active context).

**SPA change:** Read `new URLSearchParams(window.location.search).get('tab')` and call `switchTab(value)` if valid — but this MUST happen inside the final boot `setTimeout` callback, after `renderWelcome()` has been called and the tab bar DOM exists. Placing it at the top level of `DOMContentLoaded` will fail silently because the tab bar won't be rendered yet.

### 5. SEO metadata strategy

**Decision:** Each post page includes:
- `<title>` — `{Post Title} | commit`
- `<meta name="description">` — excerpt (150–160 chars)
- `<link rel="canonical">` — full `https://commit.fund/blog/<slug>.html`
- OpenGraph: `og:title`, `og:description`, `og:url`, `og:type: article`, `og:image` (fallback to `card.png`)
- `<script type="application/ld+json">` — schema.org `Article` with `headline`, `datePublished`, `author`, `publisher`

**Why:** Covers Google, social link previews, and AI crawler structured data extraction (GEO).

## Risks / Trade-offs

- **Manual HTML authoring** — Posts must be hand-written HTML. Risk of inconsistency. → Mitigation: provide a copy-paste post template in `blog/template.html`
- **Virtual filesystem drift** — Post list in `index.html` must be manually kept in sync with actual `blog/` files. → Mitigation: this is low-frequency; document the convention in the template
- **No 404 handling for blog/** — GitHub Pages serves a 404 if `blog/index.html` doesn't exist. → Mitigation: always create `blog/index.html` as part of this change
- **Style divergence** — blog pages share no CSS with `index.html`. → Mitigation: `blog/style.css` defines the design tokens (colors, fonts) as CSS vars to match the terminal palette
- **Asset paths from `blog/`** — `ButtonWebSitev2.png`, `font.ttf`, and `favicon.jpeg` live at the repo root; all references from `blog/` files must use `../` prefix (`../ButtonWebSitev2.png`, `../font.ttf`, `../favicon.jpeg`)
- **`og:image` must be absolute** — social crawlers don't resolve relative paths; `og:image` must be `https://commit.fund/card.png`, not a relative path
- **`clear` resets tab state** — the `clear` command re-renders the welcome screen and resets `currentTab` to `"cli"`; the `?tab=` param is not re-applied. This is intentional (clear = hard reset) but should not be treated as a bug

## Open Questions

- Should `blog/index.html` also be reachable from the root site's nav (e.g., a subtle link in the terminal welcome message)?
- Do we want a `blog` command in the CLI (e.g., `blog` → prints post list with URLs)?
- First post content — what's the inaugural article? (Needed before launch, not before implementation)
