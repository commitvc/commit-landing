## Context

The site is a Next.js 15 app exported as static HTML (`next.config.mjs` `output: 'export'`) and served from GitHub Pages. There is no server runtime at request time, so dynamic rewrites of metadata aren't an option — every JSON-LD blob, every meta tag, every byte of HTML is baked at `pnpm build` time.

Most of the visible UX is JS-rendered: the CLI terminal on `/`, the virtual file tree on listing pages, the `Neofetch` card. The `'use client'` boundary is hit early and most page content lives inside it. That's fine for humans on a JS-capable browser; it's nothing for an AI crawler that doesn't execute JS.

The audit baseline before this change measured ~8 words of static HTML on `/` and 60–75 on listing pages. Blog posts and detail pages were better (the MDX body is server-rendered) but the entry routes — exactly the URLs an AI crawler discovers first via the sitemap — were near-empty.

## Goals / Non-Goals

**Goals**

1. Every page ships meaningful static HTML and a complete JSON-LD entity graph for AI crawlers.
2. The brand `>commit` is unambiguous to tokenisers (which strip `>` in many models).
3. Schema cross-references resolve via `@id` so AI sees one Organization, one author Person per team member, one publisher per Article — not duplicate inline copies.
4. The single source of truth for any displayed string is the lib data (`lib/companies.ts`, `lib/team.ts`, `lib/about.ts`); sr-only text reads from the same data so it can't drift from the visible UX.
5. The OG/Twitter card metadata is complete enough that link unfurls render correctly on every major platform without center-cropping or fallback to small-image cards.

**Non-Goals**

- Server-side rendering of the actual visible UX. The CLI is the visible UX; the sr-only content is the AI/SEO layer behind it. Rewriting the CLI to be SSR-first is a different change.
- Off-site brand presence (Wikipedia, Reddit, YouTube). Tracked in audit follow-ups; not in scope here.
- Per-route OG image generation. The shared `/card.png` is fine for v1; per-blog-post and per-portfolio-company OG cards are a separate change.
- Internationalisation. The site is English-only today; locale handling is single-tenant.

## Decisions

### Decision 1: JSON-LD with stable `@id` cross-references, not inline duplicates

Every Organization, Person, and WebSite node carries a stable `@id` URL. Article nodes reference the publisher via `{ "@id": ORG_ID }` rather than re-inlining the Organization. Person author references on Articles use `{ "@id": "/team/<slug>/#person", url, name }` rather than the bare `{ name }` string the audit found.

**Why**: AI knowledge-graph builders dedupe on `@id`. Without stable `@id`s, an Article that inlines `{ "@type": "Organization", "name": "commit" }` as its publisher creates a parallel Org node that may or may not link back to the canonical entity. With `@id` references, the entity graph is one Organization with N Articles, one Person per author with N authored Articles, etc.

**Helper module**: `lib/structured-data.ts` exports `ORG_ID = "https://commit.fund/#org"`, `LOGO_IMAGE` (an ImageObject for `publisher.logo`), `organizationJsonLd`, `websiteJsonLd`, plus factories for `breadcrumbJsonLd()`, `itemListJsonLd()`, `teamItemList()`, `activeCompaniesItemList()`, `preCommitCompaniesItemList()`. Per-page emission imports these factories rather than open-coding the JSON.

### Decision 2: Two ItemLists on `/companies/`, not one combined

`activeCompaniesItemList()` filters to `folder === 'active' && !stealth`. `preCommitCompaniesItemList()` filters to `folder === 'pre-commit'`. The page emits both as separate `ItemList` nodes.

**Why**: A combined list with `name: ">commit portfolio"` would let an AI assistant answering "what does >commit invest in?" cite Mastra/Twenty/etc. as current Fund I positions. They aren't — they are companies team members backed before the fund. The semantic separation in JSON-LD is the only signal AI has at the entity-list layer; the URL prefix `/companies/pre-commit/` helps but ItemList membership is the cleaner signal.

Stealth Fund I positions are excluded from `activeCompaniesItemList()` entirely — AI shouldn't index `Stealth — AI inference stack` as a real entity.

### Decision 3: SSR fallback content uses `.sr-only`, not visible chrome

Every page that's JS-heavy (`/`, `/about/`, `/blog/`, `/team/`, `/companies/`) wraps an `<h1>` + intro paragraph + listing/FAQ inside `<header className="sr-only">` or `<section className="sr-only">`. The class is a flex-safe visually-hidden pattern in `styles/globals.css`.

**Why visible chrome is wrong here**: the site's visual identity is the CLI. Adding a visible "About >commit" hero next to the CLI fights the design.

**Why `.sr-only` is right**: the content is real semantic HTML (counted by Google, read by AI extractors, surfaced to screen readers). It just isn't laid out for sighted users. This is well-trodden a11y practice; it isn't cloaking — the content is identical to what's elsewhere on the site (lib data, FAQ answers, etc.), it's just compressed into one extractable block per page.

**Word count floors**: homepage ≥150, listing pages ≥400. These are tested in the audit script. Content is built from `lib/about.ts`, `lib/team.ts`, `lib/companies.ts` so it can't drift from what the file tree renders.

### Decision 4: `>commit` canonical, `commit` and aliases via `alternateName`

The brand wordmark is `>commit`. The leading `>` is a typographic artefact of the CLI metaphor — it's a real character in titles, h1s, JSON-LD `name` fields, breadcrumb home crumbs, and the llms.txt H1.

**Why include the `>`**: the fund's identity is the prompt glyph. Stripping it in the canonical name would erase the brand.

**Why provide `alternateName`**: AI tokenisers strip `>` to ASCII boundaries; users will type "commit fund", "commit VC", or just "commit". Listing those explicitly in `alternateName` lets entity recognition resolve them all to the same node.

**Order**: `Organization.name = ">commit"` is canonical. `alternateName: ["commit", "commit fund", "commit VC"]` are variants. WebSite mirrors with `name: ">commit"` and `alternateName: "commit"`.

**Inside JSX**: `>commit` renders as `&gt;commit` in JSX text content (because JSX requires entity-encoding `>`). Inside JSON-LD `<script>` blocks the raw `>` character is fine — `<script type="application/ld+json">` is RAWTEXT in HTML5 and only terminates on `</script>`.

### Decision 5: Stealth Fund I positions skip Organization JSON-LD, keep Breadcrumb

`/companies/inference/` and `/companies/specs/` exist as real routes (file tree shows them, sitemap includes them, breadcrumb renders) but emit no Organization JSON-LD.

**Why route exists**: visitors who guess the URL or land via the file tree see the redacted card. Honest "yes, this exists, you cannot read it yet" experience.

**Why no Org JSON-LD**: an Organization node with `name: "Stealth"` and a description that just says "Disclosure pending" pollutes the entity graph. AI assistants asking "what does >commit invest in?" would surface the placeholder as if it were a real company.

The companies ItemList on `/companies/` filters them out for the same reason. They're listed in `llms.txt` with the explicit `Identity disclosed at launch.` tag, which is the one place AI is allowed to know they exist — but only as "stealth investments", not as named entities.

### Decision 6: `seoDescription` field on TeamMember + Company, optional with fallback

The long-form `description` (TeamMember) and `about` (Company) are written for the page body — 400-600 chars on team members, 250-400 on companies. Google's SERP truncates `<meta name="description">` at ~160 chars on desktop, ~120 on mobile, mid-sentence.

**Solution**: optional `seoDescription?: string` on both types. `generateMetadata` prefers it, falls back to the long form, falls back to a name+role placeholder.

**Voice**: terse, factual, credibility-first, drops hobbies and personal context. Leads with role + 1 distinctive credential or what-it-does line. Acquired companies append `Acquired by X.` Pre-commit companies append `Backed by the >commit team before the fund.`

The fallback chain ensures adding the field is opt-in per entity, not a breaking change. Stealth companies skip the chain entirely — their description is auto-generated from `oneLiner`.

### Decision 7: robots.txt names AI bots explicitly

Pre-existing `robots.txt` was `User-Agent: * / Allow: /` — technically permits AI crawlers but doesn't signal intent. The new file lists 17 bots by name (GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, anthropic-ai, Claude-Web, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, CCBot, Bytespider, Amazonbot, DuckAssistBot, FacebookBot, meta-externalagent, Diffbot) each with `Allow: /`, then the catch-all `*` block.

**Why named blocks before the wildcard**: it's a positive intent signal that AI vendors and GEO scoring tools check, and it insulates AI bots from a future change to the wildcard (e.g. blocking a class of scrapers via `*` would no longer accidentally lock out GPTBot if GPTBot has its own `Allow:` block).

## Risks / Trade-offs

- **Sr-only content visibility to AI**: Google can technically penalise content that's hidden from sighted users but visible to crawlers ("cloaking"). Our usage is well within Google's accepted patterns — the hidden content is content already on the site (FAQ answers, partner names, fund description), just consolidated for extraction. We use the standard `clip: rect(0,0,0,0)` + `position: absolute` pattern, not `display: none` (the latter does get penalised). Risk is low but non-zero.
- **JSON-LD drift**: schemas are emitted from per-page TSX, not validated against a JSON-LD schema. If we typo a field name (`datePublishd`) Google silently ignores it. Mitigation: a build-time validator could lint the emitted JSON-LD, but it isn't in scope here.
- **`@commitvc` identity**: the X handle and GitHub org are configured but the actual accounts must exist and be public for `sameAs` to resolve. Verified at audit time; risk is operational drift if a handle is rebranded.
- **OG image refresh**: the shared `/card.png` will look stale if Activity/Focus/Stage in the live `Neofetch` change but the image isn't re-exported. Mitigation noted; per-route dynamic OG generation is a follow-up.

## Migration Plan

This change is fully retroactive — code already shipped during the session. The change document captures behaviour, not implementation steps. After this change applies, the 10 specs land in `openspec/specs/` and become the live capability descriptions agents can reference.

The pre-existing `migrate-to-nextjs/specs/blog-mdx/spec.md` proposes a thin Article schema (just `headline`, `author`, `datePublished`, `publisher`). When `migrate-to-nextjs` resumes, that requirement should be amended to reference `article-schema` rather than restate a weaker version. Not blocking.

## Open Questions

1. Should we migrate sitemap to also include the stealth slugs as `<priority>0.3</priority>` to deprioritise them while still allowing crawl, or is the current default fine?
2. Should we add a build-time JSON-LD validator (`google-rich-results-test` API call or local schema-org validation) as a CI gate?
3. The pre-existing `prompt-format` spec in `openspec/specs/` says the `user@commit.fund:` prefix is removed entirely; the live code keeps the host (sans colon). That's a separate amendment, not part of this change.
