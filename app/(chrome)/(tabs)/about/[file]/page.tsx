import { Linkify } from '@/components/linkify/Linkify';
import { ABOUT_CONTACT, ABOUT_PROJECTS, ABOUT_README } from '@/lib/about';
import { SITE_URL, breadcrumbJsonLd } from '@/lib/structured-data';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import styles from './page.module.css';

type FileSlug = 'readme' | 'projects' | 'contact';

const FILES: Record<FileSlug, { content: string; title: string; description: string }> = {
  readme: {
    content: ABOUT_README,
    title: 'readme.txt',
    description:
      '>commit is the early-stage fund of the Red River West family, backing commercial open-source startups at pre-seed and seed.',
  },
  projects: {
    content: ABOUT_PROJECTS,
    title: 'projects.txt',
    description:
      '>commit projects: OSSCAR — the open-source GitHub growth ranking — and the Open Source track at the RAISE Summit.',
  },
  contact: {
    content: ABOUT_CONTACT,
    title: 'contact.txt',
    description: 'How to reach >commit — email, GitHub, LinkedIn, and X.',
  },
};

export function generateStaticParams() {
  return (Object.keys(FILES) as FileSlug[]).map((file) => ({ file }));
}

export const dynamicParams = false;

type Params = { params: Promise<{ file: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { file } = await params;
  const entry = FILES[file as FileSlug];
  if (!entry) return {};
  const url = `https://commit.fund/about/${file}/`;
  return {
    title: `/about/${entry.title}`,
    description: entry.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: `/about/${entry.title}`,
      description: entry.description,
      url,
    },
  };
}

export default async function AboutFilePage({ params }: Params) {
  const { file } = await params;
  const entry = FILES[file as FileSlug];
  if (!entry) notFound();

  const breadcrumb = breadcrumbJsonLd([
    { name: '>commit', url: '/' },
    { name: 'About', url: '/about/' },
    { name: entry.title, url: `/about/${file}/` },
  ]);

  return (
    <main>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be raw JSON.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <div className={styles.viewer}>
        <div className={styles.header}>── /about/{entry.title} ──</div>
        <div className={styles.body}>
          <Linkify text={entry.content} />
        </div>
      </div>
    </main>
  );
}
