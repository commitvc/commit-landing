## ADDED Requirements

### Requirement: Blog index page exists at `blog/index.html`
The repo SHALL contain `blog/index.html` as the blog listing page, accessible at `commit.fund/blog/` and `commit.fund/blog/index.html`.

#### Scenario: Blog index page loads without error
- **WHEN** a user navigates to `commit.fund/blog/`
- **THEN** the browser receives a valid HTML document with HTTP 200

### Requirement: Blog index page lists all published posts
The index page SHALL display a list of all published posts, each showing title, date, and excerpt, with a link to the full post URL.

#### Scenario: Post entry renders title, date, excerpt, and link
- **WHEN** a user views `blog/index.html`
- **THEN** each post entry displays: post title as a clickable link to `blog/<slug>.html`, publication date (YYYY-MM-DD), and a short excerpt

#### Scenario: Posts are ordered reverse-chronologically
- **WHEN** multiple posts exist
- **THEN** posts are listed newest-first

### Requirement: Blog index page carries SEO metadata
The index page SHALL include metadata for search engine and AI crawler indexing.

#### Scenario: Index page has required meta tags
- **WHEN** a crawler fetches `blog/index.html`
- **THEN** the page MUST contain:
  - `<title>Blog | commit</title>`
  - `<meta name="description">` describing the commit blog
  - `<link rel="canonical" href="https://commit.fund/blog/">`
  - OpenGraph tags: `og:title`, `og:description`, `og:url`, `og:type: website`

### Requirement: Blog index page has a header with ASCII logo and Red River West button
The index page SHALL include the same header as post pages: ASCII `>commit` wordmark on the left, RRW red button on the right, horizontally centered.

#### Scenario: Header renders on index page
- **WHEN** user views `blog/index.html`
- **THEN** the ASCII >commit wordmark and RRW red button are visible in the header

### Requirement: Blog index page has a tab bar with blog tab active and deep-links back to the SPA
The index page SHALL include the same static HTML `<nav>` tab bar as post pages: `blog` active (not a link), other tabs link to `https://commit.fund/?tab=<name>`.

#### Scenario: Tab bar renders with blog active on index page
- **WHEN** user views `blog/index.html`
- **THEN** the tab bar is visible with five tabs and the `blog` tab displays the active red `>` indicator and is not clickable

#### Scenario: Non-blog tabs deep-link to the SPA
- **WHEN** user clicks any non-blog tab on `blog/index.html`
- **THEN** the browser navigates to `https://commit.fund/?tab=<name>`

### Requirement: Blog index page uses commit's visual identity
The index page SHALL use `blog/style.css` and match the terminal aesthetic, consistent with post pages.

#### Scenario: Index page renders with correct styling
- **WHEN** a user opens `blog/index.html`
- **THEN** the page displays dark background, monospace font, and red accent color consistent with post pages
