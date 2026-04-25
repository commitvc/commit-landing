# about-faq Specification

## Purpose
TBD - created by archiving change add-geo-optimization. Update Purpose after archive.
## Requirements
### Requirement: `/about/` emits a `FAQPage` JSON-LD node with at least 8 Q&As

The About page SHALL emit a `FAQPage` JSON-LD node whose `mainEntity` is an array of `Question` nodes. The array SHALL contain at least 8 entries covering the topics most likely to be queried by a prospective founder, LP, or AI assistant: investment thesis, check size, geography, team, parent-firm relationship, differentiator, OSS philosophy, and pitch process.

#### Scenario: FAQPage present on /about/

- **WHEN** a crawler fetches `/about/`
- **THEN** the response contains a `<script type="application/ld+json">` block with `"@type": "FAQPage"`

#### Scenario: at least 8 questions

- **WHEN** the FAQPage is parsed
- **THEN** `mainEntity` has length ≥ 8

#### Scenario: each Question has an acceptedAnswer with text

- **WHEN** any `mainEntity[i]` is parsed
- **THEN** it has `@type: "Question"`, `name` (the question), and `acceptedAnswer` whose `@type: "Answer"` and `text` is the answer body

### Requirement: FAQ topics cover the canonical eight

The FAQ SHALL include questions semantically equivalent to:

1. What does >commit invest in?
2. What is the typical check size?
3. Where is >commit based and where do you invest?
4. Who is on the >commit team?
5. How is >commit related to Red River West?
6. What makes >commit different from other early-stage funds?
7. Why does >commit believe in commercial open source?
8. How do I pitch >commit?

#### Scenario: FAQ covers thesis

- **WHEN** the FAQ is read
- **THEN** at least one Question's `name` matches the pattern "What does >commit invest in?" and the answer mentions commercial open source, pre-seed/seed stage, and the focus areas

#### Scenario: FAQ covers check size

- **WHEN** the FAQ is read
- **THEN** at least one Question covers check size and the answer mentions the up-to-$1.5M figure

#### Scenario: FAQ covers RRW relationship

- **WHEN** the FAQ is read
- **THEN** at least one Question covers the Red River West relationship and the answer identifies >commit as the early-stage investment vehicle of the Red River West family

#### Scenario: FAQ covers pitch process

- **WHEN** the FAQ is read
- **THEN** at least one Question covers how to pitch and the answer points to `hey@commit.fund`

### Requirement: FAQ data lives alongside its display in `app/(chrome)/(tabs)/about/page.tsx`

The list of Q&As SHALL be defined as a `const FAQ` array of `{ q, a }` pairs in the page module. The same array drives both the JSON-LD `FAQPage` and the sr-only `<dl>` mirror, so the two cannot drift.

#### Scenario: FAQ array is the single source

- **WHEN** the page module is read
- **THEN** there is exactly one `FAQ` array, used both for JSON-LD generation and for the sr-only `<dl>` rendered in the page body

