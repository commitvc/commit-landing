'use client';

import { PromptEcho } from '@/components/cli-terminal/PromptEcho';
import { NavBar } from '@/components/nav-bar/NavBar';
import { useCallback, useEffect, useState } from 'react';
import { BootAnimation } from './BootAnimation';
import { Neofetch } from './Neofetch';
import styles from './WelcomeHeader.module.css';

type Phase = 'boot' | 'welcome-neofetch' | 'welcome-tagline' | 'welcome-nav' | 'ready';

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

type Props = {
  /** Called once the welcome animation finishes and the nav is revealed,
      so the CLI below can enable its prompt. */
  onReady?: () => void;
};

/**
 * The full landing-page header: boot log → `>neofetch` echo → Neofetch card
 * → tagline → NavBar. Each section reveals in sequence; the nav's dash line
 * is the sharp bottom limit of this zone.
 */
export function WelcomeHeader({ onReady }: Props) {
  const [phase, setPhase] = useState<Phase>('boot');

  const onBootDone = useCallback(() => setPhase('welcome-neofetch'), []);

  useEffect(() => {
    if (phase === 'boot' || phase === 'ready') return;
    const reduce = prefersReducedMotion();
    const gap = reduce ? 0 : 450;
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (phase === 'welcome-neofetch') {
      timers.push(setTimeout(() => setPhase('welcome-tagline'), gap));
    } else if (phase === 'welcome-tagline') {
      timers.push(setTimeout(() => setPhase('welcome-nav'), gap));
    } else if (phase === 'welcome-nav') {
      timers.push(
        setTimeout(
          () => {
            setPhase('ready');
            onReady?.();
          },
          Math.max(200, gap - 200),
        ),
      );
    }
    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, [phase, onReady]);

  const showNeofetch =
    phase === 'welcome-neofetch' ||
    phase === 'welcome-tagline' ||
    phase === 'welcome-nav' ||
    phase === 'ready';
  const showTagline = phase === 'welcome-tagline' || phase === 'welcome-nav' || phase === 'ready';
  const showNav = phase === 'welcome-nav' || phase === 'ready';

  return (
    <header className={styles.header}>
      <BootAnimation onDone={onBootDone} />
      <div className={styles.welcome}>
        {showNeofetch ? (
          <>
            <PromptEcho cwd="/" line="neofetch" />
            <Neofetch />
          </>
        ) : null}
        {showTagline ? (
          <p className={styles.tagline}>
            Type <span className="yellow">'help'</span> to get started, or click a tab below — we
            won't judge
          </p>
        ) : null}
        {showNav ? <NavBar /> : null}
      </div>
    </header>
  );
}
