## 1. Blog Tab in Terminal

- [x] 1.1 Add `blog` tab to tab bar (between Companies and Team)
- [x] 1.2 Add `blog` to `switchTab()` valid tabs, wire `renderBlog()` to `renderTabTree("blog")`
- [x] 1.3 Add `blog/` directory to virtual filesystem with 8 post `.txt` entries

## 2. Blog Post Renderer

- [x] 2.1 Implement `blogPost` renderer — parses title (line 1), byline (line 2), description (after blank line), auto-derives URL from filename (`/blog/<slug>/`)
- [x] 2.2 Route blog `.txt` files in `viewFile()` and `cat` dispatch

## 3. Blog Post `.txt` Format

Each post follows:
```
Title text
by Author, on Date

Description text.
```

Posts:
- [x] 3.1 `next-decade.txt` — Abel Samot, Oct 29 2025
- [x] 3.2 `licenses.txt` — Abel Samot, Mar 26 2025
- [x] 3.3 `community-value.txt` — Olivier Huez, May 7 2025
- [x] 3.4 `europe-sovereignty.txt` — Abel Samot, Feb 13 2025
- [x] 3.5 `browser-redefined.txt` — Olivier Huez, Dec 22 2025
- [x] 3.6 `projet-product-fit.txt` — Max Corbani, Jun 3 2025
- [x] 3.7 `project-to-market.txt` — Max Corbani, Jun 30 2025
- [x] 3.8 `french-coss.txt` — Max Corbani, Jan 5 2023

## 4. Static Blog Post Pages

Each at `blog/<slug>/index.html` with:
- Same layout as legal page (inline CSS, HTML-entity ASCII art, RRW button, tab bar with Blog active)
- SEO metadata, schema.org JSON-LD, canonical URL
- Tab links use clean paths (`/cli`, `/companies`, etc.)
- "Originally published on Substack/mxcrbn.com" footer

- [x] 4.1 `blog/next-decade/index.html`
- [x] 4.2 `blog/licenses/index.html`
- [x] 4.3 `blog/community-value/index.html`
- [x] 4.4 `blog/europe-sovereignty/index.html`
- [x] 4.5 `blog/browser-redefined/index.html`
- [x] 4.6 `blog/projet-product-fit/index.html`
- [x] 4.7 `blog/project-to-market/index.html`
- [x] 4.8 `blog/french-coss/index.html`

## 5. `?tab=` Deep-Linking (replaced by clean URL routing)

- [x] 5.1 Tab clicks use `history.pushState` to update URL to `/cli`, `/companies`, `/blog`, `/team`, `/about`
- [x] 5.2 Direct URL access via directory `index.html` redirects using `sessionStorage`
- [x] 5.3 `popstate` handler for browser back/forward
- [x] 5.4 `blog/index.html` redirects to landing with blog tab active

## 6. Tab Animation (collapse/expand)

- [x] 6.1 All tab clicks (including CLI) collapse boot messages + neofetch data to static-page layout
- [x] 6.2 Landing (`commit.fund`) shows full neofetch + CLI without collapse
- [x] 6.3 Direct subpage access (`/companies` etc.) skips boot animation, loads collapsed instantly
- [x] 6.4 CLI decoupled from neofetch: `#cli-output` lives outside `#terminal-output`
- [x] 6.5 Tab bar morphs between terminal style and static-page style (gap, opacity, full-width dashed line)

## 7. 404 Page

- [x] 7.1 `404.html` with shrunk header, no active tab, ASCII 404 in red, two-line message
- [x] 7.2 Known route redirects via `sessionStorage` for GitHub Pages
