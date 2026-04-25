'use client';

import { useCliState } from '@/components/cli-terminal/CliStateContext';
import { CompactHeader } from '@/components/compact-header/CompactHeader';
import { WelcomeHeader } from '@/components/welcome-header/WelcomeHeader';
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
  const { headerSwapped } = useCliState();
  const [scrolled, setScrolled] = useState(false);
  const style = {
    display: 'contents',
    ['--dash-opacity' as string]: scrolled ? 1 : 0,
  } as CSSProperties;
  const ctx = useMemo<ChromeCtx>(() => ({ setScrolled }), []);
  // Default in the (chrome) group is the compact header; the `header` command
  // swaps to the welcome variant, without the boot loader.
  return (
    <div style={style}>
      {headerSwapped ? <WelcomeHeader skipBoot /> : <CompactHeader />}
      <ChromeContext.Provider value={ctx}>{children}</ChromeContext.Provider>
    </div>
  );
}
