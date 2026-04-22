'use client';

import { type CommandContext, autocomplete, findCommand, tokenize } from '@/lib/commands';
import type { FsDir } from '@/lib/filesystem';
import type { ReactNode } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { BootAnimation } from './BootAnimation';
import { Neofetch } from './Neofetch';
import { PromptBar } from './PromptBar';
import styles from './Terminal.module.css';

type OutputEntry = { id: number; node: ReactNode };

type TerminalProps = {
  fs: FsDir;
};

export function Terminal({ fs }: TerminalProps) {
  const [output, setOutput] = useState<OutputEntry[]>([]);
  const [cwd, setCwd] = useState('/');
  const [bootDone, setBootDone] = useState(false);
  const idRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleBootDone = useCallback(() => setBootDone(true), []);

  const nextId = useCallback(() => {
    idRef.current += 1;
    return idRef.current;
  }, []);

  const append = useCallback(
    (node: ReactNode) => {
      setOutput((prev) => [...prev, { id: nextId(), node }]);
    },
    [nextId],
  );

  const clear = useCallback(() => {
    setOutput([]);
  }, []);

  const ctx = useMemo<CommandContext>(() => ({ fs, cwd, setCwd, clear }), [fs, cwd, clear]);

  const handleSubmit = useCallback(
    (line: string) => {
      const echoPrompt = cwd === '/' ? 'user@commit.fund' : `user@commit.fund:${cwd}`;
      append(
        <div className={styles.promptLine}>
          <span className={styles.prompt}>{echoPrompt}</span>
          <span className={styles.promptSeparator}>&gt;</span>
          <span>{line}</span>
        </div>,
      );
      const tokens = tokenize(line);
      if (tokens.length === 0) return;
      const [name, ...args] = tokens;
      if (!name) return;
      const cmd = findCommand(name);
      if (!cmd) {
        append(
          <p>
            <span className="red">{name}</span>: command not found. Type 'help' for options.
          </p>,
        );
        return;
      }
      Promise.resolve(cmd.run(args, ctx)).then((node) => {
        if (node !== null && node !== undefined) append(node);
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
      <div className={`${styles.bootContainer} ${bootDone ? styles.bootContainerCollapsed : ''}`}>
        <BootAnimation onDone={handleBootDone} />
      </div>
      <Neofetch />
      <div className={styles.output} role="log" aria-live="polite" aria-label="Terminal output">
        {output.map((entry) => (
          <div key={entry.id} className={styles.line}>
            {entry.node}
          </div>
        ))}
      </div>
      <PromptBar cwd={cwd} onSubmit={handleSubmit} suggest={suggest} disabled={!bootDone} />
    </div>
  );
}
