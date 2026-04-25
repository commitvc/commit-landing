## Why

The site renders most of its UX as a client-side terminal (CLI tab, file tree, neofetch boot animation). That works for human visitors but ships near-empty static HTML — non-JS-rendering AI crawlers (ClaudeBot, PerplexityBot, GPTBot in many modes) saw an empty page. The pre-existing audit measured a baseline GEO score around the "Poor" band: homepage ~8 words of static HTML, listing pages ~70 words, no `BreadcrumbList`, no `ItemList`, no `FAQPage`, no `llms.txt`, a thin `Organization` JSON-LD, robots.txt with no explicit AI-bot allows, and an `Article` schema missing `dateModified`, a typed publisher logo, and an author cross-reference.

This change is the comprehensive remediation: a full machine-readable layer (JSON-LD graph + llms.txt + robots.txt + OG/Twitter card) plus an SSR fallback content layer (visually-hidden semantic HTML) so AI crawlers see meaningful content on every page. The brand orthograph (`>commit` canonical with explicit alternates) lives here too because brand disambiguation only works end-to-end when every surface agrees.

## What Changes

- **Organization JSON-LD**: a single canonical Organization node (stable `@id`) emitted on every page with `alternateName`, `parentOrganization`, `ImageObject` logo, 6 `sameAs` links, `email`, and `foundingLocation`.
- **WebSite JSON-LD**: a sibling node referencing the Organization by `@id` so the entity graph dedupes.
- **Article JSON-LD**: blog-post pages get a complete Article node — `datePublished`, `dateModified`, `author` as a Person referenced by `@id` to `/team/<slug>/#person`, `publisher.logo` as a typed `ImageObject`, `mainEntityOfPage`, and `inLanguage`.
- **BreadcrumbList**: every non-root page emits a BreadcrumbList. Pre-commit company pages are 4-deep so AI distinguishes pre-commit backings from current Fund I positions.
- **ItemList**: listing pages (`/blog/`, `/team/`, `/companies/`) emit ItemList schemas. The companies listing emits **two** distinct ItemLists — Fund I active and Pre-commit — never combined, so AI doesn't misattribute a pre-commit company as a current Fund I position.
- **FAQPage**: `/about/` carries a `FAQPage` schema with 8 Q&As covering thesis, check size, geography, team, RRW relationship, differentiator, OSS philosophy, and how to pitch.
- **`/llms.txt`**: a spec-compliant llms.txt with a brand description, named H2 sections (About / Team / Portfolio / Pre-commit / Essays / Key Facts / Contact), absolute URLs, and per-entry descriptions.
- **`robots.txt`**: explicit `User-Agent` `Allow` blocks for 17 named AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.) ahead of the catch-all `*`.
- **Brand orthograph**: `>commit` is the canonical name in titles, schemas, breadcrumb home crumbs, sr-only headlines, and llms.txt. `commit`, `commit fund`, `commit VC` are listed as `alternateName`.
- **SSR fallback content**: every JS-heavy page (`/`, `/about/`, `/blog/`, `/team/`, `/companies/`) ships server-rendered semantic HTML (h1 + intro + listing/FAQ) inside a `.sr-only` wrapper. Minimum word counts: homepage ≥150, listing pages ≥400.
- **OG/Twitter card metadata**: the root layout declares full `openGraph` (locale, image with width/height/alt), `twitter` (`summary_large_image`, `@commitvc` site/creator), `keywords`, and `authors`. The OG image is a canonical 1200×630 PNG.
- **Optional `seoDescription` field** on `TeamMember` and `Company` — a SERP/social-friendly short version (~120-140 chars) used as `<meta name="description">` and `og:description`, falling back to the long bio/about when absent.

## Capabilities

### New Capabilities

- `organization-schema`: shape of the root Organization JSON-LD node and its inheritance.
- `website-schema`: the WebSite node and its publisher reference.
- `article-schema`: the complete Article node on `/blog/<slug>/` pages.
- `breadcrumb-navigation`: BreadcrumbList depth and home-crumb rules.
- `item-list-listings`: ItemList rules for listing pages, including the Fund I / Pre-commit split.
- `about-faq`: FAQPage schema + a paired sr-only `<dl>` mirror on `/about/`.
- `llms-txt`: format and content rules for `/llms.txt`.
- `ai-crawler-robots`: explicit AI-bot allow blocks in robots.txt.
- `brand-name-orthograph`: `>commit` canonical + alternate-name rules.
- `ssr-fallback-content`: minimum static HTML on every JS-heavy page.

### Modified Capabilities

None directly. The pre-existing `migrate-to-nextjs` change (still in-progress) proposes a thin Article schema in `blog-mdx`; this change's `article-schema` capability supersedes that requirement when both apply.
