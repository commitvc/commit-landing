'use client';

import { useEffect, useState } from 'react';
import styles from './WelcomeHeader.module.css';

const BOOT_LINES = [
  'System loading...',
  () => new Date().toString(),
  'Thanks for your interest in >commit',
  'Ready.',
] as const;

type Props = { onDone: () => void };

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function BootAnimation({ onDone }: Props) {
  const [shown, setShown] = useState<string[]>([]);

  useEffect(() => {
    const reduce = prefersReducedMotion();
    if (reduce) {
      setShown(BOOT_LINES.map((l) => (typeof l === 'function' ? l() : l)));
      onDone();
      return;
    }
    let cancelled = false;
    let i = 0;
    function next() {
      if (cancelled) return;
      if (i >= BOOT_LINES.length) {
        setTimeout(() => {
          if (!cancelled) onDone();
        }, 300);
        return;
      }
      const line = BOOT_LINES[i];
      const text = typeof line === 'function' ? line() : line;
      setShown((prev) => [...prev, text ?? '']);
      i += 1;
      setTimeout(next, 350);
    }
    next();
    return () => {
      cancelled = true;
    };
  }, [onDone]);

  return (
    <div className={styles.boot} aria-hidden>
      {shown.map((line, idx) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: boot lines are a fixed sequence
        <div key={idx}>{line}</div>
      ))}
    </div>
  );
}
