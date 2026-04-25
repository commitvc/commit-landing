## Why

The fund has signed Fund I positions whose identities aren't yet public. The portfolio file tree should hint they exist (so users browsing don't think `UMA` is the only Fund I commitment), the URL space should accommodate them (so a press leak or insider link can be served a real page), and the visible card should cleanly refuse to disclose. At the same time, the entity-graph layer (Organization JSON-LD, ItemList memberships) must NOT index a teaser as if it were a real company — AI assistants asking "what does >commit invest in?" should never surface `Stealth — AI inference stack` as a named entity.

This change introduces a `stealth: true` flag on `Company`, two stealth Fund I entries (`inference` and `specs`, the second on a specifications framework, both teasing the domain via `oneLiner` only), a single-line `<filename>: Permission denied` card body in place of the normal card layout, a muted file colour in the file tree, and explicit suppression of Organization JSON-LD + ItemList membership for stealth entries. The site says "yes, this exists; you cannot read it yet" without misrepresenting the placeholder as a company.

## What Changes

- **`Company.stealth?: boolean`** flag in `lib/companies.ts`. When `true`, the `CompanyCard` renders a one-line `<filename>: Permission denied` block; the page emits no Organization JSON-LD; the entry is excluded from the active-companies ItemList.
- **Two stealth Fund I entries**: `inference` (oneLiner: "AI inference stack") and `specs` (oneLiner: "Specifications framework"). Both `folder: 'active'`, `company: 'Stealth'`, `avatar: ''`, `stealth: true`. The slug teases the domain; the `oneLiner` tells the visitor what space without revealing identity.
- **`StealthCard` branch** in `CompanyCard.tsx` — early-return path: a single `<p>` with the filename in default `--fg` and `Permission denied` in `--fg-muted-hover`. No `# about`, no `# project`, no metadata grid, no link row.
- **`fileStealth` class** in `FileTree.module.css` — a faded version of the regular green `.file` colour (`rgba(158, 206, 106, 0.55)`). Applied in `FileTree.tsx` when the slug matches a `stealth: true` company.
- **JSON-LD suppression** on stealth detail pages — `app/(chrome)/(tabs)/companies/[slug]/page.tsx` skips emitting Organization JSON-LD when `company.stealth`. BreadcrumbList still renders for navigation context.
- **ItemList exclusion** — `activeCompaniesItemList()` in `lib/structured-data.ts` filters out `stealth` entries.
- **OG metadata adjustments** — stealth pages get `description: "Stealth Fund I investment — <oneLiner>. Disclosure pending."` and skip the OG image (no avatar to share).
- **`/llms.txt` entries** — stealth Fund I positions are listed under the Portfolio section with `Identity disclosed at launch.` appended to their description.
- **Homepage SSR thesis** — adds a one-line count: "Active Fund I commitments to date: 3 — one announced (UMA — humanoid robotics), two stealth (disclosure pending)."

## Capabilities

### New Capabilities

- `stealth-portfolio`: the cohesive set of rules covering the data flag, card render, file-tree treatment, JSON-LD suppression, ItemList exclusion, and llms.txt tagging.
