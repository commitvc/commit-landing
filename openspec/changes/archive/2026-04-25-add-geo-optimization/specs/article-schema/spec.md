## ADDED Requirements

### Requirement: Every blog post page emits a complete `Article` JSON-LD node

Every page rendered by `app/(chrome)/(tabs)/blog/[slug]/page.tsx` SHALL emit an `Article` JSON-LD node with the full set of properties needed for Google Article rich results and AI freshness signalling.

#### Scenario: Article node present on every blog post

- **WHEN** a crawler fetches `/blog/<slug>/` for any post in `getAllSlugs()`
- **THEN** the response contains a `<script type="application/ld+json">` block whose JSON has `"@type": "Article"`

#### Scenario: headline + description from frontmatter

- **WHEN** the Article JSON-LD is parsed
- **THEN** `headline` equals the post's frontmatter `title` and `description` equals the frontmatter `description`

### Requirement: Article author is a Person referenced to the team page

If the post's `author` matches a current team member's name, the Article SHALL emit `author` as a Person node with a stable `@id` of `https://commit.fund/team/<member-slug>/#person`, plus `name` and `url`. Otherwise (guest author) the Article emits `author` as a name-only Person.

#### Scenario: known team member

- **WHEN** a post's frontmatter says `author: "Olivier Huez"` and `Olivier Huez` is in `TEAM`
- **THEN** the Article's `author` is `{ "@type": "Person", "@id": "https://commit.fund/team/olivier/#person", "name": "Olivier Huez", "url": "https://commit.fund/team/olivier/" }`

#### Scenario: guest author

- **WHEN** a post's frontmatter `author` does not match any team member
- **THEN** the Article's `author` is `{ "@type": "Person", "name": "<author-string>" }` with no `@id`

### Requirement: Article carries datePublished and dateModified

The Article SHALL include both `datePublished` and `dateModified`. `datePublished` reads from frontmatter `date`. `dateModified` reads from frontmatter `dateModified` if present, else falls back to `date`.

#### Scenario: post with explicit dateModified

- **WHEN** a post's frontmatter includes `dateModified: "2026-04-25"`
- **THEN** the Article emits `datePublished: "<original-date>"` and `dateModified: "2026-04-25"`

#### Scenario: post without dateModified

- **WHEN** a post's frontmatter does not include `dateModified`
- **THEN** `dateModified` SHALL be the same value as `datePublished`

### Requirement: Article publisher references the canonical Organization with a typed logo

The Article's `publisher` SHALL include `@id: ORG_ID`, `name: ">commit"`, and `logo` as an `ImageObject` with `url`, `width`, and `height`.

#### Scenario: publisher logo is an ImageObject

- **WHEN** the Article JSON-LD is parsed
- **THEN** `publisher.logo` is `{ "@type": "ImageObject", "url": "https://commit.fund/favicon.jpeg", "width": 512, "height": 512 }`

#### Scenario: publisher dedupes via @id

- **WHEN** the Article JSON-LD is parsed
- **THEN** `publisher.@id` equals `"https://commit.fund/#org"` (the same `@id` used by the page-level Organization node)

### Requirement: Article carries mainEntityOfPage and inLanguage

The Article SHALL include both a `mainEntityOfPage` field referencing the canonical page URL (so Google can disambiguate the Article from any aggregated/syndicated copy) and an `inLanguage` field declaring the content language.

#### Scenario: mainEntityOfPage points at the canonical URL

- **WHEN** the Article JSON-LD is parsed
- **THEN** `mainEntityOfPage` is `{ "@type": "WebPage", "@id": "<canonical-url>" }` where `<canonical-url>` is `post.canonical` if set in frontmatter, else `https://commit.fund/blog/<slug>/`

#### Scenario: inLanguage is English

- **WHEN** the Article JSON-LD is parsed
- **THEN** `inLanguage` is `"en"`

### Requirement: Article carries an image when frontmatter provides one

The Article SHALL include an `image` field iff the post's frontmatter declares `ogImage`. The page SHALL NOT auto-fall-back to the shared `card.png` for the Article schema's `image`, because the shared card carries fund-level branding rather than the post's own context.

#### Scenario: post with ogImage frontmatter

- **WHEN** a post's frontmatter includes `ogImage: "<url>"`
- **THEN** the Article includes `image: "<url>"`

#### Scenario: post without ogImage frontmatter

- **WHEN** a post's frontmatter omits `ogImage`
- **THEN** the Article omits `image` (no fallback to the shared `card.png`)
