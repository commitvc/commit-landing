'use client';

import { NavBar } from '@/components/nav-bar/NavBar';
import { type CommandContext, autocomplete, findCommand, tokenize } from '@/lib/commands';
import type { FsDir } from '@/lib/filesystem';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BootAnimation } from './BootAnimation';
import { Neofetch } from './Neofetch';
import { PromptBar } from './PromptBar';
import styles from './Terminal.module.css';

type OutputEntry = { id: string; node: ReactNode };

type TerminalProps = { fs: FsDir };

type Phase = 'boot' | 'welcome-neofetch' | 'welcome-tagline' | 'welcome-nav' | 'ready';

function PromptEcho({ cwd, line }: { cwd: string; line: string }) {
  const promptText = cwd === '/' ? 'user@commit.fund' : `user@commit.fund:${cwd}`;
  return (
    <div className={styles.promptLine}>
      <span className={styles.prompt}>{promptText}</span>
      <span className={styles.promptSeparator}>&gt;</span>
      <span>{line}</span>
    </div>
  );
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function Terminal({ fs }: TerminalProps) {
  const [output, setOutput] = useState<OutputEntry[]>([]);
  const [cwd, setCwd] = useState('/');
  const [phase, setPhase] = useState<Phase>('boot');
  const runIdRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const ctx = useMemo<CommandContext>(() => ({ fs, cwd, setCwd, clear }), [fs, cwd, clear]);

  const onBootDone = useCallback(() => setPhase('welcome-neofetch'), []);

  // Welcome sequence — run once, after boot.
  useEffect(() => {
    if (phase === 'boot' || phase === 'ready') return;
    const reduce = prefersReducedMotion();
    const gap = reduce ? 0 : 450;
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (phase === 'welcome-neofetch') {
      append('welcome-echo', <PromptEcho cwd="/" line="neofetch" />);
      append('welcome-neofetch', <Neofetch />);
      timers.push(setTimeout(() => setPhase('welcome-tagline'), gap));
    } else if (phase === 'welcome-tagline') {
      append(
        'welcome-tagline',
        <p className={styles.tagline}>
          Type <span className="yellow">'help'</span> to get started, or click a tab below — we
          won't judge
        </p>,
      );
      timers.push(setTimeout(() => setPhase('welcome-nav'), gap));
    } else if (phase === 'welcome-nav') {
      append('welcome-nav', <NavBar />);
      timers.push(setTimeout(() => setPhase('ready'), Math.max(200, gap - 200)));
    }
    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, [phase, append]);

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
            <span className="red">{name}</span>: command not found. Type 'help' for options.
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
    const input = containerRef.current?.querySelector<HTMLInputElement>('input');
    input?.focus();
  }, []);

  return (
    <div
      ref={containerRef}
      className={styles.terminal}
      onClick={focusInput}
      onKeyDown={focusInput}
      role="presentation"
    >
      <BootAnimation onDone={onBootDone} />
      <div className={styles.output} role="log" aria-live="polite" aria-label="Terminal output">
        {output.map((entry) => (
          <div key={entry.id} className={styles.line}>
            {entry.node}
          </div>
        ))}
      </div>
      {phase === 'ready' ? <PromptBar cwd={cwd} onSubmit={handleSubmit} suggest={suggest} /> : null}
    </div>
  );
}
