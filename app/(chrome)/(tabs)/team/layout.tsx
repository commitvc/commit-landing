import type { ReactNode } from 'react';
import { FileTree } from '@/components/file-tree/FileTree';
import { buildFileSystem, type FsDir } from '@/lib/filesystem';

/**
 * Shared layout for /team/ and /team/<slug>/. Renders the file tree once so
 * navigating between members only swaps the detail child below — tree stays
 * mounted, URL updates, nothing re-animates.
 */
export default function TeamLayout({ children }: { children: ReactNode }) {
  const fs = buildFileSystem([]);
  const team = fs.contents.team as FsDir;
  return (
    <>
      <FileTree root={team} basePath="/team" />
      {children}
    </>
  );
}
