export type TabId = 'cli' | 'companies' | 'blog' | 'team' | 'insights' | 'about';

export type Tab = {
  id: TabId;
  label: string;
  href: string;
};

export const TABS: readonly Tab[] = [
  { id: 'cli', label: 'CLI', href: '/cli' },
  { id: 'companies', label: 'Companies', href: '/companies' },
  { id: 'team', label: 'Team', href: '/team' },
  { id: 'insights', label: 'Insights', href: '/insights' },
  { id: 'blog', label: 'Blog', href: '/blog' },
  { id: 'about', label: 'About', href: '/about' },
] as const;

export function activeTabFromPathname(pathname: string): TabId | null {
  const clean = pathname.replace(/\/+$/, '') || '/';
  // Landing (/) is the hero; the CLI tab highlights for both the landing
  // and the dedicated /cli utility page.
  if (clean === '/' || clean === '/cli') return 'cli';
  if (clean.startsWith('/companies')) return 'companies';
  if (clean.startsWith('/blog')) return 'blog';
  if (clean.startsWith('/team')) return 'team';
  if (clean.startsWith('/insights')) return 'insights';
  if (clean.startsWith('/about')) return 'about';
  // Unknown routes (e.g. 404) — no tab highlighted.
  return null;
}
