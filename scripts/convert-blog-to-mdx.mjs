#!/usr/bin/env node
// One-shot converter: blog/<slug>/index.html → content/blog/<slug>.mdx
// Extracts <article> body and OG/canonical metadata, writes MDX with frontmatter.
// Safe to re-run.

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BLOG_DIR = join(ROOT, 'blog');
const OUT_DIR = join(ROOT, 'content', 'blog');

mkdirSync(OUT_DIR, { recursive: true });

function pick(html, re) {
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

function extractArticle(html) {
  const m = html.match(/<article>([\s\S]*?)<\/article>/);
  if (!m) throw new Error('No <article> element found');
  let body = m[1];
  // Strip the leading <h1> and the .article-meta <p> — these go into frontmatter
  body = body.replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>\s*/m, '');
  body = body.replace(/^\s*<p\s+class="article-meta"[^>]*>[\s\S]*?<\/p>\s*/m, '');
  // Strip the .original-link wrapper — we'll re-render it from frontmatter
  body = body.replace(/<div\s+class="original-link">[\s\S]*?<\/div>/, '');
  // Self-close void HTML elements so MDX parses them as JSX
  body = body.replace(
    /<(br|hr|img|meta|link|input|wbr|source|track|col)([^>]*?)>/g,
    (_m, tag, attrs) => {
      const trimmed = attrs.trimEnd();
      return `<${tag}${trimmed}${trimmed.endsWith('/') ? '' : ' /'}>`;
    },
  );
  // Convert class= to className= for JSX
  body = body.replace(/\sclass=/g, ' className=');
  return body.trim();
}

function extractFrontmatter(html, slug) {
  const title =
    pick(html, /<title>([^<]+?)\s*\|\s*commit<\/title>/) ?? pick(html, /<title>([^<]+?)<\/title>/);
  const description = pick(html, /<meta\s+name="description"\s+content="([^"]+)"/);
  const canonical = pick(html, /<link\s+rel="canonical"\s+href="([^"]+)"/);
  const ogImage = pick(html, /<meta\s+property="og:image"\s+content="([^"]+)"/);
  const author = pick(html, /<meta\s+property="article:author"\s+content="([^"]+)"/);
  const date = pick(html, /<meta\s+property="article:published_time"\s+content="([^"]+)"/);
  // Original-source link if present (Substack, mxcrbn.com, etc.)
  const source = pick(html, /Originally published on\s*<a href="([^"]+)"/);
  return { slug, title, description, canonical, ogImage, author, date, source };
}

function yaml(fm) {
  const esc = (v) => (v == null ? '' : String(v).replace(/"/g, '\\"'));
  const lines = [
    `title: "${esc(fm.title)}"`,
    `description: "${esc(fm.description)}"`,
    `author: "${esc(fm.author)}"`,
    `date: "${esc(fm.date)}"`,
    `slug: "${esc(fm.slug)}"`,
  ];
  if (fm.canonical) lines.push(`canonical: "${esc(fm.canonical)}"`);
  if (fm.ogImage) lines.push(`ogImage: "${esc(fm.ogImage)}"`);
  if (fm.substack) lines.push(`substack: "${esc(fm.substack)}"`);
  return lines.join('\n');
}

const slugs = readdirSync(BLOG_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

let count = 0;
for (const slug of slugs) {
  const src = join(BLOG_DIR, slug, 'index.html');
  let html;
  try {
    html = readFileSync(src, 'utf8');
  } catch {
    continue;
  }
  const fm = extractFrontmatter(html, slug);
  if (!fm.title || !fm.date) {
    console.warn(`skipping ${slug}: missing title or date`);
    continue;
  }
  const body = extractArticle(html);
  const out = `---\n${yaml(fm)}\n---\n\n${body}\n`;
  writeFileSync(join(OUT_DIR, `${slug}.mdx`), out);
  count++;
  console.log(`wrote content/blog/${slug}.mdx`);
}

console.log(`\ndone — ${count} posts converted.`);
