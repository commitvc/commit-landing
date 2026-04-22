'use client';

import type { KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import styles from './CliTerminal.module.css';

export type PromptBarProps = {
  cwd: string;
  onSubmit: (line: string) => void;
  suggest: (input: string) => string | null;
  disabled?: boolean;
};

export function PromptBar({ cwd, onSubmit, suggest, disabled }: PromptBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  const promptText = cwd === '/' ? 'user@commit.fund' : `user@commit.fund:${cwd}`;

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const line = value;
      if (line.trim()) {
        setHistory((h) => [...h, line]);
      }
      setHistoryIdx(-1);
      setValue('');
      onSubmit(line);
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const completed = suggest(value);
      if (completed) setValue(completed);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setValue(history[nextIdx] ?? '');
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx >= history.length) {
        setHistoryIdx(-1);
        setValue('');
      } else {
        setHistoryIdx(nextIdx);
        setValue(history[nextIdx] ?? '');
      }
      return;
    }
  }

  return (
    <div className={styles.promptLine}>
      <span className={styles.prompt}>{promptText}</span>
      <span className={styles.promptSeparator}>&gt;</span>
      <input
        ref={inputRef}
        className={styles.input}
        type="text"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Terminal command input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        style={{ width: `${value.length}ch` }}
      />
      <span className={styles.cursor}>_</span>
    </div>
  );
}
