# llms-txt Specification

## Purpose
TBD - created by archiving change add-geo-optimization. Update Purpose after archive.
## Requirements
### Requirement: `/llms.txt` is served at the site root with text/plain content

The site SHALL serve a static text file at `https://commit.fund/llms.txt` with HTTP status 200 and content-type `text/plain` (or compatible). The file lives in `public/llms.txt` so the static export ships it at the root.

#### Scenario: llms.txt is fetchable

- **WHEN** an AI agent issues `GET https://commit.fund/llms.txt`
- **THEN** the response status is 200 and the body is non-empty plain text

#### Scenario: llms.txt is in the static export

- **WHEN** `pnpm build` runs
- **THEN** `out/llms.txt` exists with the same bytes as `public/llms.txt`

### Requirement: llms.txt uses the spec-compliant Markdown shape

The file SHALL begin with a single H1 brand line, immediately followed by a blockquote description, then named H2 sections each containing absolute URLs in `- [Title](URL): description` format.

#### Scenario: H1 is the brand wordmark

- **WHEN** the first non-blank line of llms.txt is read
- **THEN** it is `# >commit`

#### Scenario: blockquote description follows the H1

- **WHEN** the second non-blank line is read
- **THEN** it begins with `> ` and describes the fund in one sentence

#### Scenario: H2 section names are stable

- **WHEN** the file's H2 headings are listed in order
- **THEN** they are: `## About`, `## Team`, `## Portfolio (>commit Fund I)`, `## Pre-commit (companies the team backed before the fund)`, `## Essays`, `## Key Facts`, `## Contact`

#### Scenario: every entry is an absolute URL

- **WHEN** any `[Title](URL)` link is parsed in llms.txt
- **THEN** the URL begins with `https://commit.fund/` (no relative paths anywhere)

### Requirement: Pre-commit entries are listed under their own section, not mixed with Fund I

The Portfolio (>commit Fund I) section SHALL list only current Fund I positions (active or stealth). Pre-commit team backings SHALL be listed under a separate `## Pre-commit (companies the team backed before the fund)` section so AI consuming the file does not conflate the two categories.

#### Scenario: Pre-commit section is distinct

- **WHEN** the file is parsed
- **THEN** the `## Pre-commit ...` section contains every `/companies/pre-commit/<slug>/` URL, and the `## Portfolio (>commit Fund I)` section contains zero `/pre-commit/` URLs

### Requirement: Stealth Fund I entries are listed with an explicit "Identity disclosed at launch." tag

Stealth Fund I positions SHALL be listed under the Portfolio section but their description ends with the literal text `Identity disclosed at launch.` so AI consuming the file knows the entry is a teaser, not a named entity.

#### Scenario: stealth entries are tagged

- **WHEN** the Portfolio section is parsed
- **THEN** entries whose URL ends in `/companies/inference/` or `/companies/specs/` have descriptions ending with `Identity disclosed at launch.`

### Requirement: Key Facts section carries fund-level metadata

The Key Facts section SHALL list canonical brand orthograph (name + alternateName variants), parent firm, stage focus, geography, team, notable prior backings, active commitment count, and industry classification.

#### Scenario: Key Facts includes the orthograph

- **WHEN** the Key Facts section is parsed
- **THEN** at least one line lists the canonical name `>commit` and the alternates `commit`, `commit fund`, `commit VC`

#### Scenario: Key Facts includes commitment count

- **WHEN** the Key Facts section is parsed
- **THEN** at least one line states the number of active Fund I commitments and how many are stealth

### Requirement: Total file size is between ~3 KB and ~10 KB

The file is meant to be read cheaply by AI agents. It SHALL be no smaller than 30 lines (otherwise it conveys nothing useful) and no larger than 200 lines or 10 KB (otherwise it stops being a quick reference and becomes a dump).

#### Scenario: file is in size budget

- **WHEN** `wc -c public/llms.txt` runs
- **THEN** the byte count is between 3,000 and 10,000

