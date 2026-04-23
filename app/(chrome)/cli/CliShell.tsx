'use client';

import { CliTerminal } from '@/components/cli-terminal/CliTerminal';
import type { FsDir } from '@/lib/filesystem';
import { useChrome } from '../ChromeShell';

type Props = { fs: FsDir };

/**
 * /cli shell: just the CLI scroll zone. CompactHeader lives in the (chrome)
 * layout above so it persists across /cli ↔ tab navigation without
 * re-mounting. The terminal reports its scroll state via useChrome() so the
 * NavBar's dash line fades in.
 */
export function CliShell({ fs }: Props) {
  const { setScrolled } = useChrome();
  return <CliTerminal fs={fs} onScrolledChange={setScrolled} />;
}
