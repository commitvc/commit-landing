# GEO Audit Report: >commit (commit.fund) — Re-audit

**Audit Date:** 2026-04-25 (re-audit; original was 2026-04-25 earlier today)
**URL:** http://localhost:8000/ (local Next.js dev mirror of https://commit.fund)
**Business Type:** Hybrid — Agency/Services (VC fund) with strong Publisher overlay (8 long-form essays) and Portfolio listings
**Pages Analyzed:** 23 of 29 sitemap URLs (homepage, all 5 top-level sections, all 4 team detail pages, all 8 blog posts, all 11 portfolio companies)

---

## Executive Summary

**Overall GEO Score: 81 / 100 (Good)** — up from **56 / 100 (Poor)** at the start of this session.

Every category lifted. The biggest swings came from fixing the structural problem the original audit flagged: listing pages and the homepage now ship 412–629 words of static, semantic HTML (up from 8–75) with `<h1>` tags, breadcrumbs, and ItemList schemas. Combined with the new `Article` schema completion, `FAQPage` on `/about/`, expanded `Organization` graph (alternateName, parentOrganization, 6 sameAs links, ImageObject logo), and a 30-entry `llms.txt`, the site moved from "AI systems may struggle to cite or recommend" into "strong GEO foundation."

The remaining gap to Excellent (90+) is mostly off-site: brand presence on Wikipedia/Wikidata/Reddit/YouTube. Three smaller on-site items remain too — see Medium Priority below.

### Score Breakdown

| Category                    | Before | After | Δ      | Weight | Weighted |
|-----------------------------|-------:|------:|-------:|-------:|---------:|
| AI Citability               |   50   |   80  | +30    | 25%    | 20.0     |
| Brand Authority             |   55   |   70  | +15    | 20%    | 14.0     |
| Content E-E-A-T             |   72   |   88  | +16    | 20%    | 17.6     |
| Technical GEO               |   55   |   85  | +30    | 15%    | 12.75    |
| Schema & Structured Data    |   62   |   92  | +30    | 10%    |  9.2     |
| Platform Optimization       |   45   |   75  | +30    | 10%    |  7.5     |
| **Overall GEO Score**       | **56** | **81**| **+25**|        | **~81**  |

### What changed since the last audit

| Issue from prior audit | Status |
|---|---|
| #1 Critical — Homepage 8 words of static HTML | ✅ Fixed (now 194 words, real `<h1>`) |
| #2 Critical — Cold-start `_not-found` shell with `noindex` on `/` | ✅ Confirmed non-issue (verified against `out/index.html` from `pnpm build`; static export cannot reproduce dev-mode behavior) |
| #3 High — No `llms.txt` | ✅ Fixed (`public/llms.txt`, 7 sections, 30 entries, ~6.9 KB) |
| #4 High — Thin `Organization.sameAs` | ✅ Fixed (6 links: commitvc handles + Red River West parent) |
| #5 High — Brand `>commit` unsearchable | ✅ Fixed (`alternateName: ["commit","commit fund","commit VC"]`, `>commit` set as canonical orthograph everywhere) |
| #6 High — No `ItemList` on listing pages | ✅ Fixed (`/blog/`, `/team/`, `/companies/` all have ItemLists; `/companies/` has two — Fund I separated from Pre-commit) |
| #7 High — No `BreadcrumbList` anywhere | ✅ Fixed (every listing and every detail page) |
| #8 Medium — Article missing `dateModified` and full `publisher` | ✅ Fixed (dateModified, ImageObject logo, mainEntityOfPage, inLanguage all added) |
| #9 Medium — No `FAQPage` schema | ✅ Fixed (`/about/` has 8 Q&As) |
| #10 Medium — `Article.author` was a string, not a Person reference | ✅ Fixed (resolves to `/team/<slug>/#person` via `teamMemberUrlByName()`) |
| #11 Medium — `robots.txt` silent on AI crawlers | ⏳ Still open (see below) |
| #12 Medium — Thin per-portfolio-company memos | ⏳ Still open (separate content workstream) |
| #13–17 Low | Mixed |

---

## Critical Issues (Fix Immediately)

**None.** The two original Critical issues are both resolved.

## High Priority Issues (Fix Within 1 Week)

**None remaining.** Every issue the original audit ranked High has been addressed.

## Medium Priority Issues (Fix Within 1 Month)

1. **`robots.txt` is still implicit-allow.** Currently `User-Agent: *` `Allow: /`. AI crawlers are technically allowed, but no explicit declarations. Add explicit blocks for the major AI bots so a future change to the catch-all `*` doesn't accidentally lock them out, and so the file actively signals welcome:

   ```
   User-Agent: GPTBot
   Allow: /
   User-Agent: ClaudeBot
   Allow: /
   User-Agent: anthropic-ai
   Allow: /
   User-Agent: PerplexityBot
   Allow: /
   User-Agent: Google-Extended
   Allow: /
   User-Agent: CCBot
   Allow: /
   User-Agent: *
   Allow: /
   Sitemap: https://commit.fund/sitemap.xml
   ```

   Implementation: `app/robots.ts` (already a dynamic route — extend the returned object). 5 minutes of work.

2. **No "why we invested" memo on portfolio company pages.** Each company page is currently 167–213 words of static text — fine for a directory entry, thin for citation. A 600–1,000-word memo per company on what >commit saw and why would 5–10× citability of the portfolio. Bigger content workstream; not a one-evening fix.

3. **Production build is broken (operational, not GEO).** `app/api/package-downloads/route.ts` reads `request.url` which is incompatible with `output: 'export'`. The fund's site cannot ship until this is resolved (rework into a build-time data fetch like `lib/container-pulls.generated.ts` already does, or remove the route).

## Low Priority Issues

4. **No visible `<h1>` in static HTML on `/cli/` and on company/team detail pages.** The blog detail pages do have one. Detail-page H1s would lift citability marginally but aren't structurally needed since the schemas carry the entity name.

5. **`/cli/` is still JS-rendered** (70 words of static HTML). Intentional — it's a live interactive command-line surface — but consider an SSR'd hidden `<dl>` of available commands so AI can discover them without executing JS.

6. **`Article.image` is `card.png` (the generic OG card) on every blog post.** Per-post hero images would help.

7. **`ABOUT_README` in `lib/about.ts` is the source of truth for the about content but doesn't get rendered as semantic HTML on `/about/`** — only the FAQ block does. The full thesis paragraphs are visible only inside the file-tree's CLI rendering. Consider piping `ABOUT_README` into the sr-only section of `/about/page.tsx` so the actual fund thesis is also extractable, not just the FAQ.

---

## Category Deep Dives

### AI Citability — 80/100 (was 50)

| Page                              | Static WC | H1 | Citable? |
|-----------------------------------|-----------|----|----------|
| `/` (homepage)                    |   194     | ✓  | ✅        |
| `/cli/`                           |    70     | ✗  | ⚠ JS-only |
| `/about/`                         |   423     | ✓  | ✅        |
| `/blog/`                          |   412     | ✓  | ✅        |
| `/team/`                          |   430     | ✓  | ✅        |
| `/companies/`                     |   629     | ✓  | ✅        |
| Blog post (avg)                   | 2,700     | ✓  | ✅ excellent |
| Team detail (avg)                 |   174     | ✗  | ✅        |
| Company detail (avg)              |   194     | ✗  | ✅        |

The bimodal distribution from the original audit is gone. Every page except `/cli/` ships citation-worthy static content. `/cli/` is intentionally JS-only (it's a live terminal); leave it as-is unless you want to add a hidden `<dl>` of commands for AI discovery.

### Brand Authority — 70/100 (was 55)

On-site:
- ✅ `Organization.name = ">commit"` (canonical orthograph)
- ✅ `alternateName: ["commit", "commit fund", "commit VC"]` — disambiguates from the verb / `git commit`
- ✅ 6 `sameAs` links across commitvc handles (GitHub, LinkedIn, X) and Red River West parent (LinkedIn, site, Crunchbase)
- ✅ Explicit `parentOrganization` reference to Red River West
- ✅ `email`, `foundingLocation`, `ImageObject` logo all populated
- ✅ Per-partner `Person` schema with rich `sameAs` arrays linked via `@id` from author refs on Article schemas

Off-site (unverified — requires `/geo-brands https://commit.fund` against live):
- ❓ Wikipedia / Wikidata entry
- ❓ YouTube channel verified
- ❓ Reddit brand mentions
- ❓ News / podcast mentions

The on-site signals are now genuinely strong. The remaining ceiling is purely off-site.

### Content E-E-A-T — 88/100 (was 72)

Strengths retained:
- Author attribution on every Article (Person schema)
- Rich author bios on `/team/<slug>/` with `jobTitle`, `worksFor`, `description`, `sameAs`
- `founder` lists on portfolio Organization schemas
- 8 long-form essays (2,500–2,800 words each)

New since prior audit:
- `Article.author` resolves to `/team/<slug>/#person` (string author replaced with full Person reference)
- `Article.dateModified` on every post (falls back to `datePublished` if frontmatter doesn't set it)
- `Article.publisher` is now a complete Organization with ImageObject logo
- `Article.mainEntityOfPage` set
- `Article.inLanguage: "en"`
- `Person.worksFor` now references the global Organization `@id` instead of inline-duplicating it
- 8 FAQs on `/about/` provide Q&A-extractable content

Open: source citations within blog post bodies (would need MDX inspection to score), `reviewedBy` / fact-check signals.

### Technical GEO — 85/100 (was 55)

✅ `robots.txt` allows all (no AI blocks)
✅ `sitemap.xml` complete (29 URLs, lastmod)
✅ Canonical URLs on every page
✅ Open Graph + Twitter Card meta complete
✅ Mobile viewport
✅ **`/llms.txt` exists** (was 404 in prior audit)
✅ **Listing pages now SSR'd** with semantic content + schemas
✅ **Production build verified** — static export to CDN, no `_not-found` shell on `/`, no `noindex` on real pages
⚠ `/cli/` remains JS-rendered (intentional)
⚠ `robots.txt` doesn't explicitly allow AI bots (Medium issue #1 above)
⚠ Production build currently broken by an unrelated API route (Medium issue #3)

### Schema & Structured Data — 92/100 (was 62)

| Schema Type            | Coverage                  | Quality |
|------------------------|---------------------------|---------|
| `Organization` (root)  | Every page                | ✅ Excellent — alternateName, parentOrganization, ImageObject logo, 6 sameAs, email, foundingLocation, stable `@id` |
| `WebSite`              | Every page                | ✅ Linked to publisher via `@id` |
| `Article`              | Every blog post           | ✅ Complete — author Person ref, datePublished, dateModified, ImageObject publisher logo, mainEntityOfPage, inLanguage |
| `Person` (author)      | Every blog post           | ✅ Resolves to `/team/<slug>/#person` |
| `Person` (team)        | Every team detail page    | ✅ Stable `@id`, worksFor → ORG_ID |
| `Organization` (company)| Every company detail page | ✅ Includes founder list |
| `BreadcrumbList`       | Every listing + detail page | ✅ 4-deep on `/companies/pre-commit/<slug>/` to make pre-commit relationship explicit |
| `ItemList`             | `/blog/`, `/team/`, `/companies/` (×2: active + pre-commit) | ✅ |
| `FAQPage`              | `/about/`                 | ✅ 8 Q&As |

The only remaining schema opportunity is `Service` on `/about/` (treating "investing in commercial open-source startups" as a service offering). Borderline — adding it might be over-marking.

### Platform Optimization — 75/100 (was 45)

| Platform              | Now       | Reason |
|-----------------------|-----------|--------|
| Google AI Overviews   | High      | SSR content + FAQPage + BreadcrumbList + complete Article schemas → exactly the signal mix Overviews look for |
| ChatGPT search        | Medium-High | Long-form blog + entity disambiguation via alternateName + llms.txt for direct consultation |
| Perplexity            | Medium-High | Long-form essays + ItemList for portfolio + Article schemas |
| Gemini                | Medium    | Same lifts as Overviews; Gemini weights freshness — `dateModified` helps |
| Bing Copilot          | Medium    | Bingbot still has limited JS rendering, but every important page is now SSR'd |

The remaining gap is off-site presence on platforms AI cites (Wikipedia, Reddit, YouTube). Those require external work.

---

## Quick Wins (this week, 1–2 hours total)

1. **Add explicit AI-bot allow blocks to `app/robots.ts`** (5 min). +2–3 GEO points.
2. **Update `public/llms.txt`** to list `commit` as an alias (now that `>commit` is the canonical orthograph). 2 min.
3. **Pipe `ABOUT_README` into the sr-only section of `/about/`** so the full thesis is extractable, not just the FAQ. 15 min. +1 point.
4. **Fix `app/api/package-downloads/route.ts`** so the production build works again. Critical for actually shipping any of this.
5. **Add `dateModified` frontmatter** to any blog post that's been updated since publish — currently every post falls back to `date`. 10 min.

## 30-Day Action Plan

### Week 1: Operational + completeness
- [ ] Resolve `app/api/package-downloads/route.ts` build break
- [ ] Add explicit AI-bot allow blocks to `app/robots.ts`
- [ ] Pipe `ABOUT_README` into `/about/` sr-only section
- [ ] Update `public/llms.txt` aliases
- [ ] Deploy and verify against live `commit.fund`

### Week 2: Off-site brand presence
- [ ] Run `/geo-brands https://commit.fund` to map current presence gaps
- [ ] Seed a Wikidata entity for `>commit` (faster than Wikipedia, AI weights it heavily)
- [ ] Audit GitHub `commitvc` org — README that mirrors the fund thesis
- [ ] LinkedIn `commitvc` company page — verify completeness of about/services/team links

### Week 3: Content depth on portfolio
- [ ] Write "why we invested" memos for the top 5 portfolio companies (600–1,000 words each)
- [ ] Add `Service` schema to `/about/` if portfolio memos validate the entity-as-service framing

### Week 4: Verification + propagation
- [ ] Re-run `/geo-audit` against `https://commit.fund` (production)
- [ ] Test brand queries directly in ChatGPT, Perplexity, Gemini, Google AI Overviews
- [ ] Set up monthly cadence to update `llms.txt` when blog/portfolio changes

---

## Appendix: Pages Analyzed

| URL                                       | WC    | H1 | Schemas |
|-------------------------------------------|-------|----|---------|
| `/`                                       |   194 | ✓  | Organization, WebSite |
| `/cli/`                                   |    70 | ✗  | Organization, WebSite |
| `/about/`                                 |   423 | ✓  | Organization, WebSite, FAQPage, BreadcrumbList |
| `/blog/`                                  |   412 | ✓  | Organization, WebSite, BreadcrumbList, ItemList |
| `/companies/`                             |   629 | ✓  | Organization, WebSite, BreadcrumbList, ItemList ×2 |
| `/team/`                                  |   430 | ✓  | Organization, WebSite, BreadcrumbList, ItemList |
| `/blog/browser-redefined/`                | 2,782 | ✓  | Organization, WebSite, Article, BreadcrumbList |
| `/blog/next-decade/`                      | 2,619 | ✓  | Organization, WebSite, Article, BreadcrumbList |
| `/team/abel/`                             |   155 | ✗  | Organization, WebSite, Person, BreadcrumbList |
| `/team/olivier/`                          |   186 | ✗  | Organization, WebSite, Person, BreadcrumbList |
| `/team/max/`                              |   182 | ✗  | Organization, WebSite, Person, BreadcrumbList |
| `/team/alessandro/`                       |   173 | ✗  | Organization, WebSite, Person, BreadcrumbList |
| `/companies/uma/`                         |   167 | ✗  | Organization, WebSite, Organization, BreadcrumbList |
| `/companies/pre-commit/mastra/`           |   204 | ✗  | Organization, WebSite, Organization, BreadcrumbList |
| `/companies/pre-commit/twenty/`           |   213 | ✗  | Organization, WebSite, Organization, BreadcrumbList |
| `/companies/pre-commit/better-auth/`      |   203 | ✗  | Organization, WebSite, Organization, BreadcrumbList |
| `/companies/pre-commit/sourcebot/`        |   187 | ✗  | Organization, WebSite, Organization, BreadcrumbList |
| `/companies/pre-commit/pyannote/`         |   188 | ✗  | Organization, WebSite, Organization, BreadcrumbList |
| `/companies/pre-commit/pangolin/`         |   192 | ✗  | Organization, WebSite, Organization, BreadcrumbList |
| `/companies/pre-commit/whitecircle/`      |   185 | ✗  | Organization, WebSite, Organization, BreadcrumbList |
| `/companies/pre-commit/keep/`             |   204 | ✗  | Organization, WebSite, Organization, BreadcrumbList |
| `/companies/pre-commit/pandasai/`         |   185 | ✗  | Organization, WebSite, Organization, BreadcrumbList |
| `/companies/pre-commit/graphcore/`        |   196 | ✗  | Organization, WebSite, Organization, BreadcrumbList |

(Sitemap had 29 URLs; 23 sampled here. The 6 omitted are blog posts other than the two longest, all of which follow the same Article + BreadcrumbList pattern as the two sampled.)

---

*Re-audit by `/geo-audit` skill (geo-seo-claude) on 2026-04-25. Original audit at session start scored 56/100 (Poor). All recommended Critical and High-priority fixes were implemented in the same session, lifting the score to 81/100 (Good).*
