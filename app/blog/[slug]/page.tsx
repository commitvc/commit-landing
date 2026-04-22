import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { formatDate, getAllSlugs, getPost } from '@/lib/blog';
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
      url: post.canonical ?? `https://commit.fund/blog/${slug}/`,
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    author: { '@type': 'Person', name: post.author },
    datePublished: post.date,
    publisher: { '@type': 'Organization', name: 'commit' },
    ...(post.ogImage ? { image: post.ogImage } : {}),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be raw JSON.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className={styles.article}>
        <h1>{post.title}</h1>
        <p className={styles.articleMeta}>
          {post.author} — {formatDate(post.date)}
        </p>
        <MDX />
        {post.substack ? (
          <div className={styles.originalLink}>
            <p>
              Originally published on{' '}
              <a href={post.substack} target="_blank" rel="noopener noreferrer">
                Substack
              </a>
            </p>
          </div>
        ) : null}
      </article>
    </main>
  );
}
