import type { Metadata } from 'next';
import { FileTree } from '@/components/file-tree/FileTree';
import { getAllPosts } from '@/lib/blog';
import { buildFileSystem, type FsDir } from '@/lib/filesystem';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Essays from the >commit team on commercial open source, AI, and Europe.',
  alternates: { canonical: '/blog' },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const fs = buildFileSystem(posts);
  const blog = fs.contents.blog as FsDir;
  return <FileTree root={blog} basePath="/blog" blogPosts={posts} />;
}
