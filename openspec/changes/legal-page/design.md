## Context

The legal notice is a long-form document (~2,500 words) covering site ownership, AMF regulatory disclosures, complaints procedure, SFDR obligations, and data protection. It must be fully accessible in the terminal (no truncation) and at a stable direct URL.

This change reuses the patterns established in the `blog-section` change: inline rendering with an "Open in full page" CTA, a static HTML page with the commit header + tab bar, and `?tab=` deep-linking back to the SPA. The key difference from blog posts is that there is no teaser/body split — the full content is in the virtual filesystem `.txt` file and renders completely inline.

## Goals / Non-Goals

**Goals:**
- Full legal content accessible via `cat about/legal.txt` and by clicking `legal.txt` in the about tab
- "Open in full page" button at the bottom of the inline terminal view links to `legal.html`
- `legal.html` at `commit.fund/legal.html` with full content, SEO metadata, commit visual identity
- About tab active on `legal.html`; other tabs deep-link back to `commit.fund/?tab=<name>`

**Non-Goals:**
- Sectioned/paginated legal content in the terminal
- Localised versions (French content is translated to English; single language)
- Separate CSS file — `legal.html` reuses `blog/style.css`

## Decisions

### 1. Full content inline — no teaser split

**Decision:** The `legal.txt` virtual filesystem entry contains the full legal text. `cat about/legal.txt` and the about tab file click both render the complete document inline.

**Why:** Legal notices are not articles — there is no natural "excerpt." Users who navigate to it in the terminal need to read it in full, and truncating it would be misleading. The "Open in full page" button is provided as a convenience (sharing, printing, bookmarking), not as a gate to the full content.

### 2. `legalNotice` renderer — structured sections, not raw `<pre>`

**Decision:** Implement a `legalNotice` renderer in `index.html` that parses the legal text sections and renders them with headings and paragraphs, styled consistently with the terminal aesthetic, plus an "Open in full page" button at the bottom.

**Why:** Raw `<pre>` output would be readable but visually poor for a long structured document. Section headings in the terminal (using the existing yellow/red accent pattern) aid navigation.

### 3. `legal.html` reuses `blog/style.css`

**Decision:** `legal.html` links to `blog/style.css` rather than its own stylesheet.

**Why:** The visual identity is identical — same header, same tab bar, same typography. No divergence at this stage. If the legal page later needs distinct styling (e.g. smaller font for dense regulatory text), a separate `legal.css` can be introduced then.

### 4. Static page layout — about tab active

**Decision:** `legal.html` uses the same header + tab bar structure as blog pages, with `about` active instead of `blog`. Non-about tabs link to `commit.fund/?tab=<name>`.

**Why:** The legal notice is content associated with the about section, not the blog. Consistent with the overall navigation model.

### 5. Legal content stored in the virtual filesystem as plain text

**Decision:** The full legal text is embedded directly in the `index.html` virtual filesystem as the content of `about/legal.txt`, not fetched at runtime.

**Why:** Consistent with all other file content in the virtual filesystem (team profiles, portfolio entries, readme). No fetch needed, no network dependency, works offline.

## Risks / Trade-offs

- **Long inline render** — the legal text is ~2,500 words; the terminal will scroll significantly. → Accepted: this is intentional per the "loaded fully" requirement
- **Content updates require editing `index.html` AND `legal.html`** — two places to keep in sync. → Mitigation: both files are edited together; low update frequency for legal content
- **Asset path** — `legal.html` is at the repo root, not inside `blog/`, so it references `blog/style.css` directly (not `../blog/style.css`). Paths for `ButtonWebSitev2.png`, `font.ttf`, `favicon.jpeg` are all root-relative (no `../` prefix needed)

## Open Questions

- Should `legal.txt` appear in the `ls about/` listing without any special treatment, or should it be visually distinguished (e.g. shown in a different colour) to signal it's a legal document?
