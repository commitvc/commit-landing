'use client';

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
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
  compact: boolean;
  setCompact: (v: boolean) => void;
  toggleCompact: () => void;
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
  const [compact, setCompact] = useState(false);
  const runIdRef = useRef(0);

  const toggleCompact = useCallback(() => setCompact((v) => !v), []);

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
    () => ({ output, cwd, setCwd, append, clear, compact, setCompact, toggleCompact }),
    [output, cwd, append, clear, compact, toggleCompact],
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
