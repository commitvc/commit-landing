# brand-name-orthograph Specification

## Purpose
TBD - created by archiving change add-geo-optimization. Update Purpose after archive.
## Requirements
### Requirement: `>commit` is the canonical brand name in every machine-readable surface

The fund's name in JSON-LD `name` fields, the `<title>` template, breadcrumb home crumbs, and the llms.txt H1 SHALL be the exact string `>commit` (with the leading `>` character).

#### Scenario: Organization.name is `>commit`

- **WHEN** the Organization JSON-LD is parsed
- **THEN** `name === ">commit"`

#### Scenario: WebSite.name is `>commit`

- **WHEN** the WebSite JSON-LD is parsed
- **THEN** `name === ">commit"`

#### Scenario: Article publisher.name is `>commit`

- **WHEN** any blog post's Article JSON-LD is parsed
- **THEN** `publisher.name === ">commit"`

#### Scenario: BreadcrumbList home crumb is `>commit`

- **WHEN** any non-root page's BreadcrumbList is parsed
- **THEN** `itemListElement[0].name === ">commit"`

#### Scenario: llms.txt H1 is `>commit`

- **WHEN** the first line of `/llms.txt` is read
- **THEN** it is `# >commit`

#### Scenario: page title default begins with `>commit`

- **WHEN** the homepage `<title>` is rendered (after HTML decoding)
- **THEN** it begins with `>commit — `

### Requirement: `commit`, `commit fund`, `commit VC` are listed as `alternateName`

Tokenisers strip non-alphanumeric leading characters; users type variants. The Organization SHALL declare these as `alternateName` so entity-recognition resolves them to the same node.

#### Scenario: Organization.alternateName is the canonical array

- **WHEN** the Organization JSON-LD is parsed
- **THEN** `alternateName` equals `["commit", "commit fund", "commit VC"]` (exact order, exact strings)

#### Scenario: WebSite.alternateName is `commit`

- **WHEN** the WebSite JSON-LD is parsed
- **THEN** `alternateName === "commit"` (single string, not array)

### Requirement: HTML rendering escapes the `>` character in title and h1

JSX text content SHALL use `&gt;commit` (HTML entity) in source for visible `<title>`, `<h1>`, and any inline `>commit` mention. The browser decodes the entity and renders the visible character `>commit`. The Next.js `Metadata.title` API accepts a raw string and emits the appropriate HTML escaping itself, so `metadata.ts` source uses raw `>commit`.

#### Scenario: title is escaped in JSX source

- **WHEN** `app/layout.tsx` is read
- **THEN** the title's `default` and template strings contain `>commit` (not `&gt;commit`) because Next.js's `Metadata.title` accepts a raw string and emits the escaped form into HTML

#### Scenario: sr-only h1 uses `&gt;commit`

- **WHEN** any sr-only `<h1>` is rendered (e.g. on `/`, `/about/`)
- **THEN** the JSX source uses `&gt;commit` so the rendered HTML emits `&gt;commit` for the `>` character

### Requirement: JSON-LD `<script>` block content keeps the literal `>`

Inside `<script type="application/ld+json">`, the content is RAWTEXT in HTML5 — only `</script>` terminates the block. The literal `>` character is safe and SHALL remain unescaped in JSON-LD payloads.

#### Scenario: Organization name in emitted HTML

- **WHEN** the rendered HTML at `/` is fetched and the `<script type="application/ld+json">` block containing the Organization is parsed
- **THEN** the JSON `name` field's value is the literal three-character string `>commit` (no `&gt;`, no `\u003e`)

