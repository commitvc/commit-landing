'use client';

import { CompactHeader } from '@/components/compact-header/CompactHeader';
import {
  type CSSProperties,
  type ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

type ChromeCtx = {
  setScrolled: (s: boolean) => void;
};

const ChromeContext = createContext<ChromeCtx>({ setScrolled: () => {} });

export function useChrome(): ChromeCtx {
  return useContext(ChromeContext);
}

/**
 * Shared chrome for /cli and the tab pages: mounts CompactHeader once and
 * keeps it mounted across route changes within the (chrome) group, so the
 * logo + nav don't re-animate when navigating between /cli and /companies,
 * /blog, /team, /about. Pages report their scroll state via useChrome()
 * so the NavBar's dash line can fade in.
 */
export function ChromeShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const style = {
    display: 'contents',
    ['--dash-opacity' as string]: scrolled ? 1 : 0,
  } as CSSProperties;
  const ctx = useMemo<ChromeCtx>(() => ({ setScrolled }), []);
  return (
    <div style={style}>
      <CompactHeader />
      <ChromeContext.Provider value={ctx}>{children}</ChromeContext.Provider>
    </div>
  );
}
