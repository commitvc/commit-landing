import { FileTree } from '@/components/file-tree/FileTree';
import { type FsDir, buildFileSystem } from '@/lib/filesystem';
import type { ReactNode } from 'react';

/**
 * Shared layout for /companies/ and /companies/<slug>/. Renders the file
 * tree once so navigating between companies only swaps the detail child
 * below — tree stays mounted, URL updates, nothing re-animates.
 */
export default function CompaniesLayout({ children }: { children: ReactNode }) {
  const fs = buildFileSystem([]);
  const companies = fs.contents.companies as FsDir;
  return (
    <>
      <FileTree root={companies} basePath="/companies" />
      {children}
    </>
  );
}
