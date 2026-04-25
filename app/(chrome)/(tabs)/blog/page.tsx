import type { Metadata } from 'next';
import { FileTree } from '@/components/file-tree/FileTree';
import { getAllPosts } from '@/lib/blog';
import { buildFileSystem, type FsDir } from '@/lib/filesystem';
import { breadcrumbJsonLd, itemListJsonLd } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Essays from the >commit team on commercial open source, AI, and Europe.',
  alternates: { canonical: '/blog' },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const fs = buildFileSystem(posts);
  const blog = fs.contents.blog as FsDir;

  const breadcrumb = breadcrumbJsonLd([
    { name: '>commit', url: '/' },
    { name: 'Blog', url: '/blog/' },
  ]);

  const itemList = itemListJsonLd(
    '>commit essays',
    posts.map((p) => ({
      name: p.title,
      url: `/blog/${p.slug}/`,
      description: p.description,
    })),
  );

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be raw JSON.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be raw JSON.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      <section className="sr-only" aria-label=">commit blog index">
        <h1>Essays from the &gt;commit team</h1>
        <p>
          Long-form analysis on commercial open source, AI infrastructure, licensing, and European
          tech sovereignty.
        </p>
        <ul>
          {posts.map((p) => (
            <li key={p.slug}>
              <a href={`/blog/${p.slug}/`}>{p.title}</a> — {p.description}
            </li>
          ))}
        </ul>
      </section>
      <FileTree root={blog} basePath="/blog" blogPosts={posts} />
    </>
  );
}
