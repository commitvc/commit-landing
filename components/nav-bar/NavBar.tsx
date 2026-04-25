'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useChrome } from '@/app/(chrome)/ChromeShell';
import styles from './NavBar.module.css';
import { activeTabFromPathname, TABS, type TabId } from './tabs';

type IndicatorRect = { left: number; width: number };

// SSR-safe layout effect
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function NavBar() {
  const pathname = usePathname() ?? '/';
  const active: TabId | null = activeTabFromPathname(pathname);
  // Single source of truth for "did anything on this page scroll yet" — both
  // LandingShell and ChromeShell publish into this context. The CSS reads
  // `var(--dash-opacity)` and we set it on the outer container element here,
  // so the dash-line visibility rule lives entirely inside this component.
  const { scrolled } = useChrome();
  const containerStyle = { ['--dash-opacity' as string]: scrolled ? 1 : 0 } as CSSProperties;

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Partial<Record<TabId, HTMLAnchorElement | null>>>({});
  const [rect, setRect] = useState<IndicatorRect | null>(null);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!active) {
      setRect(null);
      return;
    }
    const activeEl = itemRefs.current[active];
    if (!container || !activeEl) return;
    const containerRect = container.getBoundingClientRect();
    const elRect = activeEl.getBoundingClientRect();
    // The dash pattern is 8px dash + 2px gap, anchored to the viewport via
    // background-attachment: fixed. To avoid cropped dashes at the indicator
    // edges — and to stay perfectly aligned with the full nav underline —
    // snap the viewport-left down to the nearest 10k and the viewport-right
    // up to the nearest 10k+8, then grow the indicator outward to fit.
    const BLEED = 6;
    const PERIOD = 10;
    const DASH = 8;
    const vpLeftTarget = elRect.left - BLEED;
    const vpRightTarget = elRect.right + BLEED;
    const vpLeft = Math.floor(vpLeftTarget / PERIOD) * PERIOD;
    const vpRight = Math.ceil((vpRightTarget - DASH) / PERIOD) * PERIOD + DASH;
    setRect({
      left: vpLeft - containerRect.left,
      width: vpRight - vpLeft,
    });
  }, [active]);

  useIsoLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    if (document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }
    return () => window.removeEventListener('resize', onResize);
  }, [measure]);

  return (
    <div className={styles.container} style={containerStyle}>
      {/* Inner scroller for narrow viewports — keeps the dash line above
          (rendered as the outer container's ::after) outside the overflow
          clipping context so it spans edge-to-edge regardless of width. */}
      <div ref={containerRef} className={styles.scroller}>
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
      </div>
      {/* Indicator is a sibling of the scroller, inside the outer container,
          so the mobile mask-image on .scroller doesn't fade it when the
          active tab sits at the right edge (e.g. "About" on a phone).
          Position is computed against the scroller's rect — see measure(). */}
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
