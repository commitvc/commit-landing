import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { formatDate, getAllSlugs, getPost, sourceLabel } from '@/lib/blog';
import {
  LOGO_IMAGE,
  ORG_ID,
  SITE_URL,
  breadcrumbJsonLd,
  teamMemberUrlByName,
} from '@/lib/structured-data';
import styles from '../blog.module.css';

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: post.canonical ?? `/blog/${slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: post.canonical ?? `${SITE_URL}/blog/${slug}/`,
      images: post.ogImage ? [post.ogImage] : undefined,
      authors: [post.author],
      publishedTime: post.date,
    },
  };
}

async function loadMdx(slug: string) {
  try {
    return await import(`@/content/blog/${slug}.mdx`);
  } catch {
    return null;
  }
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const mdx = await loadMdx(slug);
  if (!mdx) notFound();
  const MDX = mdx.default;

  // If the author is a current team member, link the Person node to their
  // /team/<slug>/ page so AI can resolve the author entity. Otherwise emit
  // a name-only Person.
  const authorUrl = teamMemberUrlByName(post.author);
  const author = authorUrl
    ? { '@type': 'Person', '@id': `${authorUrl}#person`, name: post.author, url: authorUrl }
    : { '@type': 'Person', name: post.author };

  const canonical = post.canonical ?? `${SITE_URL}/blog/${slug}/`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    author,
    datePublished: post.date,
    // `dateModified` is required for Google Article rich results and is a
    // strong freshness signal AI uses to weight citations. Falls back to
    // `date` so every Article carries both.
    dateModified: post.dateModified ?? post.date,
    // Link publisher to the global Organization @id so the entity graph
    // dedupes across the site. `logo` must be an ImageObject (not a string)
    // for the markup to be valid.
    publisher: {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: '>commit',
      logo: LOGO_IMAGE,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical,
    },
    inLanguage: 'en',
    ...(post.ogImage ? { image: post.ogImage } : {}),
  };

  const breadcrumb = breadcrumbJsonLd([
    { name: '>commit', url: '/' },
    { name: 'Blog', url: '/blog/' },
    { name: post.title, url: `/blog/${slug}/` },
  ]);

  return (
    <main>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be raw JSON.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be raw JSON.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <article className={styles.article}>
        <h1>{post.title}</h1>
        <p className={styles.articleMeta}>
          {post.author} — {formatDate(post.date)}
        </p>
        <MDX />
        {post.source ? (
          <div className={styles.originalLink}>
            <p>
              Originally published on{' '}
              <a href={post.source} target="_blank" rel="noopener noreferrer">
                {sourceLabel(post.source)}
              </a>
            </p>
          </div>
        ) : null}
      </article>
    </main>
  );
}
