## 1. Helper module

- [x] 1.1 Create `lib/structured-data.ts` with `SITE_URL`, `ORG_ID`, `LOGO_IMAGE`, `organizationJsonLd`, `websiteJsonLd`
- [x] 1.2 Add factories: `breadcrumbJsonLd()`, `itemListJsonLd()`, `teamItemList()`, `activeCompaniesItemList()`, `preCommitCompaniesItemList()`, `companiesItemList()`
- [x] 1.3 Add `teamMemberUrlByName()` helper for resolving Article authors to `/team/<slug>/#person`

## 2. Root metadata + JSON-LD

- [x] 2.1 Wire root `Organization` JSON-LD into `app/layout.tsx` (mounted in `<head>` via `dangerouslySetInnerHTML`)
- [x] 2.2 Wire root `WebSite` JSON-LD into `app/layout.tsx`
- [x] 2.3 Update `metadata.title.default` to `>commit — Venture Capital for Commercial Open Source Startups`, template `%s | >commit`
- [x] 2.4 Add `metadata.openGraph.locale = 'en_US'`
- [x] 2.5 Add `metadata.openGraph.images = [SHARE_CARD]` with explicit `width: 1200`, `height: 630`, `alt`
- [x] 2.6 Add `metadata.twitter` with `card: 'summary_large_image'`, `site: '@commitvc'`, `creator: '@commitvc'`, mirrored images
- [x] 2.7 Add `metadata.keywords` (11 entries)
- [x] 2.8 Add `metadata.authors`

## 3. Per-route JSON-LD

- [x] 3.1 Blog post page: full `Article` schema with `dateModified`, Person `@id` author, `ImageObject` publisher, `mainEntityOfPage`, `inLanguage`
- [x] 3.2 Blog post page: BreadcrumbList (3-deep)
- [x] 3.3 Blog index page: ItemList of posts + BreadcrumbList
- [x] 3.4 Team detail page: Person schema with stable `@id`, `worksFor: { @id: ORG_ID }`, BreadcrumbList (3-deep)
- [x] 3.5 Team index page: ItemList of TEAM + BreadcrumbList
- [x] 3.6 Companies detail page (active): Organization schema, BreadcrumbList (3-deep), skipped when stealth
- [x] 3.7 Companies pre-commit detail page: Organization schema, BreadcrumbList (4-deep with explicit `Pre-commit` crumb)
- [x] 3.8 Companies index page: two ItemLists (active Fund I excluding stealth + pre-commit) + BreadcrumbList
- [x] 3.9 About page: FAQPage schema (8 Q&As) + BreadcrumbList

## 4. SSR fallback content

- [x] 4.1 Add `.sr-only` utility to `styles/globals.css` (clip-path + absolute, flex-safe)
- [x] 4.2 Homepage `app/page.tsx`: SSR `<header className="sr-only">` with h1, thesis paragraphs, partner names, action links
- [x] 4.3 `/about/page.tsx`: SSR `<section className="sr-only">` with h1, intro, FAQ `<dl>`
- [x] 4.4 `/blog/page.tsx`: SSR sr-only h1 + intro + `<ul>` of posts
- [x] 4.5 `/team/page.tsx`: SSR sr-only h1 + intro + `<ul>` of members
- [x] 4.6 `/companies/page.tsx`: SSR sr-only h1 + Fund I `<ul>` + Pre-commit `<ul>`

## 5. llms.txt

- [x] 5.1 Author `public/llms.txt` with `# >commit` H1, blockquote description, sections: About / Team / Portfolio (>commit Fund I) / Pre-commit / Essays / Key Facts / Contact
- [x] 5.2 List all real entries with absolute URLs and per-entry descriptions
- [x] 5.3 Include stealth entries with explicit `Identity disclosed at launch.` tag
- [x] 5.4 Add Key Facts line for active Fund I count + stealth count

## 6. robots.txt

- [x] 6.1 Update `app/robots.ts` to emit explicit `Allow` blocks for 17 named AI crawlers ahead of `*`
- [x] 6.2 Confirm sitemap directive remains

## 7. Brand orthograph

- [x] 7.1 `Organization.name = ">commit"`, `alternateName: ["commit", "commit fund", "commit VC"]`
- [x] 7.2 `WebSite.name = ">commit"`, `alternateName: "commit"`
- [x] 7.3 BreadcrumbList home crumb `name: ">commit"` everywhere
- [x] 7.4 Article publisher `name: ">commit"`
- [x] 7.5 Page title default + template use `>commit`
- [x] 7.6 sr-only h1 on `/` uses `&gt;commit`

## 8. seoDescription field

- [x] 8.1 Add optional `seoDescription?: string` to `TeamMember` type
- [x] 8.2 Populate `seoDescription` for every team member (~110-125 chars each)
- [x] 8.3 Add optional `seoDescription?: string` to `Company` type
- [x] 8.4 Populate `seoDescription` for every non-stealth company
- [x] 8.5 Update `generateMetadata` on `/team/[slug]/`, `/companies/[slug]/`, `/companies/pre-commit/[slug]/` to prefer `seoDescription`, fall back to long form, fall back to a placeholder

## 9. OG image

- [x] 9.1 Replace `public/card.png` with canonical 1200×630 PNG
- [x] 9.2 Confirm dimensions, alt text, format match `SHARE_CARD` constant in layout
