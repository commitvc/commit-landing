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
  /** If true, skip the boot log + staged reveals and mount directly in the
      final 'ready' state. Used when the user toggles the header via the
      `header` command — we don't want to replay the loader. */
  skipBoot?: boolean;
};

/**
 * The full landing-page header: boot log → `>neofetch` echo → Neofetch card
 * → tagline → NavBar. Each section reveals in sequence; the nav's dash line
 * is the sharp bottom limit of this zone.
 */
export function WelcomeHeader({ onReady, skipBoot = false }: Props) {
  const [phase, setPhase] = useState<Phase>(skipBoot ? 'ready' : 'boot');

  const onBootDone = useCallback(() => setPhase('welcome-neofetch'), []);

  // When the parent skips the boot animation (returning to welcome via the
  // `header` command), the staged-reveal effect below never runs, so onReady
  // would otherwise never fire. Trigger it explicitly. `onReady` is stable
  // in practice (parents wrap it in useCallback), so re-firing is a no-op.
  useEffect(() => {
    if (skipBoot) onReady?.();
  }, [skipBoot, onReady]);

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
      <BootAnimation instant={skipBoot} onDone={onBootDone} />
      <div className={styles.welcome}>
        {showNeofetch ? (
          <>
            <PromptEcho cwd="/" line="neofetch" />
            <Neofetch />
          </>
        ) : null}
        {showTagline ? (
          <p className={styles.tagline}>
            Type <span className="purple">'help'</span> to get started, or click a tab below — we
            won't judge
          </p>
        ) : null}
        {showNav ? <NavBar /> : null}
      </div>
    </header>
  );
}
