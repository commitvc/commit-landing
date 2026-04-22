# Spec — blog-mdx

## Purpose
Blog posts are MDX files in `content/blog/` with frontmatter. One source of
truth — the index and the per-post route both read from it.

## Requirements

- MUST store each of the 8 existing posts as `content/blog/<slug>.mdx`:
  `next-decade`, `licenses`, `community-value`, `europe-sovereignty`,
  `browser-redefined`, `projet-product-fit`, `project-to-market`, `french-coss`.
- Each MDX file MUST declare frontmatter with `title`, `author`, `date`
  (ISO 8601), `description`, and optional `canonical`.
- `lib/blog.ts` MUST export `getAllPosts()` returning an array sorted
  newest-first, and `getPost(slug)` returning a single post with its
  compiled MDX body.
- `app/blog/page.tsx` MUST render `<BlogPostCard />` for each post, linking
  to `/blog/<slug>/`.
- `app/blog/[slug]/page.tsx` MUST implement `generateStaticParams()` returning
  every slug, and `generateMetadata()` returning per-post OG + canonical tags.
- Each post page MUST embed an `Article` JSON-LD block with the post's
  headline, author, datePublished, and publisher.
- MUST preserve the existing URL pattern `/blog/<slug>/` (with trailing slash).
- MUST render GFM (tables, strikethrough) via `remark-gfm`.
- SHOULD auto-generate heading anchors via `rehype-slug` +
  `rehype-autolink-headings`.

## Non-goals
- Draft posts, scheduled publishing, categories/tags. Flat set of 8 posts.
