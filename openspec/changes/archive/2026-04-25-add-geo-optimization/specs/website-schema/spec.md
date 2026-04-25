## ADDED Requirements

### Requirement: Every page emits a `WebSite` JSON-LD node referencing the Organization by `@id`

Every page SHALL emit a `WebSite` JSON-LD node alongside the Organization node. The WebSite's `publisher` field is a JSON-LD reference (`{ "@id": ORG_ID }`) rather than an inlined Organization object.

#### Scenario: WebSite node present on every page

- **WHEN** a crawler fetches any page on `commit.fund`
- **THEN** the response contains a `<script type="application/ld+json">` block whose JSON has `"@type": "WebSite"` and `"@id": "https://commit.fund/#website"`

#### Scenario: WebSite publisher resolves to canonical Organization

- **WHEN** the WebSite JSON-LD is parsed
- **THEN** `publisher` equals `{ "@id": "https://commit.fund/#org" }` (a reference, not an inline duplicate)

### Requirement: WebSite carries name, alternateName, url, inLanguage

The WebSite JSON-LD SHALL include `name`, `alternateName`, `url`, and `inLanguage` fields that mirror the brand-orthograph rules and identify the site's canonical URL and content language.

#### Scenario: name and alternateName mirror brand orthograph

- **WHEN** the WebSite JSON-LD is parsed
- **THEN** `name` is `">commit"` and `alternateName` is `"commit"`

#### Scenario: url is the canonical site root

- **WHEN** the WebSite JSON-LD is parsed
- **THEN** `url` is `"https://commit.fund"`

#### Scenario: inLanguage signals English

- **WHEN** the WebSite JSON-LD is parsed
- **THEN** `inLanguage` is `"en"`
