'use client';

import type { CSSProperties } from 'react';
import { useCallback, useState } from 'react';
import { CliTerminal } from '@/components/cli-terminal/CliTerminal';
import { CompactHeader } from '@/components/compact-header/CompactHeader';
import type { FsDir } from '@/lib/filesystem';

type Props = { fs: FsDir };

/**
 * /cli shell: compact chrome (logo + nav) + the CLI scroll zone. No welcome
 * animation — the prompt is usable immediately.
 */
export function CliShell({ fs }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const onScrolledChange = useCallback((s: boolean) => setScrolled(s), []);

  const style = {
    display: 'contents',
    ['--dash-opacity' as string]: scrolled ? 1 : 0,
  } as CSSProperties;

  return (
    <div style={style}>
      <CompactHeader />
      <CliTerminal fs={fs} onScrolledChange={onScrolledChange} />
    </div>
  );
}
