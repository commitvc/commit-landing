# item-list-listings Specification

## Purpose
TBD - created by archiving change add-geo-optimization. Update Purpose after archive.
## Requirements
### Requirement: `/blog/`, `/team/`, `/companies/` emit `ItemList` JSON-LD

Listing pages SHALL emit `ItemList` JSON-LD nodes whose `itemListElement` enumerates the items in render order with `position`, `url`, `name`, and `description`.

#### Scenario: blog index emits ItemList of all posts

- **WHEN** a crawler fetches `/blog/`
- **THEN** the response contains an ItemList with `name: ">commit essays"` and one `ListItem` per post, each with `position`, `url` (absolute, ending in `/blog/<slug>/`), `name` (post title), and `description` (post description)

#### Scenario: team index emits ItemList of all members

- **WHEN** a crawler fetches `/team/`
- **THEN** the response contains an ItemList with `name: ">commit team"` and one `ListItem` per member, ordered as `TEAM` is declared in `lib/team.ts`

### Requirement: `/companies/` emits TWO distinct ItemLists, never combined

The companies index SHALL emit two separate `ItemList` JSON-LD blocks: one for active Fund I positions (excluding stealth) named `">commit Fund I portfolio"`, and one for pre-commit team backings named `"Companies the >commit team backed before the fund"`. The two lists SHALL NOT be merged into a single combined list.

#### Scenario: two ItemLists on /companies/

- **WHEN** a crawler fetches `/companies/`
- **THEN** the response contains exactly two `<script type="application/ld+json">` blocks of type `ItemList`

#### Scenario: Fund I list excludes stealth

- **WHEN** the Fund I ItemList is parsed
- **THEN** its `itemListElement` contains only companies whose `Company.folder === 'active'` AND `Company.stealth !== true` (so stealth Fund I positions like `inference` and `specs` do not appear)

#### Scenario: Pre-commit list contains all pre-commit entries

- **WHEN** the Pre-commit ItemList is parsed
- **THEN** its `itemListElement` contains every company whose `Company.folder === 'pre-commit'`, in declaration order

#### Scenario: Pre-commit URLs use the /pre-commit/ prefix

- **WHEN** any `ListItem` in the Pre-commit ItemList is read
- **THEN** its `url` is `https://commit.fund/companies/pre-commit/<slug>/`

### Requirement: Each `ListItem` carries position, url, name, description

Every `ListItem` inside any ItemList on the site SHALL include four fields: a 1-indexed `position`, an absolute `url`, a human-readable `name`, and a `description`. The `name` follows a stable pattern per list type (`<company> — <oneLiner>` for companies, `<member-name> — <member-role>` for team) and the `description` mirrors the entity's long-form description (`Company.about` or `TeamMember.description`).

#### Scenario: ListItem shape

- **WHEN** any ItemList's `ListItem` is parsed
- **THEN** it has `@type: "ListItem"`, `position` (1-indexed), `url` (absolute), `name` (the company name plus `—` plus oneLiner, or the team-member name plus role), and `description` (the company `about` or team `description`)

### Requirement: Stealth Fund I positions are absent from any ItemList

Companies with `Company.stealth === true` SHALL NOT appear in any ItemList. They have detail pages and are listed in `/llms.txt`, but the schema-graph layer omits them so AI knowledge graphs don't index a teaser ("Stealth — AI inference stack") as if it were a real entity.

#### Scenario: inference and specs not in any ItemList

- **WHEN** every ItemList JSON-LD on the site is collected
- **THEN** no `ListItem.url` ends in `/companies/inference/` or `/companies/specs/`

