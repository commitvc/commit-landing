'use client';

import { CompactHeader } from '@/components/compact-header/CompactHeader';
import type { CSSProperties, ReactNode, UIEvent } from 'react';
import { useCallback, useRef, useState } from 'react';
import styles from './SiteContent.module.css';

type Props = { children: ReactNode };

export function SiteShell({ children }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);

  const onScroll = useCallback((e: UIEvent<HTMLElement>) => {
    const next = e.currentTarget.scrollTop > 0;
    if (scrolledRef.current !== next) {
      scrolledRef.current = next;
      setScrolled(next);
    }
  }, []);

  const style = {
    display: 'contents',
    ['--dash-opacity' as string]: scrolled ? 1 : 0,
  } as CSSProperties;

  return (
    <div style={style}>
      <CompactHeader />
      <main className={styles.content} onScroll={onScroll}>
        {children}
      </main>
    </div>
  );
}
