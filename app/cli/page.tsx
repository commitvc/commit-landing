import type { Metadata } from 'next';
import { Terminal } from '@/components/terminal/Terminal';
import { getAllPosts } from '@/lib/blog';
import { buildFileSystem } from '@/lib/filesystem';

export const metadata: Metadata = {
  title: 'CLI',
  description: 'The >commit terminal — browse the site as a shell.',
  alternates: { canonical: '/' },
};

export default function CliPage() {
  const posts = getAllPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    author: p.author,
    date: p.date,
    description: p.description,
  }));
  const fs = buildFileSystem(posts);
  return <Terminal fs={fs} />;
}
