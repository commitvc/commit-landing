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
  // `visibleCount` is the number of BOOT_LINES to render. Using a count
  // (instead of pushing strings into an array with setShown(prev => ...))
  // makes the effect idempotent: React Strict Mode's dev-only double-invoke
  // re-runs the effect but the state is re-derived from the count, so
  // nothing gets appended twice. Real remounts (route changes) still reset
  // and play the animation from scratch.
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const reduce = prefersReducedMotion();
    if (reduce) {
      setVisibleCount(BOOT_LINES.length);
      onDone();
      return;
    }
    let cancelled = false;
    let i = 0;
    function tick() {
      if (cancelled) return;
      i += 1;
      if (i > BOOT_LINES.length) {
        setTimeout(() => {
          if (!cancelled) onDone();
        }, 300);
        return;
      }
      setVisibleCount(i);
      setTimeout(tick, 350);
    }
    // Reset on every effect run so the second Strict Mode invocation
    // re-plays from the first line instead of continuing from where it was.
    setVisibleCount(0);
    tick();
    return () => {
      cancelled = true;
    };
  }, [onDone]);

  return (
    <div className={styles.boot} aria-hidden>
      {BOOT_LINES.slice(0, visibleCount).map((line, idx) => {
        const text = typeof line === 'function' ? line() : line;
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed, ordered sequence
          <div key={idx}>{text}</div>
        );
      })}
    </div>
  );
}
