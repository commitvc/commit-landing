import { getAllPosts } from '@/lib/blog';
import { COMPANIES } from '@/lib/companies';
import { SITE_URL } from '@/lib/structured-data';
import { TEAM } from '@/lib/team';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const STATIC_PATHS = [
  '/',
  '/cli',
  '/companies',
  '/blog',
  '/team',
  '/about',
  '/about/readme',
  '/about/projects',
  '/about/contact',
] as const;

/** All canonical URLs end with `/` except the root, which is just `${SITE_URL}`
 *  (no double slash). Keep this in one helper so every entry below stays
 *  consistent. */
function url(path: string): string {
  if (path === '/') return SITE_URL;
  return `${SITE_URL}${path.endsWith('/') ? path : `${path}/`}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: url(path),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }));
  const postEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: url(`/blog/${post.slug}`),
    lastModified: new Date(post.date),
    changeFrequency: 'yearly',
    priority: 0.6,
  }));
  const teamEntries: MetadataRoute.Sitemap = TEAM.map((m) => ({
    url: url(`/team/${m.slug}`),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));
  const companyEntries: MetadataRoute.Sitemap = COMPANIES.map((c) => ({
    url: url(
      c.folder === 'pre-commit' ? `/companies/pre-commit/${c.slug}` : `/companies/${c.slug}`,
    ),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));
  return [...staticEntries, ...postEntries, ...teamEntries, ...companyEntries];
}
