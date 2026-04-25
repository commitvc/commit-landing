# Spec — blog-mdx

## Purpose
Blog posts are MDX files in `content/blog/` with frontmatter. One source of
truth — the index and the per-post route both read from it.

## ADDED Requirements

### Requirement: Store each of the 8 existing posts as `content/blog/<slug>.mdx`
MUST store each of the 8 existing posts as `content/blog/<slug>.mdx`: `next-decade`, `licenses`, `community-value`, `europe-sovereignty`, `browser-redefined`, `projet-product-fit`, `project-to-market`, `french-coss`.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST store each of the 8 existing posts as `content/blog/<slug>.mdx`: `next-decade`, `licenses`, `community-value`, `europe-sovereignty`, `browser-redefined`, `projet-product-fit`, `project-to-market`, `french-coss`.

### Requirement: Each MDX file MUST declare frontmatter with `title`, `author`, `date` (ISO 8601)
Each MDX file MUST declare frontmatter with `title`, `author`, `date` (ISO 8601), `description`, and optional `canonical`.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** Each MDX file MUST declare frontmatter with `title`, `author`, `date` (ISO 8601), `description`, and optional `canonical`.

### Requirement: `lib/blog.ts` MUST export `getAllPosts()` returning an array sorted newest-first, and `getPost(slug)` returning
`lib/blog.ts` MUST export `getAllPosts()` returning an array sorted newest-first, and `getPost(slug)` returning a single post with its compiled MDX body.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** `lib/blog.ts` MUST export `getAllPosts()` returning an array sorted newest-first, and `getPost(slug)` returning a single post with its compiled MDX body.

### Requirement: `app/blog/page.tsx` MUST render `<BlogPostCard />` for each post, linking to `/blog/<slug>/`
`app/blog/page.tsx` MUST render `<BlogPostCard />` for each post, linking to `/blog/<slug>/`.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** `app/blog/page.tsx` MUST render `<BlogPostCard />` for each post, linking to `/blog/<slug>/`.

### Requirement: `app/blog/[slug]/page.tsx` MUST implement `generateStaticParams()` returning every slug, and `generateMetadata()` returning per-post OG
`app/blog/[slug]/page.tsx` MUST implement `generateStaticParams()` returning every slug, and `generateMetadata()` returning per-post OG + canonical tags.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** `app/blog/[slug]/page.tsx` MUST implement `generateStaticParams()` returning every slug, and `generateMetadata()` returning per-post OG + canonical tags.

### Requirement: Each post page MUST embed an `Article` JSON-LD block with the post's
Each post page MUST embed an `Article` JSON-LD block with the post's headline, author, datePublished, and publisher.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** Each post page MUST embed an `Article` JSON-LD block with the post's headline, author, datePublished, and publisher.

### Requirement: Preserve the existing URL pattern `/blog/<slug>/` (with trailing slash)
MUST preserve the existing URL pattern `/blog/<slug>/` (with trailing slash).

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST preserve the existing URL pattern `/blog/<slug>/` (with trailing slash).

### Requirement: Render GFM (tables, strikethrough) via `remark-gfm`
MUST render GFM (tables, strikethrough) via `remark-gfm`.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST render GFM (tables, strikethrough) via `remark-gfm`.

### Requirement: Auto-generate heading anchors via `rehype-slug` + `rehype-autolink-headings`
The migration SHALL ensure: SHOULD auto-generate heading anchors via `rehype-slug` + `rehype-autolink-headings`.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** SHOULD auto-generate heading anchors via `rehype-slug` + `rehype-autolink-headings`.

## Non-goals
- Draft posts, scheduled publishing, categories/tags. Flat set of 8 posts.
