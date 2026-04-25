## ADDED Requirements

### Requirement: Every non-root page emits a `BreadcrumbList` JSON-LD node

Every page except `/` SHALL emit a `BreadcrumbList` JSON-LD node whose `itemListElement` array reflects the page's URL hierarchy.

#### Scenario: BreadcrumbList present on listing pages

- **WHEN** a crawler fetches `/about/`, `/blog/`, `/team/`, or `/companies/`
- **THEN** the response includes a `<script type="application/ld+json">` block with `"@type": "BreadcrumbList"`

#### Scenario: BreadcrumbList present on detail pages

- **WHEN** a crawler fetches `/blog/<slug>/`, `/team/<slug>/`, `/companies/<slug>/`, or `/companies/pre-commit/<slug>/`
- **THEN** the response includes a BreadcrumbList block

#### Scenario: BreadcrumbList absent on root

- **WHEN** a crawler fetches `/`
- **THEN** no BreadcrumbList block is emitted (the root has no navigation hierarchy to describe)

### Requirement: Home crumb is `>commit` linking to `/`

Every BreadcrumbList SHALL begin with a home crumb whose `name` is `">commit"` and whose `item` URL is `https://commit.fund/`.

#### Scenario: home crumb on /about/

- **WHEN** the BreadcrumbList on `/about/` is parsed
- **THEN** `itemListElement[0]` has `position: 1`, `name: ">commit"`, `item: "https://commit.fund/"`

### Requirement: Pre-commit company pages emit a 4-deep breadcrumb

Pages under `/companies/pre-commit/<slug>/` SHALL emit a BreadcrumbList with four crumbs: `>commit → Companies → Pre-commit → <Company>`. The `Pre-commit` crumb's `item` URL is `/companies/` (it does not have its own page; the crumb exists for semantic separation only).

#### Scenario: 4-deep breadcrumb on Mastra

- **WHEN** the BreadcrumbList on `/companies/pre-commit/mastra/` is parsed
- **THEN** `itemListElement` has positions 1–4: `">commit"` → `"Companies"` → `"Pre-commit"` → `"Mastra"`

#### Scenario: Pre-commit crumb URL maps to /companies/

- **WHEN** position 3 is read
- **THEN** `item` is `"https://commit.fund/companies/"` (the Pre-commit crumb has no dedicated page)

### Requirement: Active company detail pages emit a 3-deep breadcrumb

Pages under `/companies/<slug>/` (active Fund I, including stealth) SHALL emit a 3-deep breadcrumb: `>commit → Companies → <Company>`.

#### Scenario: 3-deep breadcrumb on UMA

- **WHEN** the BreadcrumbList on `/companies/uma/` is parsed
- **THEN** `itemListElement` has positions 1–3: `">commit"` → `"Companies"` → `"UMA"`

#### Scenario: stealth pages still emit the breadcrumb

- **WHEN** the BreadcrumbList on `/companies/inference/` is parsed
- **THEN** the 3-deep structure is present with `name: "Stealth"` at position 3 (Organization JSON-LD is omitted but BreadcrumbList is preserved for navigation context)

### Requirement: Listing and other detail pages follow URL depth

The BreadcrumbList depth SHALL match the URL depth for every page type. The mapping:

- `/about/` → 2-deep (`>commit → About`)
- `/blog/` → 2-deep (`>commit → Blog`)
- `/team/` → 2-deep (`>commit → Team`)
- `/companies/` → 2-deep (`>commit → Companies`)
- `/blog/<slug>/` → 3-deep (`>commit → Blog → <title>`)
- `/team/<slug>/` → 3-deep (`>commit → Team → <name>`)

#### Scenario: 3-deep breadcrumb on a blog post

- **WHEN** the BreadcrumbList on `/blog/next-decade/` is parsed
- **THEN** position 3's `name` equals the post's `title` and `item` equals the post's canonical URL
