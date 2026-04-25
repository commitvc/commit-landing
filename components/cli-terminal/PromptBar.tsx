'use client';

import type { CSSProperties, KeyboardEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  // Where the native caret currently sits inside `value`. Used to reposition
  // the visible underscore cursor so it tracks the caret as the user moves
  // it via arrow keys / Home / End / clicks inside the input.
  const [caretPos, setCaretPos] = useState(0);
  // Only render the blinking cursor while the input is actually focused —
  // a blinking cursor on an unfocused field misleads users into thinking
  // they can type directly. Click anywhere in the terminal (handled in
  // CliTerminal's root onClick) to refocus.
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  const path = cwd === '/' ? '' : cwd;

  // Sync `caretPos` from the DOM after the browser settles selection. We
  // wrap in rAF because some events (onChange, onKeyDown w/ preventDefault)
  // fire before the input's selectionStart has been updated.
  const syncCaret = useCallback(() => {
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (input) setCaretPos(input.selectionStart ?? input.value.length);
    });
  }, []);

  // Track caret position via the document-level `selectionchange` event
  // while the input is focused. The native `select` event only fires for
  // real selections (highlighting), not for bare caret moves (arrow keys,
  // Home/End, clicks in already-typed text), so it isn't enough on its
  // own. `selectionchange` covers every move, programmatic or user-driven.
  useEffect(() => {
    if (!focused) return;
    const handler = () => {
      const input = inputRef.current;
      if (input && document.activeElement === input) {
        setCaretPos(input.selectionStart ?? input.value.length);
      }
    };
    handler(); // initial read on focus
    document.addEventListener('selectionchange', handler);
    return () => document.removeEventListener('selectionchange', handler);
  }, [focused]);

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

  // Move the visible underscore from "after the input" (offset 0) leftward
  // to the actual caret column. Width is 1ch per char in the monospace font,
  // so `translateX((caretPos - value.length)ch)` lines up exactly. `transform`
  // is paint-only — the input's natural width still reserves space at the
  // right end for the cursor's resting position.
  const cursorStyle: CSSProperties = {
    transform: `translateX(${caretPos - value.length}ch)`,
  };

  return (
    <div className={styles.liveBar}>
      <span className={styles.prompt}>user@commit.fund</span>
      {path ? <span>{path}</span> : null}
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
        onChange={(e) => {
          setValue(e.target.value);
          syncCaret();
        }}
        onKeyDown={handleKeyDown}
        // onKeyUp + onClick + onSelect together cover every way the caret
        // can move (typing, arrow/Home/End keys, mouse clicks inside the
        // text, native text-selection drags). Each one re-reads the DOM's
        // selectionStart so the visible cursor stays aligned.
        onKeyUp={syncCaret}
        onClick={syncCaret}
        onSelect={syncCaret}
        onFocus={() => {
          setFocused(true);
          syncCaret();
        }}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        style={{ width: `${value.length}ch` }}
      />
      {focused ? (
        <span className={styles.cursor} style={cursorStyle}>
          _
        </span>
      ) : null}
    </div>
  );
}
