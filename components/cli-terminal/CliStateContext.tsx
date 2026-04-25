'use client';

import { usePathname } from 'next/navigation';
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export type OutputEntry = { id: string; node: ReactNode };

type CliState = {
  output: OutputEntry[];
  cwd: string;
  setCwd: (cwd: string) => void;
  append: (label: string, node: ReactNode) => void;
  clear: () => void;
  /** True when the user has flipped the default header for the current shell
      (welcome ↔ compact) via the `header` command. */
  headerSwapped: boolean;
  toggleHeader: () => void;
  resetHeader: () => void;
  /** Bumped when the user clicks the ASCII logo to "go home". The landing
      shell watches this to replay the boot animation when the user is
      already on `/` (same-route click, no remount). */
  landingNonce: number;
  bumpLandingNonce: () => void;
};

const CliStateContext = createContext<CliState | null>(null);

/**
 * Holds the terminal's persistent state (command history + output log +
 * current working directory) at the root of the app so navigating between
 * the landing (`/`) and `/cli` keeps what the user has already typed.
 */
export function CliStateProvider({ children }: { children: ReactNode }) {
  const [output, setOutput] = useState<OutputEntry[]>([]);
  const [cwd, setCwd] = useState('/');
  const [headerSwapped, setHeaderSwapped] = useState(false);
  const [landingNonce, setLandingNonce] = useState(0);
  const runIdRef = useRef(0);

  const toggleHeader = useCallback(() => setHeaderSwapped((v) => !v), []);
  const resetHeader = useCallback(() => setHeaderSwapped(false), []);
  const bumpLandingNonce = useCallback(() => setLandingNonce((n) => n + 1), []);

  // Reset the header swap whenever the route changes so each page always
  // opens with its natural header (welcome on `/`, compact elsewhere). The
  // dep is the trigger — pathname isn't read in the body but its change is
  // exactly what we want to react to.
  const pathname = usePathname();
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger, not a value used in the body
  useEffect(() => {
    setHeaderSwapped(false);
  }, [pathname]);

  const nextId = useCallback((label: string) => {
    runIdRef.current += 1;
    return `${label}-${runIdRef.current}`;
  }, []);

  const append = useCallback(
    (label: string, node: ReactNode) => {
      setOutput((prev) => [...prev, { id: nextId(label), node }]);
    },
    [nextId],
  );

  const clear = useCallback(() => {
    setOutput([]);
  }, []);

  const value = useMemo<CliState>(
    () => ({
      output,
      cwd,
      setCwd,
      append,
      clear,
      headerSwapped,
      toggleHeader,
      resetHeader,
      landingNonce,
      bumpLandingNonce,
    }),
    [
      output,
      cwd,
      append,
      clear,
      headerSwapped,
      toggleHeader,
      resetHeader,
      landingNonce,
      bumpLandingNonce,
    ],
  );

  return <CliStateContext.Provider value={value}>{children}</CliStateContext.Provider>;
}

export function useCliState(): CliState {
  const ctx = useContext(CliStateContext);
  if (!ctx) {
    throw new Error('useCliState must be used inside <CliStateProvider>');
  }
  return ctx;
}
