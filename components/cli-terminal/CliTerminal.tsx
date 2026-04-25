'use client';

import { type CommandContext, autocomplete, findCommand, tokenize } from '@/lib/commands';
import type { FsDir } from '@/lib/filesystem';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCliState } from './CliStateContext';
import styles from './CliTerminal.module.css';
import { PromptBar } from './PromptBar';
import { PromptEcho } from './PromptEcho';

type Props = {
  fs: FsDir;
  /** Fired when the scrollable zone transitions between top (false) and
      scrolled (true). The parent shell uses this to fade the nav dash line. */
  onScrolledChange?: (scrolled: boolean) => void;
};

export function CliTerminal({ fs, onScrolledChange }: Props) {
  // CLI output and cwd are stored in a provider above the root so they
  // persist across navigations between / (landing) and /cli.
  const { output, cwd, setCwd, append, clear, toggleHeader } = useCliState();
  const scrolledRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);

  const ctx = useMemo<CommandContext>(
    () => ({ fs, cwd, setCwd, clear, toggleHeader }),
    [fs, cwd, setCwd, clear, toggleHeader],
  );

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const next = el.scrollTop > 0;
    if (scrolledRef.current !== next) {
      scrolledRef.current = next;
      onScrolledChange?.(next);
    }
    const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAtBottom(gap < 5);
  }, [onScrolledChange]);

  // Auto-scroll to the bottom whenever a new entry lands so the prompt
  // stays in view. Also fires on mount when mounting with pre-existing
  // persisted output (coming back to / after running commands on /cli).
  const entryCount = output.length;
  // biome-ignore lint/correctness/useExhaustiveDependencies: entryCount is the trigger; scrollRef is stable
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    setAtBottom(true);
  }, [entryCount]);

  const handleSubmit = useCallback(
    (line: string) => {
      append('echo', <PromptEcho cwd={cwd} line={line} />);
      const tokens = tokenize(line);
      if (tokens.length === 0) return;
      const [name, ...args] = tokens;
      if (!name) return;
      const cmd = findCommand(name);
      if (!cmd) {
        append(
          'not-found',
          <p>
            <span className="purple">{name}</span>: command not found. Type{' '}
            <span className="purple">'help'</span> for options.
          </p>,
        );
        return;
      }
      Promise.resolve(cmd.run(args, ctx)).then((node) => {
        if (node !== null && node !== undefined) append('result', node);
      });
    },
    [append, ctx, cwd],
  );

  const suggest = useCallback((input: string) => autocomplete(input, ctx), [ctx]);

  const focusInput = useCallback(() => {
    const input = rootRef.current?.querySelector<HTMLInputElement>('input');
    input?.focus();
  }, []);

  return (
    <div
      ref={rootRef}
      className={styles.terminal}
      onClick={focusInput}
      onKeyDown={focusInput}
      role="presentation"
    >
      <div
        ref={scrollRef}
        className={`${styles.scrollable} ${atBottom ? '' : styles.scrolledUp}`}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
      >
        {output.map((entry) => (
          <div key={entry.id} className={styles.line}>
            {entry.node}
          </div>
        ))}
      </div>
      <PromptBar cwd={cwd} onSubmit={handleSubmit} suggest={suggest} />
    </div>
  );
}
