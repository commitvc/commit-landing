import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  author: string;
  date: string;
  canonical?: string;
  ogImage?: string;
  substack?: string;
};

const BLOG_DIR = join(process.cwd(), 'content', 'blog');

function readPost(slug: string): BlogPost {
  const raw = readFileSync(join(BLOG_DIR, `${slug}.mdx`), 'utf8');
  const { data } = matter(raw);
  const title = typeof data.title === 'string' ? data.title : '';
  const description = typeof data.description === 'string' ? data.description : '';
  const author = typeof data.author === 'string' ? data.author : '';
  const date = typeof data.date === 'string' ? data.date : '';
  const canonical = typeof data.canonical === 'string' ? data.canonical : undefined;
  const ogImage = typeof data.ogImage === 'string' ? data.ogImage : undefined;
  const substack = typeof data.substack === 'string' ? data.substack : undefined;
  return { slug, title, description, author, date, canonical, ogImage, substack };
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
