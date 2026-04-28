import { ABOUT_CONTACT, ABOUT_PROJECTS, ABOUT_README } from './about';
import { COMPANIES } from './companies';
import { TEAM } from './team';

export type FsFile = { type: 'file'; content: string };
export type FsDir = { type: 'directory'; contents: Record<string, FsNode> };
export type FsNode = FsFile | FsDir;

/** The file body is just the slug; the card is looked up against TEAM /
 *  COMPANIES and rendered by the shared ProfileCard / CompanyCard components
 *  in both the CLI's `cat` and the file-tree viewer. Keeps one source of
 *  truth for the data — when ProfileCard adds new fields (tagline, focus,
 *  description, etc.), the CLI picks them up automatically instead of
 *  rendering a stale subset of a key:value text dump. */
function fileContentsFromMember(m: (typeof TEAM)[number]): string {
  return `slug:${m.slug}`;
}

function fileContentsFromCompany(c: (typeof COMPANIES)[number]): string {
  return `slug:${c.slug}`;
}

function teamDirectory(): FsDir {
  const contents: Record<string, FsNode> = {};
  for (const m of TEAM) {
    contents[`${m.slug}.txt`] = { type: 'file', content: fileContentsFromMember(m) };
  }
  contents.private = {
    type: 'directory',
    contents: {
      'secret.txt': {
        type: 'file',
        // Base64-encoded ciphertext preserved from the legacy index.html.
        content:
          'gmguya91vvneVusU7dEE6kI+CPJcPILXSmgPQOtcaHXBlgiU6kdcGilAcOxUCwYDvJOz0efyJLcaCdbrtfF27ufwstuQSgTY3YbNqnmUvc10uBJRJuD8tNTLt6W//xkJv6pzDG9Jm4E=',
      },
    },
  };
  contents.advisors = {
    type: 'directory',
    contents: {
      'advisors.txt': {
        type: 'file',
        content:
          ">commit is supported by a team of advisors who are passionate about open source.\nThey're all founders or executives who built and scaled commercial open source companies, or CTOs and technical leaders at Global 2000 enterprises.\n\nExamples include: Mozilla, Supabase, Hugging Face, Sentry, Nginx, Cesium, Suse, Airbyte, Sonar, DBT Labs, MongoDB and many others.",
      },
    },
  };
  return { type: 'directory', contents };
}

function companiesDirectory(): FsDir {
  const preCommit: Record<string, FsNode> = {};
  const active: Record<string, FsNode> = {};
  for (const c of COMPANIES) {
    const file: FsNode = { type: 'file', content: fileContentsFromCompany(c) };
    if (c.folder === 'pre-commit') {
      preCommit[`${c.slug}.txt`] = file;
    } else {
      active[`${c.slug}.txt`] = file;
    }
  }
  return {
    type: 'directory',
    contents: {
      'pre-commit': { type: 'directory', contents: preCommit },
      ...active,
    },
  };
}

function aboutDirectory(): FsDir {
  return {
    type: 'directory',
    contents: {
      'readme.txt': { type: 'file', content: ABOUT_README },
      'projects.txt': { type: 'file', content: ABOUT_PROJECTS },
      'contact.txt': { type: 'file', content: ABOUT_CONTACT },
      'legal.txt': {
        type: 'file',
        content:
          'This file contains all legal information related to this website, >commit, and its management company RRW SAS.',
      },
    },
  };
}

function blogDirectory(
  posts: ReadonlyArray<{
    slug: string;
    title: string;
    author: string;
    date: string;
    description: string;
  }>,
): FsDir {
  const contents: Record<string, FsNode> = {};
  for (const p of posts) {
    contents[`${p.slug}.txt`] = {
      type: 'file',
      content: `${p.title}\nby ${p.author}, on ${p.date}\n\n${p.description}`,
    };
  }
  return { type: 'directory', contents };
}

/** Build the full virtual FS. Blog posts are injected from lib/blog at build time by the caller. */
export function buildFileSystem(
  blogPosts: ReadonlyArray<{
    slug: string;
    title: string;
    author: string;
    date: string;
    description: string;
  }>,
): FsDir {
  return {
    type: 'directory',
    contents: {
      about: aboutDirectory(),
      team: teamDirectory(),
      companies: companiesDirectory(),
      blog: blogDirectory(blogPosts),
      admin: {
        type: 'directory',
        contents: {
          'cool.txt': {
            type: 'file',
            content: "There is a hidden command in the CLI called 'secret'",
          },
        },
      },
    },
  };
}

export function resolvePath(current: string, target: string): string {
  if (!target) return current;
  if (target === '/') return '/';
  if (target === '..') {
    const parts = current.split('/').filter(Boolean);
    parts.pop();
    return `/${parts.join('/')}`;
  }
  if (target.startsWith('../')) {
    const parts = current.split('/').filter(Boolean);
    parts.pop();
    const remaining = target.slice(3);
    const base = `/${parts.join('/')}`;
    return resolvePath(base === '/' ? '/' : base, remaining);
  }
  if (target.startsWith('/')) return target.replace(/\/+$/, '') || '/';
  const base = current === '/' ? '' : current;
  return `${base}/${target}`.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
}

export function getNode(root: FsDir, path: string): FsNode | null {
  if (path === '/' || path === '') return root;
  const parts = path.split('/').filter(Boolean);
  let node: FsNode = root;
  for (const part of parts) {
    if (node.type !== 'directory') return null;
    const child: FsNode | undefined = node.contents[part];
    if (!child) return null;
    node = child;
  }
  return node;
}

export function isDirectory(root: FsDir, path: string): boolean {
  const node = getNode(root, path);
  return node !== null && node.type === 'directory';
}

/** Directories first (alphabetical), then files (alphabetical) — matches the
 *  ordering used by the file-tree sidebar so `ls` and the tree show the same
 *  shape for the same directory. Visibility filtering (e.g. the tree hiding
 *  `private/`) is handled in the renderers, not here. */
export function listDirectory(root: FsDir, path: string): string[] {
  const node = getNode(root, path);
  if (!node || node.type !== 'directory') return [];
  const entries = Object.entries(node.contents);
  const dirs = entries
    .filter(([, v]) => v.type === 'directory')
    .map(([name]) => name)
    .sort((a, b) => a.localeCompare(b));
  const files = entries
    .filter(([, v]) => v.type === 'file')
    .map(([name]) => name)
    .sort((a, b) => a.localeCompare(b));
  return [...dirs, ...files];
}

export function readFile(root: FsDir, path: string): string | null {
  const node = getNode(root, path);
  if (!node || node.type !== 'file') return null;
  return node.content;
}
