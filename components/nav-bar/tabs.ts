export type TabId = 'cli' | 'companies' | 'blog' | 'team' | 'about';

export type Tab = {
  id: TabId;
  label: string;
  href: string;
};

export const TABS: readonly Tab[] = [
  { id: 'cli', label: 'CLI', href: '/' },
  { id: 'companies', label: 'Companies', href: '/companies' },
  { id: 'blog', label: 'Blog', href: '/blog' },
  { id: 'team', label: 'Team', href: '/team' },
  { id: 'about', label: 'About', href: '/about' },
] as const;

export function activeTabFromPathname(pathname: string): TabId {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/' || clean === '/cli') return 'cli';
  if (clean.startsWith('/companies')) return 'companies';
  if (clean.startsWith('/blog')) return 'blog';
  if (clean.startsWith('/team')) return 'team';
  if (clean.startsWith('/about')) return 'about';
  return 'cli';
}
