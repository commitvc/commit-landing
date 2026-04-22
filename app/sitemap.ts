import { getAllPosts } from '@/lib/blog';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const BASE_URL = 'https://commit.fund';

const STATIC_PATHS = ['/', '/cli', '/companies', '/blog', '/team', '/about'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${BASE_URL}${path}${path === '/' ? '' : '/'}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }));
  const postEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}/`,
    lastModified: new Date(post.date),
    changeFrequency: 'yearly',
    priority: 0.6,
  }));
  return [...staticEntries, ...postEntries];
}
