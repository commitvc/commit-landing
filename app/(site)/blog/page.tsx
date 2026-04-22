import type { Metadata } from 'next';
import Link from 'next/link';
import { formatDate, getAllPosts } from '@/lib/blog';
import styles from './blog.module.css';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Essays from the >commit team on commercial open source, AI, and Europe.',
  alternates: { canonical: '/blog' },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  return (
    <main>
      <h1 className="yellow">blog</h1>
      <div className={styles.indexList}>
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}/`} className={styles.indexCard}>
            <h2 className={styles.indexTitle}>{post.title}</h2>
            <p className={styles.indexMeta}>
              {post.author} — {formatDate(post.date)}
            </p>
            <p className={styles.indexDescription}>{post.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
