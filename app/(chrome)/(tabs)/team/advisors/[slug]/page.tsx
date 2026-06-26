import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProfileCard } from '@/components/cards/ProfileCard';
import { ADVISORS } from '@/lib/advisors';
import { breadcrumbJsonLd, ORG_ID, SITE_URL } from '@/lib/structured-data';

export function generateStaticParams() {
  return ADVISORS.map((advisor) => ({ slug: advisor.slug }));
}

export const dynamicParams = false;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const advisor = ADVISORS.find((item) => item.slug === slug);
  if (!advisor) return {};

  const title = `${advisor.name} — ${advisor.role} at >commit`;
  const description =
    advisor.seoDescription ?? advisor.description ?? `${advisor.name}, ${advisor.role} at >commit.`;
  const url = `${SITE_URL}/team/advisors/${slug}/`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'profile',
      title,
      description,
      url,
      images: [`${SITE_URL}${advisor.avatar}`],
    },
  };
}

export default async function AdvisorPage({ params }: Params) {
  const { slug } = await params;
  const advisor = ADVISORS.find((item) => item.slug === slug);
  if (!advisor) notFound();

  const sameAs = [advisor.github, advisor.linkedin, advisor.twitter, advisor.website].filter(
    (v): v is string => !!v,
  );
  const personUrl = `${SITE_URL}/team/advisors/${slug}/`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${personUrl}#person`,
    name: advisor.name,
    jobTitle: advisor.role,
    worksFor: { '@id': ORG_ID },
    image: `${SITE_URL}${advisor.avatar}`,
    url: personUrl,
    ...(advisor.description ? { description: advisor.description } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
  const breadcrumb = breadcrumbJsonLd([
    { name: '>commit', url: '/' },
    { name: 'Team', url: '/team/' },
    { name: 'Advisors', url: '/team/' },
    { name: advisor.name, url: `/team/advisors/${slug}/` },
  ]);

  return (
    <main>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be raw JSON.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be raw JSON.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <ProfileCard member={advisor} />
    </main>
  );
}
