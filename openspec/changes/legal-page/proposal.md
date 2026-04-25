## Why

commit.fund has no legal notice page. As an AMF-regulated AIFM, RRW SAS is required to make legal, regulatory, and data protection disclosures publicly accessible. This change adds a `legal.txt` file to the `about/` section of the terminal, readable inline in full via the CLI or file system view, with a corresponding static HTML page at a direct URL for sharing and indexing.

## What Changes

- Add `legal.txt` to the `about/` virtual filesystem directory in `index.html`
- Clicking `legal.txt` in the about tab, or running `cat about/legal.txt`, renders the full legal content inline in the terminal — no teaser, full text
- An "Open in full page" button at the bottom of the inline view links to the static `legal.html` page
- Add `legal.html` as a static page at `commit.fund/legal.html` with the full legal content, commit's visual identity, and the standard header + tab bar (about tab active)

## Capabilities

### New Capabilities

- `legal-inline`: Full legal notice rendered inline in the terminal (CLI `cat` and about tab file click) with "Open in full page" CTA
- `legal-static-page`: Standalone `legal.html` page with full legal content, SEO metadata, commit header, and tab bar (about tab active)

### Modified Capabilities

- `tab-navigation`: About tab on static pages links to `commit.fund/?tab=about` (consistent with the `?tab=` deep-link pattern established in the blog-section change)

## Impact

- New files: `legal.html`, updated `legal.txt` content in `index.html` virtual filesystem
- `index.html`: `about/` virtual directory gains a `legal.txt` entry; `viewFile()` detects it and renders via a `legalNotice` renderer
- No new dependencies, no build step
- `legal.html` shares `blog/style.css` for visual consistency (or gets its own `legal.css` if divergence is needed — see design)
