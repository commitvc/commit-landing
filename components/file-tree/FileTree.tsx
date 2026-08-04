'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { CompanyCard } from '@/components/cards/CompanyCard';
import { ProfileCard } from '@/components/cards/ProfileCard';
import { Linkify } from '@/components/linkify/Linkify';
import { ADVISORS } from '@/lib/advisors';
import { COMPANIES } from '@/lib/companies';
import {
  compareFileEntries,
  type FsDir,
  type FsNode,
  isStealthCompanyFile,
} from '@/lib/filesystem';
import { TEAM } from '@/lib/team';
import styles from './FileTree.module.css';

/** Pure formatter — kept local rather than imported from `@/lib/blog`,
 *  since that module pulls in `node:fs` at module scope and would poison
 *  the client bundle. Same output as `lib/blog.formatDate`. */
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

type BlogPostSummary = {
  slug: string;
  title: string;
  description: string;
  author: string;
  date: string;
};

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
    .sort((a, b) => compareFileEntries(a[0], b[0], childPath));
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

/** About files that have their own dedicated /about/<file>/ route. Legal is
 *  intentionally excluded — its tree entry stays inline (with a link out to
 *  the redirect page) so casual readers see the summary without leaving. */
const ABOUT_ROUTED_FILES = new Set(['readme', 'projects', 'contact']);

/** Team / companies / about have indexable static routes. Clicking those
 *  files in the tree should navigate there; other files (legal, blog
 *  summaries) stay inline. Pre-commit companies live under
 *  /companies/pre-commit/<slug>/ so the URL mirrors the tree's folder
 *  structure. */
function staticRouteFor(fullPath: string): string | null {
  const advisor = fullPath.match(/^\/team\/advisors\/([^/]+)\.txt$/);
  if (advisor && ADVISORS.some((item) => item.slug === advisor[1])) {
    return `/team/advisors/${advisor[1]}/`;
  }
  const team = fullPath.match(/^\/team\/([^/]+)\.txt$/);
  if (team) return `/team/${team[1]}/`;
  const preCommit = fullPath.match(/^\/companies\/pre-commit\/([^/]+)\.txt$/);
  if (preCommit) return `/companies/pre-commit/${preCommit[1]}/`;
  const company = fullPath.match(/^\/companies\/([^/]+)\.txt$/);
  if (company) return `/companies/${company[1]}/`;
  const about = fullPath.match(/^\/about\/([^/]+)\.txt$/);
  const aboutSlug = about?.[1];
  if (aboutSlug && ABOUT_ROUTED_FILES.has(aboutSlug)) return `/about/${aboutSlug}/`;
  return null;
}

/** Current URL → the filesystem path (if any) of the file that URL represents.
 *  Used so the tree can stay mounted across route transitions and just
 *  re-highlight the selected file as the URL changes. */
function routeToFsPath(pathname: string | null): string | null {
  if (!pathname) return null;
  const advisor = pathname.match(/^\/team\/advisors\/([^/]+)\/?$/);
  if (advisor && ADVISORS.some((item) => item.slug === advisor[1])) {
    return `/team/advisors/${advisor[1]}.txt`;
  }
  const team = pathname.match(/^\/team\/([^/]+)\/?$/);
  if (team) return `/team/${team[1]}.txt`;
  const preCommit = pathname.match(/^\/companies\/pre-commit\/([^/]+)\/?$/);
  if (preCommit) return `/companies/pre-commit/${preCommit[1]}.txt`;
  const company = pathname.match(/^\/companies\/([^/]+)\/?$/);
  if (company) return `/companies/${company[1]}.txt`;
  const about = pathname.match(/^\/about\/([^/]+)\/?$/);
  const aboutSlug = about?.[1];
  if (aboutSlug && ABOUT_ROUTED_FILES.has(aboutSlug)) return `/about/${aboutSlug}.txt`;
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
          // Stealth files are dimmed in the listing so visitors get a
          // "different/locked" hint before clicking. Same check the CLI `ls`
          // runs, so the two listings paint them identically.
          const isStealthFile = !line.isDir && isStealthCompanyFile(line.fullPath);

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
            // For inline files: if we're currently on a routed page, navigate back
            // to the base path first so the inline content can render. Without this,
            // routedSelection blocks inlineContent from showing.
            if (routedSelection) {
              router.push(basePath);
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
                <span className={`${styles.file} ${isStealthFile ? styles.fileStealth : ''}`}>
                  {line.name}
                </span>
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

  if (/^\/team\/advisors\/[^/]+\.txt$/.test(path)) {
    const advisor = ADVISORS.find((x) => x.slug === slug);
    if (advisor) return <ProfileCard member={advisor} />;
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
