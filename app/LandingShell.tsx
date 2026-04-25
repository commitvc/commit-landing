'use client';

import { useCallback, useState } from 'react';
import { ChromeProvider, useChrome } from '@/app/(chrome)/ChromeShell';
import { useCliState } from '@/components/cli-terminal/CliStateContext';
import { CliTerminal } from '@/components/cli-terminal/CliTerminal';
import { CompactHeader } from '@/components/compact-header/CompactHeader';
import { WelcomeHeader } from '@/components/welcome-header/WelcomeHeader';
import type { FsDir } from '@/lib/filesystem';

type Props = { fs: FsDir };

/**
 * Landing (`/`) shell: welcome animation header + the CLI scroll zone.
 * Wraps children in the same `ChromeProvider` as the (chrome) layout so
 * NavBar reads scroll state from a single context regardless of whether
 * the page is the landing or a tab page.
 */
export function LandingShell({ fs }: Props) {
  return (
    <ChromeProvider>
      <LandingBody fs={fs} />
    </ChromeProvider>
  );
}

function LandingBody({ fs }: Props) {
  const { headerSwapped, landingNonce } = useCliState();
  const { setScrolled } = useChrome();
  const [ready, setReady] = useState(false);
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

  // Default on `/` is the animated welcome header; the `header` command
  // swaps to the compact one. When switching back to welcome after the
  // initial boot already ran, skip the loader and fade in instead.
  const showCompact = headerSwapped;
  // CLI only appears *after* the welcome animation is done. That keeps
  // pre-existing output (when returning to `/` via the logo) from being
  // visible during the replay. On the compact header the CLI is always on.
  const showCli = showCompact || ready;

  return (
    <>
      {showCompact ? (
        <CompactHeader />
      ) : (
        <WelcomeHeader key={landingNonce} onReady={onReady} skipBoot={ready} />
      )}
      {showCli ? <CliTerminal fs={fs} onScrolledChange={setScrolled} /> : null}
    </>
  );
}
