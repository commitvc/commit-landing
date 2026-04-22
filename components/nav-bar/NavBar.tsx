'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './NavBar.module.css';
import { TABS, type TabId, activeTabFromPathname } from './tabs';

type IndicatorRect = { left: number; width: number };

// SSR-safe layout effect
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function NavBar() {
  const pathname = usePathname() ?? '/';
  const active: TabId = activeTabFromPathname(pathname);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Partial<Record<TabId, HTMLAnchorElement | null>>>({});
  const [rect, setRect] = useState<IndicatorRect | null>(null);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const activeEl = itemRefs.current[active];
    if (!container || !activeEl) return;
    const containerRect = container.getBoundingClientRect();
    const elRect = activeEl.getBoundingClientRect();
    // Extend the indicator a few px on each side so it feels a bit larger
    // than the tab's text bounds.
    const BLEED = 6;
    setRect({
      left: elRect.left - containerRect.left - BLEED,
      width: elRect.width + BLEED * 2,
    });
  }, [active]);

  useIsoLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    // Remeasure once fonts have settled to avoid indicator width drift.
    if (document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }
    return () => window.removeEventListener('resize', onResize);
  }, [measure]);

  return (
    <div ref={containerRef} className={styles.container}>
      <nav className={styles.nav} aria-label="Primary">
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              ref={(el) => {
                itemRefs.current[tab.id] = el;
              }}
              className={styles.item}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {rect ? (
        <span
          aria-hidden
          className={styles.indicator}
          style={{ left: `${rect.left}px`, width: `${rect.width}px` }}
        />
      ) : null}
    </div>
  );
}
