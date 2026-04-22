import { SiteChrome } from '@/components/site-chrome/SiteChrome';
import type { ReactNode } from 'react';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
