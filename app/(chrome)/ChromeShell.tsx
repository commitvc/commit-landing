'use client';

import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';
import { useCliState } from '@/components/cli-terminal/CliStateContext';
import { CompactHeader } from '@/components/compact-header/CompactHeader';
import { WelcomeHeader } from '@/components/welcome-header/WelcomeHeader';

type ChromeCtx = {
  /** Whether any scroll container on the current page has scrolled. NavBar
   *  reads this to decide its dash-line opacity — single source of truth so
   *  the visibility rule lives entirely inside the NavBar component. */
  scrolled: boolean;
  setScrolled: (s: boolean) => void;
};

const ChromeContext = createContext<ChromeCtx>({ scrolled: false, setScrolled: () => {} });

export function useChrome(): ChromeCtx {
  return useContext(ChromeContext);
}

/**
 * Wraps children with the scroll-state context that NavBar reads to control
 * its own dash-line opacity. Used by both `LandingShell` (`/`) and
 * `ChromeShell` (`/cli` + tabs + 404) so every page has the same provider —
 * NavBar doesn't have to care which shell it's mounted under.
 */
export function ChromeProvider({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const ctx = useMemo<ChromeCtx>(() => ({ scrolled, setScrolled }), [scrolled]);
  return <ChromeContext.Provider value={ctx}>{children}</ChromeContext.Provider>;
}

/**
 * Shared chrome for /cli and the tab pages: mounts CompactHeader once and
 * keeps it mounted across route changes within the (chrome) group, so the
 * logo + nav don't re-animate when navigating between /cli and /companies,
 * /blog, /team, /about. Pages report their scroll state via useChrome()
 * and NavBar consumes it to drive the dash-line opacity itself.
 */
export function ChromeShell({ children }: { children: ReactNode }) {
  const { headerSwapped } = useCliState();
  // Default in the (chrome) group is the compact header; the `header` command
  // swaps to the welcome variant, without the boot loader.
  return (
    <ChromeProvider>
      {headerSwapped ? <WelcomeHeader skipBoot /> : <CompactHeader />}
      {children}
    </ChromeProvider>
  );
}
