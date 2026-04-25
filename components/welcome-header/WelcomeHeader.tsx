'use client';

import { AsciiLogo } from '@/components/ascii-logo/AsciiLogo';
import { PromptEcho } from '@/components/cli-terminal/PromptEcho';
import { NavBar } from '@/components/nav-bar/NavBar';
import { useCallback, useEffect, useState } from 'react';
import { BootAnimation } from './BootAnimation';
import { Neofetch, NeofetchData } from './Neofetch';
import styles from './WelcomeHeader.module.css';

type Phase = 'boot' | 'welcome-neofetch' | 'welcome-tagline' | 'welcome-nav' | 'ready';

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * SSR-safe phone detection. Defaults to `false` on the server so the SSG'd
 * HTML matches the desktop layout; flips to `true` during the first client
 * effect on phones, swapping to the mobile branch. The brief flash before
 * the swap is visually empty (the boot typewriter hasn't typed yet), so the
 * transition reads as instant.
 */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 480px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
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
 * The full landing-page header. On desktop: boot log → `>neofetch` echo →
 * Neofetch card → tagline → NavBar, each section revealing in sequence.
 *
 * On phones (≤480px): boot animation + `>neofetch` echo are skipped, and
 * everything renders immediately at first paint — the ASCII logo, the
 * fund-highlight block (Activity / Focus / Stage / links), the tagline, and
 * the NavBar. The vertical-chrome budget is too tight on phones for the
 * staged reveal to feel right.
 */
export function WelcomeHeader({ onReady, skipBoot = false }: Props) {
  const isMobile = useIsMobile();
  if (isMobile) return <MobileWelcomeHeader onReady={onReady} />;
  return <DesktopWelcomeHeader onReady={onReady} skipBoot={skipBoot} />;
}

function MobileWelcomeHeader({ onReady }: { onReady?: () => void }) {
  // Fire onReady on mount so the CLI below can enable its prompt
  // immediately — there's no animation to wait for on the mobile branch.
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <header className={styles.header}>
      <div className={`${styles.welcome} ${styles.mobile}`}>
        <div className={styles.mobileLogo}>
          <AsciiLogo href="" />
        </div>
        <NeofetchData />
        <p className={styles.tagline}>
          Type <span className="purple">'help'</span> to get started, or click a tab below — we
          won't judge
        </p>
        <NavBar />
      </div>
    </header>
  );
}

function DesktopWelcomeHeader({ onReady, skipBoot = false }: Props) {
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
