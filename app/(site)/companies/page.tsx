import type { Metadata } from 'next';
import { FileTree } from '@/components/file-tree/FileTree';
import { buildFileSystem, type FsDir } from '@/lib/filesystem';

export const metadata: Metadata = {
  title: 'Companies',
  description:
    'The companies >commit is investing in, and the commercial open-source companies that the team backed before.',
  alternates: { canonical: '/companies' },
};

export default function CompaniesPage() {
  const fs = buildFileSystem([]);
  const portfolio = fs.contents.portfolio as FsDir;
  return <FileTree root={portfolio} basePath="/portfolio" />;
}
