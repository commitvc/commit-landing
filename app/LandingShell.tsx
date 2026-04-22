'use client';

import { CliTerminal } from '@/components/cli-terminal/CliTerminal';
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
  const [ready, setReady] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const onReady = useCallback(() => setReady(true), []);
  const onScrolledChange = useCallback((s: boolean) => setScrolled(s), []);

  const style = {
    display: 'contents',
    ['--dash-opacity' as string]: scrolled ? 1 : 0,
  } as CSSProperties;

  return (
    <div style={style}>
      <WelcomeHeader onReady={onReady} />
      <CliTerminal fs={fs} disabled={!ready} onScrolledChange={onScrolledChange} />
    </div>
  );
}
