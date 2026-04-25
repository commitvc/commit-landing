import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  author: string;
  date: string;
  /** Optional `dateModified` from frontmatter. If absent, callers should
   *  fall back to `date` so Article schema always carries both fields. */
  dateModified?: string;
  canonical?: string;
  ogImage?: string;
  /** URL of the original publication (Substack, Medium, personal blog, …).
   *  The display label is derived from the host — see `sourceLabel`. */
  source?: string;
};

const BLOG_DIR = join(process.cwd(), 'content', 'blog');

function readPost(slug: string): BlogPost {
  const raw = readFileSync(join(BLOG_DIR, `${slug}.mdx`), 'utf8');
  const { data } = matter(raw);
  const title = typeof data.title === 'string' ? data.title : '';
  const description = typeof data.description === 'string' ? data.description : '';
  const author = typeof data.author === 'string' ? data.author : '';
  const date = typeof data.date === 'string' ? data.date : '';
  const dateModified = typeof data.dateModified === 'string' ? data.dateModified : undefined;
  const canonical = typeof data.canonical === 'string' ? data.canonical : undefined;
  const ogImage = typeof data.ogImage === 'string' ? data.ogImage : undefined;
  // Accept legacy `substack:` frontmatter as a fallback so old posts keep
  // rendering during migration; new posts should use `source:`.
  const source =
    typeof data.source === 'string'
      ? data.source
      : typeof data.substack === 'string'
        ? data.substack
        : undefined;
  return { slug, title, description, author, date, dateModified, canonical, ogImage, source };
}

/** Display label for a "originally published on …" link, derived from the
 *  source URL's host so the rename `substack` → `source` doesn't require us
 *  to spell out the publication name in every frontmatter file.
 *
 *  Examples:
 *    https://commitpulse.substack.com/p/x → "Substack"
 *    https://mxcrbn.com/posts/x           → "mxcrbn.com"
 *    https://medium.com/@x/post           → "Medium"
 */
export function sourceLabel(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (host.endsWith('.substack.com') || host === 'substack.com') return 'Substack';
    if (host === 'medium.com' || host.endsWith('.medium.com')) return 'Medium';
    return host;
  } catch {
    return 'the original site';
  }
}

export function getAllSlugs(): string[] {
  return readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''));
}

export function getAllPosts(): BlogPost[] {
  return getAllSlugs()
    .map((slug) => readPost(slug))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): BlogPost | null {
  try {
    return readPost(slug);
  } catch {
    return null;
  }
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
