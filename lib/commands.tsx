import Link from 'next/link';
import type { ReactNode } from 'react';
import { CompanyCard } from '@/components/cards/CompanyCard';
import { ProfileCard } from '@/components/cards/ProfileCard';
import { Firework } from '@/components/firework/Firework';
import { Linkify } from '@/components/linkify/Linkify';
import { ADVISORS } from './advisors';
import { COMPANIES } from './companies';
import type { FsDir } from './filesystem';
import { getNode, isDirectory, listDirectory, readFile, resolvePath } from './filesystem';
import { decrypt } from './tea';
import { TEAM } from './team';
import { toggleTheme } from './theme';

export type CommandContext = {
  fs: FsDir;
  cwd: string;
  setCwd: (path: string) => void;
  clear: () => void;
  toggleHeader: () => void;
};

export type Command = {
  name: string;
  description: string;
  hidden?: boolean;
  run: (args: string[], ctx: CommandContext) => ReactNode | Promise<ReactNode>;
};

function Yellow({ children }: { children: ReactNode }) {
  return <span className="yellow">{children}</span>;
}

function Blue({ children, href }: { children: ReactNode; href: string }) {
  const external = href.startsWith('http') || href.startsWith('mailto:');
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="blue">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className="blue">
      {children}
    </Link>
  );
}

/** Team members and companies are rendered by looking them up by slug and
 *  delegating to the shared ProfileCard / CompanyCard components — same ones
 *  used by the file-tree viewer, so `cat team/x.txt` / `cat companies/x.txt`
 *  and the tree preview stay in sync. */
function TeamProfileCard({ file }: { file: string }) {
  const slug = file.match(/^slug:(.+)$/)?.[1]?.trim();
  const member = slug ? TEAM.find((m) => m.slug === slug) : undefined;
  if (!member) return null;
  return <ProfileCard member={member} />;
}

function AdvisorProfileCard({ file }: { file: string }) {
  const slug = file.match(/^slug:(.+)$/)?.[1]?.trim();
  const advisor = slug ? ADVISORS.find((a) => a.slug === slug) : undefined;
  if (!advisor) return null;
  return <ProfileCard member={advisor} />;
}

function CompanyProfileCard({ file }: { file: string }) {
  const slug = file.match(/^slug:(.+)$/)?.[1]?.trim();
  const company = slug ? COMPANIES.find((c) => c.slug === slug) : undefined;
  if (!company) return null;
  return <CompanyCard company={company} />;
}

function BlogCard({ slug, file }: { slug: string; file: string }) {
  const parts = file.split('\n\n');
  const header = (parts[0] ?? '').split('\n');
  const title = header[0] ?? '';
  const byline = header[1] ?? '';
  const description = parts.slice(1).join('\n\n').trim();
  return (
    <div className="terminal-blog-card">
      <p>
        <Yellow>{title}</Yellow>
      </p>
      <p style={{ color: 'var(--fg-muted-hover)' }}>{byline}</p>
      <br />
      <p>{description}</p>
      <br />
      <p>
        <Blue href={`/blog/${slug}/`}>Open in full page →</Blue>
      </p>
    </div>
  );
}

function LegalCard({ file }: { file: string }) {
  const lines = file.split('\n');
  return (
    <div>
      {lines.map((raw, i) => {
        const trimmed = raw.trim();
        if (!trimmed) {
          // biome-ignore lint/suspicious/noArrayIndexKey: legal notice lines are stable
          return <br key={i} />;
        }
        const colonIdx = trimmed.indexOf(':');
        if (colonIdx > 0 && colonIdx < 30 && !trimmed.startsWith('Topics')) {
          const key = trimmed.slice(0, colonIdx);
          const val = trimmed.slice(colonIdx + 1).trim();
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: legal notice lines are stable
            <p key={i}>
              <Yellow>{key}</Yellow>: {val}
            </p>
          );
        }
        // biome-ignore lint/suspicious/noArrayIndexKey: legal notice lines are stable
        return <p key={i}>{trimmed}</p>;
      })}
      <br />
      <p>
        <Blue href="/about/legal/">Open full legal notice →</Blue>
      </p>
    </div>
  );
}

function ErrorLine({ children }: { children: ReactNode }) {
  return <span>{children}</span>;
}

/** Split a command-line into its tokens (whitespace-separated, no quotes). */
export function tokenize(input: string): string[] {
  return input.trim().split(/\s+/).filter(Boolean);
}

function renderFileAs(path: string, slug: string, content: string): ReactNode {
  const advisor = path.match(/\/team\/advisors\/([^/]+)\.txt$/);
  if (advisor && ADVISORS.some((item) => item.slug === advisor[1])) {
    return <AdvisorProfileCard file={content} />;
  }
  if (/(\/team\/)[^/]+\.txt$/.test(path)) return <TeamProfileCard file={content} />;
  if (/\/companies\//.test(path) && path.endsWith('.txt')) {
    return <CompanyProfileCard file={content} />;
  }
  if (/\/about\/legal\.txt$/.test(path)) return <LegalCard file={content} />;
  if (/\/blog\//.test(path) && path.endsWith('.txt')) {
    return <BlogCard slug={slug} file={content} />;
  }
  // Fallback for plain-text files (about/readme.txt, about/projects.txt,
  // about/contact.txt, team/advisors/advisors.txt, …). Match the file-tree
  // preview by running the body through <Linkify/> so emails and URLs are
  // clickable here too — same content shouldn't render different links
  // depending on whether the user `cat`-s it or clicks it in the sidebar.
  return (
    <div style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
      <Linkify text={content} />
    </div>
  );
}

const ls: Command = {
  name: 'ls',
  description: 'List directory contents',
  run(args, ctx) {
    const target = args[0] ?? ctx.cwd;
    const resolved = resolvePath(ctx.cwd, target);
    if (!isDirectory(ctx.fs, resolved)) {
      return <ErrorLine>ls: {target}: No such directory</ErrorLine>;
    }
    const entries = listDirectory(ctx.fs, resolved);
    return (
      <div className="ls-output">
        {entries.map((name) => {
          const childPath = resolvePath(resolved, name);
          const dir = isDirectory(ctx.fs, childPath);
          return (
            <div key={name}>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <span className={dir ? 'blue' : 'green'}>{name}</span>
            </div>
          );
        })}
      </div>
    );
  },
};

const cat: Command = {
  name: 'cat',
  description: 'Display file contents',
  run(args, ctx) {
    if (!args[0]) return <span>Usage: cat &lt;file&gt;</span>;
    const target = args[0];
    const resolved = resolvePath(ctx.cwd, target);
    const content = readFile(ctx.fs, resolved);
    if (content === null) {
      return <ErrorLine>cat: {target}: No such file or directory</ErrorLine>;
    }
    const slug =
      resolved
        .split('/')
        .pop()
        ?.replace(/\.txt$/, '') ?? '';
    return renderFileAs(resolved, slug, content);
  },
};

const cd: Command = {
  name: 'cd',
  description: 'Change directory',
  run(args, ctx) {
    if (!args[0]) {
      ctx.setCwd('/');
      return null;
    }
    const resolved = resolvePath(ctx.cwd, args[0]);
    if (!isDirectory(ctx.fs, resolved)) {
      return <ErrorLine>cd: {args[0]}: No such directory</ErrorLine>;
    }
    ctx.setCwd(resolved);
    return null;
  },
};

const clear: Command = {
  name: 'clear',
  description: 'Clear the terminal',
  run(_args, ctx) {
    ctx.clear();
    return null;
  },
};

const decryptCmd: Command = {
  name: 'decrypt',
  description: 'Decrypt text using a password',
  run(args) {
    if (args.length !== 2 || !args[0] || !args[1]) {
      return <span>Usage: decrypt &lt;encoded_text&gt; &lt;password&gt;</span>;
    }
    try {
      const out = decrypt(args[0], args[1]);
      return <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{out}</pre>;
    } catch {
      return <ErrorLine>Error: Invalid ciphertext or password</ErrorLine>;
    }
  },
};

const secret: Command = {
  name: 'secret',
  description: 'A command that is not listed in the help',
  hidden: true,
  run() {
    return <span>The password is: opensource</span>;
  },
};

const whois: Command = {
  name: 'whois',
  description: 'Query registration information',
  hidden: true,
  run(args) {
    if (!args[0] || args[0] !== 'commit.fund') {
      return <span>whois: try 'whois commit.fund'</span>;
    }
    return (
      <div className="command-output">
        <Yellow>Domain:</Yellow> commit.fund
        <br />
        <Yellow>Vehicle:</Yellow> &gt;commit (Fonds Professionnel de Capital Investissement)
        <br />
        <Yellow>Manager:</Yellow> Red River West SAS
        <br />
        {'                 '}9 rue des Colonnes du Trône, 75012 Paris, France
        <br />
        {'                 '}AMF Ref: GP-24000012
        <br />
        <Yellow>Focus:</Yellow> Pre-seed and seed commercial open source startups
        <br />
        <Yellow>Contact:</Yellow> hey@commit.fund
      </div>
    );
  },
};

const neofetch: Command = {
  name: 'neofetch',
  description: 'Display system information',
  hidden: true,
  run() {
    // Neofetch is rendered permanently at the top of the terminal; running
    // the command here just re-emits a short static echo.
    return (
      <div>
        <Yellow>Activity:</Yellow> Venture Capital
        <br />
        <br />
        <Yellow>Focus:</Yellow> Commercial Open Source & Community-driven software
        <br />
        <br />
        <Yellow>Stage:</Yellow> Pre-Seed & Seed
        <br />
        <br />
        <Yellow>Github:</Yellow> <Blue href="https://github.com/commitvc">github.com/commitvc</Blue>
      </div>
    );
  },
};

const firework: Command = {
  name: 'firework',
  description: 'Launch a fireworks show',
  run() {
    // Stable id so remounting this scrollback entry (e.g. switching tabs
    // back to /cli) doesn't replay the show — Firework dedupes by id.
    return <Firework id={`fw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`} />;
  },
};

const theme: Command = {
  name: 'theme',
  description: 'Switch between the dark and light theme',
  run() {
    // Purely a DOM + localStorage flip — see lib/theme.ts for why no React
    // state is involved. Safe to touch `document` here: commands only ever
    // run from the client-side terminal, never during SSR.
    const next = toggleTheme();
    return (
      <span>
        theme: <span className="purple">{next}</span>
      </span>
    );
  },
};

const header: Command = {
  name: 'header',
  description: 'Toggle between the welcome banner and the compact header',
  run(_args, ctx) {
    ctx.toggleHeader();
    return null;
  },
};

const email: Command = {
  name: 'email',
  description: 'Subscribe to our mailing list',
  hidden: true,
  run() {
    return (
      <p>
        To subscribe, send an email to{' '}
        <Blue href="mailto:hey@commit.fund?subject=Subscribe">hey@commit.fund</Blue>.
      </p>
    );
  },
};

const help: Command = {
  name: 'help',
  description: 'Show help message',
  run(args) {
    const visible = ALL_COMMANDS.filter((c) => !c.hidden).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    if (args.length === 1 && args[0]) {
      const name = args[0].toLowerCase();
      const found = ALL_COMMANDS.find((c) => c.name === name);
      if (found) {
        return (
          <div>
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="command">{found.name}</span> —{' '}
            {found.description}
          </div>
        );
      }
    }
    return (
      <div>
        <div>
          If you want to see the help for a specific command, type{' '}
          <span className="purple">'help'</span> and the command name
        </div>
        <div>Here are the available commands on this terminal:</div>
        {visible.map((c) => (
          <div key={c.name}>
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="command">{c.name}</span>
          </div>
        ))}
      </div>
    );
  },
};

export const ALL_COMMANDS: readonly Command[] = [
  ls,
  cat,
  cd,
  clear,
  decryptCmd,
  email,
  firework,
  header,
  help,
  neofetch,
  secret,
  theme,
  whois,
];

export function findCommand(name: string): Command | null {
  return ALL_COMMANDS.find((c) => c.name === name.toLowerCase()) ?? null;
}

export function autocomplete(input: string, ctx: CommandContext): string | null {
  const parts = input.split(/\s+/);
  if (parts.length <= 1) {
    const prefix = (parts[0] ?? '').toLowerCase();
    const match = ALL_COMMANDS.filter((c) => !c.hidden && c.name.startsWith(prefix));
    if (match.length === 1 && match[0]) return match[0].name;
    return null;
  }
  // Argument autocomplete for ls/cat/cd against the FS
  const cmd = parts[0];
  if (cmd === 'ls' || cmd === 'cat' || cmd === 'cd') {
    const partial = parts[parts.length - 1] ?? '';
    const lastSlash = partial.lastIndexOf('/');
    const dirPart = lastSlash >= 0 ? partial.slice(0, lastSlash + 1) : '';
    const namePart = lastSlash >= 0 ? partial.slice(lastSlash + 1) : partial;
    const resolvedDir = resolvePath(ctx.cwd, dirPart || '.');
    const node = getNode(ctx.fs, resolvedDir);
    if (!node || node.type !== 'directory') return null;
    const matches = Object.keys(node.contents).filter((n) => n.startsWith(namePart));
    const onlyMatch = matches[0];
    if (matches.length === 1 && onlyMatch) {
      const child = node.contents[onlyMatch];
      const suffix = child?.type === 'directory' ? '/' : '';
      const before = parts.slice(0, -1).join(' ');
      return `${before} ${dirPart}${onlyMatch}${suffix}`;
    }
  }
  return null;
}
