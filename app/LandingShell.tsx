'use client';

import { useCliState } from '@/components/cli-terminal/CliStateContext';
import { CliTerminal } from '@/components/cli-terminal/CliTerminal';
import { CompactHeader } from '@/components/compact-header/CompactHeader';
import { WelcomeHeader } from '@/components/welcome-header/WelcomeHeader';
import type { FsDir } from '@/lib/filesystem';
import type { CSSProperties } from 'react';
import { useCallback, useState } from 'react';

type Props = { fs: FsDir };

/**
 * Landing (`/`) shell: welcome animation header + the CLI scroll zone.
 * Uses `display: contents` on the wrapper so the `--dash-opacity` CSS var
 * reaches both the NavBar (inside WelcomeHeader) and any other consumer,
 * without introducing an extra layout box.
 */
export function LandingShell({ fs }: Props) {
  const { headerSwapped, landingNonce } = useCliState();
  const [ready, setReady] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Reset `ready` when the user clicks the logo from an already-mounted
  // landing (same-route click doesn't remount this shell, so the boot would
  // otherwise stay skipped). Set-state-during-render keeps the commit in a
  // single pass — WelcomeHeader never renders with a stale skipBoot=true.
  const [lastNonce, setLastNonce] = useState(landingNonce);
  if (lastNonce !== landingNonce) {
    setLastNonce(landingNonce);
    setReady(false);
  }

  const onReady = useCallback(() => setReady(true), []);
  const onScrolledChange = useCallback((s: boolean) => setScrolled(s), []);

  const style = {
    display: 'contents',
    ['--dash-opacity' as string]: scrolled ? 1 : 0,
  } as CSSProperties;

  // Default on `/` is the animated welcome header; the `header` command
  // swaps to the compact one. When switching back to welcome after the
  // initial boot already ran, skip the loader and fade in instead.
  const showCompact = headerSwapped;
  // CLI only appears *after* the welcome animation is done. That keeps
  // pre-existing output (when returning to `/` via the logo) from being
  // visible during the replay. On the compact header the CLI is always on.
  const showCli = showCompact || ready;

  return (
    <div style={style}>
      {showCompact ? (
        <CompactHeader />
      ) : (
        <WelcomeHeader key={landingNonce} onReady={onReady} skipBoot={ready} />
      )}
      {showCli ? <CliTerminal fs={fs} onScrolledChange={onScrolledChange} /> : null}
    </div>
  );
}
