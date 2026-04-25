import { FileTree } from '@/components/file-tree/FileTree';
import { type FsDir, buildFileSystem } from '@/lib/filesystem';
import type { ReactNode } from 'react';

/**
 * Shared layout for /about/ and /about/<file>/. Renders the file tree once so
 * navigating between readme / projects / contact only swaps the detail child
 * below — tree stays mounted, URL updates, nothing re-animates. Mirrors the
 * pattern used by team/ and companies/.
 */
export default function AboutLayout({ children }: { children: ReactNode }) {
  const fs = buildFileSystem([]);
  const about = fs.contents.about as FsDir;
  return (
    <>
      <FileTree root={about} basePath="/about" />
      {children}
    </>
  );
}
