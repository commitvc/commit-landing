'use client';

import { CompanyCard } from '@/components/cards/CompanyCard';
import { ProfileCard } from '@/components/cards/ProfileCard';
import { COMPANIES } from '@/lib/companies';
import type { FsDir, FsNode } from '@/lib/filesystem';
import { TEAM } from '@/lib/team';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
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

/** Team / companies have indexable static routes. Clicking those files in
 *  the tree should navigate there; other files (about, blog summaries) stay
 *  inline. Pre-commit companies live under /companies/pre-commit/<slug>/
 *  so the URL mirrors the tree's folder structure. */
function staticRouteFor(fullPath: string): string | null {
  const team = fullPath.match(/^\/team\/([^/]+)\.txt$/);
  if (team) return `/team/${team[1]}/`;
  const preCommit = fullPath.match(/^\/companies\/pre-commit\/([^/]+)\.txt$/);
  if (preCommit) return `/companies/pre-commit/${preCommit[1]}/`;
  const company = fullPath.match(/^\/companies\/([^/]+)\.txt$/);
  if (company) return `/companies/${company[1]}/`;
  return null;
}

/** Current URL → the filesystem path (if any) of the file that URL represents.
 *  Used so the tree can stay mounted across route transitions and just
 *  re-highlight the selected file as the URL changes. */
function routeToFsPath(pathname: string | null): string | null {
  if (!pathname) return null;
  const team = pathname.match(/^\/team\/([^/]+)\/?$/);
  if (team) return `/team/${team[1]}.txt`;
  const preCommit = pathname.match(/^\/companies\/pre-commit\/([^/]+)\/?$/);
  if (preCommit) return `/companies/pre-commit/${preCommit[1]}.txt`;
  const company = pathname.match(/^\/companies\/([^/]+)\/?$/);
  if (company) return `/companies/${company[1]}.txt`;
  return null;
}

export function FileTree({ root, basePath, blogPosts }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const routedSelection = routeToFsPath(pathname);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [localSelected, setLocalSelected] = useState<string | null>(null);

  // Auto-expand ancestor folders of the route-driven selection so a deep-link
  // like /companies/mastra/ lands with the `pre-commit/` branch open.
  useEffect(() => {
    if (!routedSelection) return;
    const rel = routedSelection.slice(basePath.length).replace(/^\//, '');
    const parts = rel.split('/').filter(Boolean);
    if (parts.length <= 1) return;
    setExpanded((prev) => {
      const next = { ...prev };
      let p = basePath;
      for (let i = 0; i < parts.length - 1; i++) {
        p = p === '/' ? `/${parts[i]}` : `${p}/${parts[i]}`;
        next[p] = true;
      }
      return next;
    });
  }, [routedSelection, basePath]);

  // routedSelection (URL-driven) takes precedence for highlighting; localSelected
  // only kicks in for non-routable files (about, blog summaries) which still
  // render inline below the tree.
  const selected = routedSelection ?? localSelected;
  const inlineContent =
    !routedSelection && localSelected ? readContent(root, basePath, localSelected) : null;

  const lines = useMemo(() => {
    const out: Line[] = [];
    buildLines(root, basePath, '', expanded, out);
    return out;
  }, [root, basePath, expanded]);

  return (
    <div>
      <div className={styles.tree}>
        {lines.map((line) => {
          const isSelected = !line.isDir && selected === line.fullPath;
          const onClick = () => {
            if (line.isDir) {
              setExpanded((e) => ({ ...e, [line.fullPath]: !e[line.fullPath] }));
              return;
            }
            const route = staticRouteFor(line.fullPath);
            if (route) {
              router.push(route);
              return;
            }
            setLocalSelected(line.fullPath);
          };
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
      {inlineContent !== null && localSelected ? (
        <div className={styles.viewer}>
          <div className={styles.viewerHeader}>── {localSelected} ──</div>
          {renderDetail(localSelected, inlineContent, blogPosts)}
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

  if (/^\/companies\//.test(path) && path.endsWith('.txt')) {
    const c = COMPANIES.find((x) => x.slug === slug);
    if (c) return <CompanyCard company={c} />;
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
