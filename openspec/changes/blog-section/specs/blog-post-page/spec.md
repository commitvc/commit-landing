## ADDED Requirements

### Requirement: Blog post page is a standalone static HTML file
Each blog post SHALL exist as a standalone `.html` file at `blog/<slug>.html`, served directly by GitHub Pages with no server-side processing.

#### Scenario: Post page is accessible at its URL
- **WHEN** a user navigates to `commit.fund/blog/<slug>.html`
- **THEN** the browser receives a valid HTML document with HTTP 200

#### Scenario: Post URL is stable and permanent
- **WHEN** a post is published at `blog/<slug>.html`
- **THEN** that URL SHALL NOT change after publication (slug is immutable)

### Requirement: Blog post page carries full SEO and GEO metadata
Each post page SHALL include metadata sufficient for indexing by search engines and AI crawlers.

#### Scenario: Page has required meta tags
- **WHEN** a crawler fetches `blog/<slug>.html`
- **THEN** the page MUST contain:
  - `<title>{Post Title} | commit</title>`
  - `<meta name="description" content="...">` (150–160 chars)
  - `<link rel="canonical" href="https://commit.fund/blog/<slug>.html">`
  - `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:url">`, `<meta property="og:type" content="article">`, `<meta property="og:image">`

#### Scenario: Page includes schema.org Article JSON-LD
- **WHEN** a crawler fetches `blog/<slug>.html`
- **THEN** the page MUST contain a `<script type="application/ld+json">` block with a schema.org `Article` object including `headline`, `datePublished`, `author` (Person), and `publisher` (Organization: commit)

#### Scenario: og:image uses an absolute URL
- **WHEN** a social crawler or link-preview bot fetches `blog/<slug>.html`
- **THEN** `og:image` MUST be an absolute URL (e.g. `https://commit.fund/card.png`), not a relative path

### Requirement: Blog post page uses commit's visual identity
Post pages SHALL use `blog/style.css` and match the terminal aesthetic: dark background, monospace font, red accent color (`#ff4444`), consistent with `index.html`.

#### Scenario: Post page renders with correct styling
- **WHEN** a user opens `blog/<slug>.html` in a browser
- **THEN** the page displays a dark background (`#1a1a1a` or equivalent), monospace body text, and the commit red accent on headings and links

### Requirement: Blog post page has a header with ASCII logo and Red River West button
Each post page SHALL include a header row containing: the ASCII `>commit` wordmark on the left and the Red River West red button (linking to `https://redriverwest.com`) on the right. The header container SHALL be horizontally centered and share the same max-width as the article body.

#### Scenario: Header renders logo and button
- **WHEN** user views any blog post page
- **THEN** the ASCII >commit wordmark is visible on the left side of the header and the RRW red button is visible on the right side

#### Scenario: ASCII logo links back to commit.fund
- **WHEN** user clicks the >commit logo in the header
- **THEN** the browser navigates to `https://commit.fund`

### Requirement: Blog post page has a tab bar with blog tab active and deep-links back to the SPA
Each post page SHALL include a static HTML `<nav>` tab bar below the header, rendering five tabs: `cli`, `portfolio`, `team`, `about`, `blog`. The `blog` tab SHALL be marked active (red `>` prefix) and SHALL NOT be a link. The other four tabs SHALL link to `https://commit.fund/?tab=<name>` so the SPA opens directly to the correct tab.

#### Scenario: Tab bar renders with blog active
- **WHEN** user views any blog post page
- **THEN** a tab bar is visible with five tabs and the `blog` tab displays the `>` active indicator in red and is not clickable

#### Scenario: Non-blog tabs deep-link to the SPA tab
- **WHEN** user clicks the `cli` tab on a blog post page
- **THEN** the browser navigates to `https://commit.fund/?tab=cli`

#### Scenario: Non-blog tabs open the correct SPA view
- **WHEN** user clicks the `portfolio` tab on a blog post page
- **THEN** the browser navigates to `https://commit.fund/?tab=portfolio`, and the SPA loads with the portfolio tab active

### Requirement: A `blog/template.html` file provides the canonical post template
The repo SHALL contain `blog/template.html` as a copy-paste starting point for new posts, with all required metadata fields pre-filled with placeholder values.

#### Scenario: Template contains all required metadata placeholders
- **WHEN** an author opens `blog/template.html`
- **THEN** all required `<meta>`, `<link rel="canonical">`, and JSON-LD fields are present with `<!-- REPLACE -->` or `{placeholder}` markers
