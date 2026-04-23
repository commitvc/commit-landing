import type { Metadata } from 'next';
import { FileTree } from '@/components/file-tree/FileTree';
import { buildFileSystem, type FsDir } from '@/lib/filesystem';

export const metadata: Metadata = {
  title: 'About',
  description: 'About >commit — the early-stage fund backing commercial open-source startups.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  const fs = buildFileSystem([]);
  const about = fs.contents.about as FsDir;
  return <FileTree root={about} basePath="/about" />;
}
