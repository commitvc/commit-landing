'use client';

import { useEffect, useState } from 'react';
import styles from './WelcomeHeader.module.css';

/** Marker used in BOOT_LINE_KEYS to mean "render the live clock here". The
 *  actual text is computed at render time from the `now` state. */
const NOW = Symbol('now');
const BOOT_LINE_KEYS = [
  'System loading...',
  NOW,
  'Thanks for your interest in >commit',
  'Ready.',
] as const;
const TOTAL_LINES = BOOT_LINE_KEYS.length;

type Props = {
  onDone: () => void;
  /** When true, render every line immediately (no typing animation) and
      fire `onDone` on the next tick. Used when returning to the welcome
      header via the `header` command: the loading text should still be
      visible for layout/consistency, but we don't want to replay the
      animation the user has already seen this session. */
  instant?: boolean;
};

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function BootAnimation({ onDone, instant = false }: Props) {
  // `visibleCount` is the number of BOOT_LINE_KEYS to render. Using a count
  // (instead of pushing strings into an array with setShown(prev => ...))
  // makes the effect idempotent: React Strict Mode's dev-only double-invoke
  // re-runs the effect but the state is re-derived from the count, so
  // nothing gets appended twice. Real remounts (route changes) still reset
  // and play the animation from scratch.
  const [visibleCount, setVisibleCount] = useState(instant ? TOTAL_LINES : 0);
  // Live clock for the date line — updates every second so the boot log's
  // timestamp keeps ticking instead of freezing at first paint.
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    if (instant) {
      setVisibleCount(TOTAL_LINES);
      // Don't call onDone: in instant mode the parent already starts at
      // phase='ready', and advancing the phase would regress it and
      // replay the staged reveals.
      return;
    }
    const reduce = prefersReducedMotion();
    if (reduce) {
      setVisibleCount(TOTAL_LINES);
      onDone();
      return;
    }
    let cancelled = false;
    let i = 0;
    function tick() {
      if (cancelled) return;
      i += 1;
      if (i > TOTAL_LINES) {
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
  }, [onDone, instant]);

  // Drive the live clock once the date line is on screen. Re-rendering at
  // 1 Hz is cheap (single text node, negligible reconciliation) and stops
  // automatically when the component unmounts (route change, header swap).
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.boot} aria-hidden>
      {BOOT_LINE_KEYS.slice(0, visibleCount).map((key, idx) => {
        // Date.toString() trails with " (Central European Summer Time)" or
        // similar — drop that parenthesised timezone name; the GMT offset
        // alone is enough information for the boot line.
        const text = key === NOW ? now.toString().replace(/\s+\([^)]+\)$/, '') : key;
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed, ordered sequence
          <div key={idx}>{text}</div>
        );
      })}
    </div>
  );
}
