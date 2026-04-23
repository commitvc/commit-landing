'use client';

import { PortfolioCard } from '@/components/cards/PortfolioCard';
import { ProfileCard } from '@/components/cards/ProfileCard';
import type { FsDir, FsNode } from '@/lib/filesystem';
import { PORTFOLIO } from '@/lib/portfolio';
import { TEAM } from '@/lib/team';
import Link from 'next/link';
import { type ReactNode, useMemo, useState } from 'react';
import styles from './FileTree.module.css';

type BlogPostSummary = {
  slug: string;
  title: string;
  description: string;
  author: string;
  date: string;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

type Line = {
  key: string;
  prefix: string;
  connector: string;
  name: string;
  fullPath: string;
  isDir: boolean;
  isExpanded?: boolean;
};

type Props = {
  root: FsDir;
  basePath: string;
  blogPosts?: readonly BlogPostSummary[];
};

function buildLines(
  node: FsDir,
  path: string,
  prefix: string,
  expanded: Record<string, boolean>,
  out: Line[],
) {
  const entries = Object.entries(node.contents);
  const childPath = (name: string) => (path === '/' ? `/${name}` : `${path}/${name}`);
  const dirs = entries
    .filter(([n, v]) => v.type === 'directory' && n !== 'private')
    .sort((a, b) => a[0].localeCompare(b[0]));
  const files = entries
    .filter(([, v]) => v.type === 'file')
    .sort((a, b) => a[0].localeCompare(b[0]));
  const sorted = [...dirs, ...files];
  sorted.forEach(([name, item], i) => {
    const isLast = i === sorted.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const fullPath = childPath(name);
    if (item.type === 'directory') {
      const isExp = expanded[fullPath] === true;
      out.push({
        key: fullPath,
        prefix,
        connector,
        name,
        fullPath,
        isDir: true,
        isExpanded: isExp,
      });
      if (isExp) {
        const childPrefix = prefix + (isLast ? '    ' : '│   ');
        buildLines(item, fullPath, childPrefix, expanded, out);
      }
    } else {
      out.push({ key: fullPath, prefix, connector, name, fullPath, isDir: false });
    }
  });
}

function readContent(root: FsDir, basePath: string, fullPath: string): string | null {
  const rel = fullPath.slice(basePath.length).replace(/^\//, '');
  const parts = rel.split('/').filter(Boolean);
  let node: FsNode = root;
  for (const part of parts) {
    if (node.type !== 'directory') return null;
    const child: FsNode | undefined = node.contents[part];
    if (!child) return null;
    node = child;
  }
  return node.type === 'file' ? node.content : null;
}

export function FileTree({ root, basePath, blogPosts }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<string | null>(null);

  const lines = useMemo(() => {
    const out: Line[] = [];
    buildLines(root, basePath, '', expanded, out);
    return out;
  }, [root, basePath, expanded]);

  const selectedContent = selected ? readContent(root, basePath, selected) : null;

  return (
    <div>
      <div className={styles.tree}>
        {lines.map((line) => {
          const isSelected = !line.isDir && selected === line.fullPath;
          const onClick = () =>
            line.isDir
              ? setExpanded((e) => ({ ...e, [line.fullPath]: !e[line.fullPath] }))
              : setSelected(line.fullPath);
          return (
            <button
              type="button"
              key={line.key}
              className={`${styles.item} ${isSelected ? styles.selected : ''}`}
              onClick={onClick}
            >
              <span className={styles.prefix}>
                {line.prefix}
                {line.connector}
              </span>
              {line.isDir ? (
                <>
                  <span className={styles.toggle}>{line.isExpanded ? '−' : '+'}</span>{' '}
                  <span className={styles.dir}>{line.name}/</span>
                </>
              ) : (
                <span className={styles.file}>{line.name}</span>
              )}
            </button>
          );
        })}
      </div>
      {selected && selectedContent !== null ? (
        <div className={styles.viewer}>
          <div className={styles.viewerHeader}>── {selected} ──</div>
          {renderDetail(selected, selectedContent, blogPosts)}
        </div>
      ) : null}
    </div>
  );
}

function renderDetail(
  path: string,
  content: string,
  blogPosts?: readonly BlogPostSummary[],
): ReactNode {
  const slug =
    path
      .split('/')
      .pop()
      ?.replace(/\.txt$/, '') ?? '';

  if (/^\/team\/[^/]+\.txt$/.test(path)) {
    const m = TEAM.find((x) => x.slug === slug);
    if (m) return <ProfileCard member={m} />;
  }

  if (/^\/portfolio\//.test(path) && path.endsWith('.txt')) {
    const c = PORTFOLIO.find((x) => x.slug === slug);
    if (c) return <PortfolioCard company={c} />;
  }

  if (path === '/about/legal.txt') {
    return (
      <div className={styles.textBlock}>
        <p>{content}</p>
        <p>
          <Link href="/about/legal/" className="blue">
            Open full legal notice →
          </Link>
        </p>
      </div>
    );
  }

  if (/^\/blog\/[^/]+\.txt$/.test(path) && blogPosts) {
    const p = blogPosts.find((x) => x.slug === slug);
    if (p) {
      return (
        <div className={styles.blogCard}>
          <p>
            <span className="yellow">{p.title}</span>
          </p>
          <p style={{ color: 'var(--fg-muted-hover)' }}>
            by {p.author}, on {formatDate(p.date)}
          </p>
          <br />
          <p>{p.description}</p>
          <br />
          <p>
            <Link href={`/blog/${p.slug}/`} className="blue">
              Open in full page →
            </Link>
          </p>
        </div>
      );
    }
  }

  return (
    <div className={styles.textBlock}>
      <Linkify text={content} />
    </div>
  );
}

function Linkify({ text }: { text: string }) {
  const combined = /(https?:\/\/[^\s)]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const parts: Array<string | { kind: 'url' | 'email'; value: string }> = [];
  let last = 0;
  for (const match of text.matchAll(combined)) {
    const idx = match.index ?? 0;
    if (idx > last) parts.push(text.slice(last, idx));
    const val = match[0];
    const isEmail = val.includes('@') && !val.startsWith('http');
    parts.push({ kind: isEmail ? 'email' : 'url', value: val });
    last = idx + val.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return (
    <>
      {parts.map((p, i) =>
        typeof p === 'string' ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: text segments derived from a stable split
          <span key={i}>{p}</span>
        ) : p.kind === 'email' ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: match index is stable
          <a key={i} href={`mailto:${p.value}`} className="blue">
            {p.value}
          </a>
        ) : (
          <a
            // biome-ignore lint/suspicious/noArrayIndexKey: match index is stable
            key={i}
            href={p.value}
            target="_blank"
            rel="noopener noreferrer"
            className="blue"
          >
            {p.value}
          </a>
        ),
      )}
    </>
  );
}
