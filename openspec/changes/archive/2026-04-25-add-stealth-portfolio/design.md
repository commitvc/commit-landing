## Context

Earlier exploration considered several aesthetic options for stealth entries: an `age`-encrypted block, an SSH-keygen randomart "fingerprint" avatar, a `cat: filename: Permission denied` + `stat` dump, and just "permission denied" alone. After comparison the user picked the simplest: one line, terminal-style, no animation, no decoration.

The architectural question that took longer was scope. Stealth could have lived as: (a) a separate route segment (`/companies/stealth/<slug>/`), (b) a Company subtype with a different render component, or (c) a flag on Company that the existing render branches on. Option (c) won — same data shape, same routes, same filetree, same generateMetadata path. The behaviour difference is concentrated in (1) `CompanyCard.tsx` early-return, (2) the JSON-LD emission in the slug page, (3) the `activeCompaniesItemList()` filter, (4) the FileTree class application. Four small touch points; no parallel code paths.

## Goals / Non-Goals

**Goals**

1. Stealth Fund I entries exist as real, shareable URLs.
2. The card body refuses cleanly without revealing identity.
3. The file-tree entry hints at "different / locked" without italicising or spoiler-ing.
4. Stealth entries are absent from any AI knowledge-graph layer (Organization, ItemList) — they only exist in the file tree, the sitemap, and the llms.txt teaser line.
5. The `oneLiner` field carries the only deliberate domain tease; everything else is opaque.

**Non-Goals**

- No "decrypt" CLI command. The early version of this design proposed one as an Easter egg; the user trimmed it.
- No randomart avatars, age cipher blocks, or fake stat dumps. Simplicity was the explicit ask.
- No automatic disclosure date. Marketing/PR controls when a stealth entry "graduates" to a full company entry; the spec stays silent on timing.

## Decisions

### Decision 1: `stealth: boolean`, not `stealth: { fingerprint, … }`

Earlier iterations had `stealth?: { fingerprint: string }` to feed the randomart avatar. After the design simplified to a single line, the flag became a plain boolean. No upgrade path — if the design ever re-adds richer metadata, the type can extend without breaking call sites.

### Decision 2: Slug carries the domain tease, company name stays "Stealth"

`slug: 'inference'`, `company: 'Stealth'`, `oneLiner: 'AI inference stack'`. The URL `/companies/inference/` and the file `inference.txt` reveal the domain space. The display name across the card title remains `Stealth`. This is the deliberate split: the URL space and file tree communicate domain context (so a savvy visitor browsing portfolio companies has signal), while the rendered card stays opaque (so casual visitors don't read "Stealth" and assume it's the company's actual brand).

### Decision 3: Exclude from `activeCompaniesItemList`, not from sitemap or file tree

Stealth entries appear in:

- File tree at `/companies/` — yes, with muted styling
- Sitemap — yes (real route, Google should crawl)
- llms.txt — yes, in the Portfolio section with explicit `Identity disclosed at launch.` tag
- BreadcrumbList — yes (navigation context)

Stealth entries do NOT appear in:

- Organization JSON-LD — page emits none
- `activeCompaniesItemList()` — filtered out
- `og:image` — no avatar, so no image declared

The split: anywhere AI-as-knowledge-graph would index "Stealth" as an entity, suppress. Anywhere AI-as-content-reader sees a clearly labelled teaser ("Identity disclosed at launch."), allow.

### Decision 4: Filetree class is a faded green, not italic + opacity

Earlier iteration used `opacity: 0.55; font-style: italic`. User feedback: too much. Final treatment is `color: rgba(158, 206, 106, 0.55)` — same hue as the regular green `.file` (`var(--green) === #98c379` ≈ rgb 152, 195, 121; the `158, 206, 106` differs slightly because the rule was authored from a sibling green palette but rendering tested fine). The opacity flow gives the same "muted" perception without the literal `italic` style that read as "different file format".

### Decision 5: One stealth line, not a multi-line stat dump

The card body is literally:

```html
<p><span style="color: var(--fg)">inference.txt</span>: Permission denied</p>
```

Filename in default fg, message in `--fg-muted-hover`. No fake `stat` block, no SHA-256 fingerprint, no `cat:` prefix. Everything that isn't strictly necessary was cut.

## Risks / Trade-offs

- **Slug squatting**: `/companies/inference/` is a generic English word; if a future portfolio company has "inference" in its real name, the slug collision is on us to resolve. Mitigation: when a stealth entry graduates to a real company, rename the slug if needed and the static export's old URL 404s. Acceptable because nobody bookmarks stealth pages.
- **AI inferring identity from oneLiner**: a sufficiently determined AI could match "AI inference stack" + "Fund I disclosure pending" + "Paris-based fund" to a specific known stealth company. The teaser is intentional; the risk lies upstream of the spec.
- **Stealth slugs in sitemap**: Google may crawl them and index the redacted card. Acceptable — the page is honest content. If indexing the redacted page becomes a problem, a future spec can add `<priority>0.3</priority>` to deprioritise.

## Migration Plan

Retroactive — already shipped. After the change applies, the `stealth-portfolio` capability lands in `openspec/specs/`. Any future stealth additions (the partner mentioned 3 more coming) just append a `Company` entry with `stealth: true`; no further code changes.

When a stealth entry graduates to a fully-disclosed company:

1. Set `stealth: false` (or remove the flag).
2. Replace `company: 'Stealth'` with the real company name, `oneLiner` with the real one-liner.
3. Add the avatar, github, website, etc. as for any other portfolio entry.
4. Optionally: rename the slug if the current slug doesn't match the company's actual name. The old URL will 404 in the static export.

## Open Questions

1. When a stealth entry graduates and the slug changes, should the build emit a redirect from the old slug? Currently no; the static export doesn't naturally support it. If important, we could ship a small `_redirects` file (Netlify) or a meta-refresh HTML stub at the old URL.
2. Should there be a way to back-date `firstCommit` on a stealth-graduated entry without making the JSON-LD claim look retroactively suspicious? Not a concern today; flagging in case it becomes one.
