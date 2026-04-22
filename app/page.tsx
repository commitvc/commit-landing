import { getAllPosts } from '@/lib/blog';
import { buildFileSystem } from '@/lib/filesystem';
import { LandingShell } from './LandingShell';

export default function HomePage() {
  const posts = getAllPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    author: p.author,
    date: p.date,
    description: p.description,
  }));
  const fs = buildFileSystem(posts);
  return <LandingShell fs={fs} />;
}
