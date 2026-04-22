## Why

commit.fund has no web presence beyond the terminal landing — there's nowhere to publish thinking, thesis pieces, or founder-facing content. A blog section gives commit a surface for long-form writing that can be indexed by search engines and AI crawlers, building discoverability and brand over time.

## What Changes

- Add a `blog/` directory to the repo containing blog post HTML files
- Add a `blog/index.html` listing page as the blog home (`commit.fund/blog`)
- Each article lives at its own URL (`commit.fund/blog/<slug>.html`) for direct linking and indexing
- Add a `blog` tab to the terminal's tab bar, listing posts as files in the virtual filesystem
- Clicking a post in the `blog` tab opens it as a new browser tab (full-page HTML article)
- Terminal CLI: `cd blog`, `ls`, `cat <post>.txt` shows a teaser; full post opens via URL

## Capabilities

### New Capabilities

- `blog-tab`: Blog tab in the terminal — lists posts as files in the virtual filesystem, each linking to its full-page URL
- `blog-post-page`: Standalone HTML article pages with commit's visual identity (terminal aesthetics, custom typography, structured metadata for SEO/GEO)
- `blog-index-page`: Blog listing page at `/blog` — lists all posts with title, date, excerpt; crawlable by search engines

### Modified Capabilities

- `tab-navigation`: Add `blog` as a fifth tab alongside cli / portfolio / team / about

## Impact

- New files: `blog/index.html`, `blog/<slug>.html` per post, shared `blog/style.css`
- `index.html`: virtual filesystem gains a `blog/` directory; tab bar gains a `blog` tab
- No external dependencies — vanilla HTML/CSS, no build step required
- Structured data (`Article` schema.org JSON-LD) and canonical `<link>` tags on each post page
- `CNAME` and static hosting already in place — no deploy changes needed
