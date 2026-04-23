'use client';

import { type ReactNode, type UIEvent, useCallback, useRef } from 'react';
import { useChrome } from '../ChromeShell';
import styles from './SiteContent.module.css';

type Props = { children: ReactNode };

export function SiteShell({ children }: Props) {
  const { setScrolled } = useChrome();
  const scrolledRef = useRef(false);

  const onScroll = useCallback(
    (e: UIEvent<HTMLElement>) => {
      const next = e.currentTarget.scrollTop > 0;
      if (scrolledRef.current !== next) {
        scrolledRef.current = next;
        setScrolled(next);
      }
    },
    [setScrolled],
  );

  return (
    <main className={styles.content} onScroll={onScroll}>
      {children}
    </main>
  );
}
