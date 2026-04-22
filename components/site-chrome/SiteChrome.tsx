import { AsciiLogo } from '@/components/ascii-logo/AsciiLogo';
import { NavBar } from '@/components/nav-bar/NavBar';
import type { ReactNode } from 'react';

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <AsciiLogo />
      <NavBar />
      {children}
    </>
  );
}
