# seo-description-fields Specification

## Purpose
TBD - created by archiving change refine-portfolio-metrics. Update Purpose after archive.
## Requirements
### Requirement: `TeamMember.seoDescription?: string` is an optional SERP-friendly description

The `TeamMember` type in `lib/team.ts` SHALL include an optional `seoDescription?: string` field. When set, it is the value `generateMetadata` uses for `<meta name="description">` and `og:description` on `/team/<slug>/`. When absent, the value falls back to the long-form `description`, then to a `${member.name}, ${member.role} at >commit.` placeholder.

#### Scenario: seoDescription is the type-level field

- **WHEN** the `TeamMember` type is read
- **THEN** it includes `seoDescription?: string` (optional)

#### Scenario: every current team member has one populated

- **WHEN** `TEAM` is iterated
- **THEN** every member has `seoDescription` set to a string of approximately 100-130 characters

### Requirement: `Company.seoDescription?: string` is an optional SERP-friendly description

The `Company` type in `lib/companies.ts` SHALL include an optional `seoDescription?: string` field. When set, it is the value `generateMetadata` uses for `<meta name="description">` and `og:description` on the company-detail page. Stealth companies use a hardcoded teaser (`Stealth Fund I investment — ${oneLiner}. Disclosure pending.`) and ignore this field.

#### Scenario: seoDescription is the type-level field

- **WHEN** the `Company` type is read
- **THEN** it includes `seoDescription?: string` (optional)

#### Scenario: every non-stealth company has one populated

- **WHEN** `COMPANIES` is iterated and stealth entries are filtered out
- **THEN** every remaining company has `seoDescription` set to a string of approximately 105-150 characters

### Requirement: `generateMetadata` prefers `seoDescription` over the long form

Per-route `generateMetadata` for team detail, active-company detail, and pre-commit-company detail pages SHALL apply this fallback chain:

1. `seoDescription` if set
2. `description` (TeamMember) or `about` (Company) if set
3. A short placeholder built from name + role/oneLiner

#### Scenario: team detail prefers seoDescription

- **WHEN** `generateMetadata` runs for `/team/olivier/` and `member.seoDescription` is set
- **THEN** the resulting `description` field equals `member.seoDescription`

#### Scenario: company detail prefers seoDescription

- **WHEN** `generateMetadata` runs for `/companies/pre-commit/twenty/` and `company.seoDescription` is set
- **THEN** the resulting `description` field equals `company.seoDescription`

#### Scenario: fallback to long form

- **WHEN** a hypothetical entry has only `description` (or `about`) set, no `seoDescription`
- **THEN** the `description` field falls through to that long form (a known truncation hazard for Google SERPs, but still shippable)

#### Scenario: ultimate placeholder

- **WHEN** an entry has neither `seoDescription` nor `description`/`about`
- **THEN** the description is `${name}, ${role} at >commit.` (team) or `${company.company}: ${company.oneLiner}. Portfolio at >commit.` (company)

### Requirement: Voice — terse, factual, credibility-first

`seoDescription` SHALL be written in the same voice as the rest of the site (terse, factual, dry-witted) but compressed to a SERP-friendly length. Hobbies and personal life context (which appear in the long-form bios) are removed; role + 1 distinctive credential is the structure.

#### Scenario: team-member voice

- **WHEN** any team member's `seoDescription` is read
- **THEN** it begins with role at `>commit` and includes one factual credential (built X, founded Y, backed Z), with no hobbies or location chatter

#### Scenario: company voice — pre-commit

- **WHEN** any pre-commit company's `seoDescription` is read
- **THEN** it ends with the literal phrase `Backed by the >commit team before the fund.` (so AI parsing the SERP snippet learns the relationship without ambiguity)

#### Scenario: company voice — Fund I active

- **WHEN** any active (non-stealth) Fund I company's `seoDescription` is read
- **THEN** it ends with `>commit Fund I.` (or equivalent — the pattern signals current portfolio status)

#### Scenario: acquired companies append the acquirer

- **WHEN** an acquired company's `seoDescription` is read
- **THEN** it includes `Acquired by <acquirer>.` as part of the description, before the `>commit` relationship clause

### Requirement: Length target is 110-150 characters

`seoDescription` SHALL be written to fit comfortably in Google's desktop SERP snippet (~160 chars before truncation, ~120 on mobile). Target ~110-150 characters; below 100 is too short to convey credibility, above 160 risks mid-sentence truncation.

#### Scenario: every populated seoDescription fits the budget

- **WHEN** every current `seoDescription` (across `TEAM` and `COMPANIES` excluding stealth) is measured by character length
- **THEN** every value is between 100 and 160 characters

