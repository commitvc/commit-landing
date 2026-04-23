import { FileTree } from '@/components/file-tree/FileTree';
import { type FsDir, buildFileSystem } from '@/lib/filesystem';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Team',
  description: 'The team behind >commit — partners and tech lead.',
  alternates: { canonical: '/team' },
};

export default function TeamPage() {
  const fs = buildFileSystem([]);
  const team = fs.contents.team as FsDir;
  return <FileTree root={team} basePath="/team" />;
}
