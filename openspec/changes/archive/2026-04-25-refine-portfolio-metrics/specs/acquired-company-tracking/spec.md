## ADDED Requirements

### Requirement: Acquired companies skip the live OSS-tracking fetch

When a `Company` has `acquiredBy` set (truthy), `CompanyCard` SHALL NOT invoke `fetchCompanyStats`. The static facts (license, language, firstCommit) still render from the company-level overrides; the live tracking metrics (stars, contributors, downloads) do not render at all.

#### Scenario: acquired flag gates the fetch

- **WHEN** a `CompanyCard` is mounted with `company.acquiredBy === 'Elastic'`
- **THEN** the `useEffect` returns early and no network request is made to `api.github.com` or any package registry / proxy

#### Scenario: stealth flag also gates the fetch

- **WHEN** a `CompanyCard` is mounted with `company.stealth === true`
- **THEN** the `useEffect` returns early — the StealthCard early-return upstream of `ProjectSection` is the visible behaviour, but defence-in-depth at the fetch layer prevents incidental network calls if rendering ever changes

#### Scenario: non-acquired non-stealth companies fetch normally

- **WHEN** a `CompanyCard` is mounted with neither `acquiredBy` nor `stealth` set
- **THEN** `fetchCompanyStats` is invoked and the live `<Stat>` rows render with current values

### Requirement: Static facts render from `Company` overrides when live fetch is skipped

For acquired companies, the `# project` block SHALL render only the rows whose values come from `Company` fields (`license`, `language`, `firstCommit`). The live rows (`stars`, `contributors`, `downloads`) are absent.

#### Scenario: keep card shows static rows only

- **WHEN** `/companies/pre-commit/keep/` renders
- **THEN** the `# project` block contains exactly: `MIT` (LICENSE), `Python` (LANGUAGE), `Feb 2023` (FIRST COMMIT) — no STARS, no CONTRIBUTORS, no DOWNLOADS

#### Scenario: graphcore card shows static rows only

- **WHEN** `/companies/pre-commit/graphcore/` renders
- **THEN** the `# project` block contains exactly: `MIT` (LICENSE), `C++` (LANGUAGE), `Feb 2020` (FIRST COMMIT) — no live tracking metrics

### Requirement: Static overrides cover acquired companies' license and language

For every acquired company, `Company.license` and `Company.language` SHALL be populated in `lib/companies.ts` so the static rows render. Without the live fetch, fallback to `repo?.license` and `repo?.language` is unavailable.

#### Scenario: keep has language override

- **WHEN** `lib/companies.ts` is read for the `keep` entry
- **THEN** it has `language: 'Python'` (and the existing `license: 'MIT'`)

#### Scenario: graphcore has license + language overrides

- **WHEN** `lib/companies.ts` is read for the `graphcore` entry
- **THEN** it has `license: 'MIT'` and `language: 'C++'`

### Requirement: The `(acq. X)` tag is the lifecycle signal in the card title

Acquired companies' card title SHALL include a parenthetical `(acq. <acquirer-name>)` styled with `--fg-muted-hover` colour, immediately after the company name. This tag carries the lifecycle context that the missing live tracking would otherwise have communicated.

#### Scenario: keep title includes (acq. Elastic)

- **WHEN** `/companies/pre-commit/keep/` renders
- **THEN** the `<h2>` company-name element contains the visible text `Keep (acq. Elastic)`

### Requirement: `hasAnyProjectInfo` honours the gate

The `# project` section SHALL render at all only when there is something to show. For acquired companies, that means at least one of `license`, `language`, `firstCommit` must be set. For non-acquired non-stealth companies, that ALSO includes the possibility that live fetches will return data (so a company with no static fields but a `github` URL still renders the section, which then fills in once the fetch resolves).

#### Scenario: project section renders for acquired with overrides

- **WHEN** an acquired company has `license`, `language`, and `firstCommit` set
- **THEN** the `# project` section renders

#### Scenario: project section omitted entirely if nothing to show

- **WHEN** a hypothetical company has none of `license`, `language`, `firstCommit`, no `github`, no `package`
- **THEN** the `# project` section is omitted from the card body
