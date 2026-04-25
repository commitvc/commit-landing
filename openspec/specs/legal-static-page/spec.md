# legal-static-page Specification

## Purpose
TBD - created by archiving change legal-page. Update Purpose after archive.
## Requirements
### Requirement: `legal.html` exists at the repo root and is served at `commit.fund/legal.html`
The repo SHALL contain a `legal.html` file at the root level, accessible at `commit.fund/legal.html` via GitHub Pages with no additional configuration.

#### Scenario: Static page loads without error
- **WHEN** a user navigates to `commit.fund/legal.html`
- **THEN** the browser receives a valid HTML document with HTTP 200

### Requirement: `legal.html` carries SEO metadata
The static page SHALL include metadata for search engine indexing and direct linking.

#### Scenario: Page has required meta tags
- **WHEN** a crawler fetches `legal.html`
- **THEN** the page contains:
  - `<title>Legal Notice | commit</title>`
  - `<meta name="description">` summarising the page
  - `<link rel="canonical" href="https://commit.fund/legal.html">`
  - `<meta property="og:title">`, `<meta property="og:url">`, `<meta property="og:type" content="website">`
  - `og:image` set to absolute URL `https://commit.fund/card.png`

### Requirement: `legal.html` uses the commit visual identity and shared stylesheet
The static page SHALL link to `blog/style.css` and display the same dark background, monospace font, and red accent as blog pages.

#### Scenario: Page renders with correct styling
- **WHEN** user opens `legal.html`
- **THEN** the page displays dark background (`#1a1a1a`), monospace font, and red accent (`#ff4444`)

### Requirement: `legal.html` has the commit header
The page SHALL include the same header as blog pages: ASCII `>commit` wordmark on the left (linking to `commit.fund`), RRW red button on the right (linking to `redriverwest.com`), horizontally centered. Asset paths are root-relative (no `../` prefix, as `legal.html` is at the repo root).

#### Scenario: Header renders with logo and button
- **WHEN** user views `legal.html`
- **THEN** the ASCII >commit wordmark and RRW red button are visible in the header

### Requirement: `legal.html` has a tab bar with the about tab active
The page SHALL include the same static HTML `<nav>` tab bar as blog pages: `about` active (red `>` prefix, not a link), other tabs link to `https://commit.fund/?tab=<name>`.

#### Scenario: Tab bar renders with about active
- **WHEN** user views `legal.html`
- **THEN** five tabs are visible and the `about` tab displays the red `>` active indicator and is not clickable

#### Scenario: Non-about tabs deep-link to the SPA
- **WHEN** user clicks any non-about tab on `legal.html`
- **THEN** the browser navigates to `https://commit.fund/?tab=<name>`

### Requirement: `legal.html` renders the full legal notice content
The page SHALL display the complete English legal notice with section headings and formatted body text.

#### Scenario: All legal sections are present
- **WHEN** user views `legal.html`
- **THEN** the page contains all sections: Site Ownership, Hosting, Intellectual Property, Access, Content, Cookies, Complaints Procedure, Appeals, Conflicts of Interest, Intermediary Selection, Remuneration Policy, Shareholder Engagement, SFDR Disclosure, Article 29 Reports, Applicable Law, and Personal Data Protection & Cookie Policy

