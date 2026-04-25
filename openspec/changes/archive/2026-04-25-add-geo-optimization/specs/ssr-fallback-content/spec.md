## ADDED Requirements

### Requirement: A `.sr-only` utility class exists in global CSS using the standard visually-hidden pattern

`styles/globals.css` SHALL declare a `.sr-only` class that visually hides content while keeping it readable by AI crawlers, screen readers, and search-engine extractors. The implementation uses `position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0` (the standard a11y pattern). It SHALL NOT use `display: none` (which Google penalises).

#### Scenario: .sr-only class is present in globals.css

- **WHEN** `styles/globals.css` is read
- **THEN** it contains a `.sr-only` rule with the visually-hidden pattern above

#### Scenario: .sr-only does not use display: none

- **WHEN** the `.sr-only` rule is parsed
- **THEN** it does NOT contain a `display: none` declaration

### Requirement: JS-heavy pages ship server-rendered semantic HTML inside `.sr-only`

Every page whose visible UX is JS-rendered (homepage CLI, listing-page file tree) SHALL include a server-rendered semantic block — `<h1>` plus intro plus list/FAQ — inside a `.sr-only` wrapper. Affected pages: `/`, `/about/`, `/blog/`, `/team/`, `/companies/`.

#### Scenario: homepage emits a server-rendered h1 + thesis paragraphs

- **WHEN** a non-JS-executing crawler fetches `/`
- **THEN** the static HTML contains an `<h1>` with text `>commit — Venture Capital for Commercial Open Source Startups` and at least three `<p>` paragraphs covering: the thesis + parent firm + check size + geography; the focus areas; the two unfair advantages; the team; and a contact + nav line

#### Scenario: listing pages emit a server-rendered h1 + intro + items

- **WHEN** a non-JS crawler fetches `/blog/`, `/team/`, or `/companies/`
- **THEN** the static HTML contains an `<h1>`, at least one `<p>` of intro, and a `<ul>` listing the items (posts / members / companies) with their names, links, and descriptions

#### Scenario: /about/ emits a server-rendered h1 + intro + FAQ list

- **WHEN** a non-JS crawler fetches `/about/`
- **THEN** the static HTML contains an `<h1>`, an intro `<p>`, an `<h2>Frequently asked questions</h2>`, and a `<dl>` whose `<dt>`/`<dd>` pairs match the FAQPage JSON-LD `mainEntity`

### Requirement: Word-count floors per page

To guarantee citability, the static HTML SHALL contain at least these word counts (excluding script/style content):

| Page | Floor |
|---|---:|
| `/` | 150 |
| `/about/` | 400 |
| `/blog/` | 400 |
| `/team/` | 400 |
| `/companies/` | 400 |

#### Scenario: homepage has at least 150 words of static text

- **WHEN** the body text of `/` is extracted (script/style stripped)
- **THEN** the word count is ≥ 150

#### Scenario: each listing page has at least 400 words

- **WHEN** the body text of `/about/`, `/blog/`, `/team/`, or `/companies/` is extracted
- **THEN** the word count is ≥ 400

### Requirement: Sr-only content is sourced from existing data, not duplicated copy

The contents of the sr-only blocks SHALL be derived from the same source data the visible UX renders from (`lib/about.ts` thesis content, `lib/team.ts` `TEAM`, `lib/companies.ts` `COMPANIES`, blog frontmatter). The sr-only block SHALL NOT contain marketing copy that exists nowhere else on the site.

#### Scenario: companies sr-only mirrors COMPANIES

- **WHEN** the sr-only block on `/companies/` is read
- **THEN** every entry's name and description matches an entry in `lib/companies.ts` (no extra companies, no missing ones, no description that diverges from the lib)

#### Scenario: team sr-only mirrors TEAM

- **WHEN** the sr-only block on `/team/` is read
- **THEN** every entry's name, role, and description matches a `TEAM` member in `lib/team.ts`

### Requirement: Sr-only blocks use semantic landmarks

Each sr-only block SHALL be wrapped in a semantic element (`<header>` for the homepage hero, `<section>` with `aria-label` elsewhere) so screen readers and AI extractors can distinguish it from inline page chrome.

#### Scenario: homepage uses <header className="sr-only">

- **WHEN** the homepage HTML is parsed
- **THEN** the sr-only block is wrapped in a `<header>` element

#### Scenario: listing/detail pages use <section className="sr-only" aria-label="...">

- **WHEN** any listing page's sr-only block is parsed
- **THEN** it is a `<section>` with an `aria-label` attribute describing the block's purpose
