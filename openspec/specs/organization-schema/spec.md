# organization-schema Specification

## Purpose
TBD - created by archiving change add-geo-optimization. Update Purpose after archive.
## Requirements
### Requirement: Every page emits a single canonical `Organization` JSON-LD node

Every page on `commit.fund` SHALL emit exactly one `<script type="application/ld+json">` block whose contents declare an `Organization` node with `@id: "https://commit.fund/#org"`. The block is rendered from a shared `lib/structured-data.ts` constant so per-page emissions are byte-identical and cross-references via `@id` resolve to the same node.

#### Scenario: Organization JSON-LD present on root

- **WHEN** an AI crawler fetches `https://commit.fund/`
- **THEN** the response HTML contains a `<script type="application/ld+json">` block whose JSON has `"@type": "Organization"` and `"@id": "https://commit.fund/#org"`

#### Scenario: Organization JSON-LD inherited on every detail page

- **WHEN** a crawler fetches any page under `/about/`, `/blog/`, `/team/`, `/companies/`, `/cli/`
- **THEN** the response includes the same Organization node with the same `@id`

#### Scenario: `@id` is referenceable by sibling nodes

- **WHEN** a page emits an `Article`, `Person`, or `WebSite` node that wants to reference the Organization
- **THEN** that sibling SHALL use `{ "@id": "https://commit.fund/#org" }` rather than inlining a duplicate Organization

### Requirement: Organization node carries the full identity graph

The Organization JSON-LD SHALL include `name`, `alternateName`, `url`, `logo` (as an `ImageObject`), `description`, `email`, `foundingLocation`, `parentOrganization`, and `sameAs`.

#### Scenario: name is the canonical brand

- **WHEN** the Organization JSON-LD is parsed
- **THEN** `name` is `">commit"` (exact string, including the leading `>` character)

#### Scenario: alternateName covers tokeniser variants

- **WHEN** the Organization JSON-LD is parsed
- **THEN** `alternateName` is the array `["commit", "commit fund", "commit VC"]`

#### Scenario: parentOrganization references Red River West

- **WHEN** the Organization JSON-LD is parsed
- **THEN** `parentOrganization` resolves to `{ "@type": "Organization", "name": "Red River West", "url": "https://redriverwest.com" }`

#### Scenario: logo is a typed ImageObject, not a string

- **WHEN** the Organization JSON-LD is parsed
- **THEN** `logo` is an object with `@type: "ImageObject"`, `url`, `width`, and `height` (Google rejects string-typed publisher logos for Article rich results, so the typed form is required for cross-reference reuse on Articles)

#### Scenario: sameAs lists fund-owned handles before parent-firm handles

- **WHEN** the Organization JSON-LD is parsed
- **THEN** `sameAs` contains, in order: `https://github.com/commitvc`, `https://www.linkedin.com/company/commitvc/`, `https://x.com/commitvc`, then Red River West parent links (`https://redriverwest.com`, LinkedIn, Crunchbase)

#### Scenario: foundingLocation is set to Paris

- **WHEN** the Organization JSON-LD is parsed
- **THEN** `foundingLocation` is `{ "@type": "Place", "name": "Paris, France" }`

