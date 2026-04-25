import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProfileCard } from '@/components/cards/ProfileCard';
import { breadcrumbJsonLd, ORG_ID, SITE_URL } from '@/lib/structured-data';
import { TEAM } from '@/lib/team';

export function generateStaticParams() {
  return TEAM.map((m) => ({ slug: m.slug }));
}

export const dynamicParams = false;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const member = TEAM.find((m) => m.slug === slug);
  if (!member) return {};
  const title = `${member.name} — ${member.role} at >commit`;
  // SERP/social-friendly short description (~120 chars). Falls back to the
  // long-form bio if `seoDescription` isn't set, but the long bio gets
  // mid-sentence-truncated by Google so every member should set it.
  const description =
    member.seoDescription ?? member.description ?? `${member.name}, ${member.role} at >commit.`;
  const url = `${SITE_URL}/team/${slug}/`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'profile',
      title,
      description,
      url,
      images: [`${SITE_URL}${member.avatar}`],
    },
  };
}

export default async function TeamMemberPage({ params }: Params) {
  const { slug } = await params;
  const member = TEAM.find((m) => m.slug === slug);
  if (!member) notFound();

  const sameAs = [member.github, member.linkedin, member.twitter, member.website].filter(
    (v): v is string => !!v,
  );

  const personUrl = `${SITE_URL}/team/${slug}/`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    // Stable @id so Article.author can reference this Person across the site.
    '@id': `${personUrl}#person`,
    name: member.name,
    jobTitle: member.role,
    // Reference the global Organization node by @id so the entity graph
    // dedupes (instead of emitting a separate, parallel Org node).
    worksFor: { '@id': ORG_ID },
    image: `${SITE_URL}${member.avatar}`,
    url: personUrl,
    ...(member.description ? { description: member.description } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };

  const breadcrumb = breadcrumbJsonLd([
    { name: '>commit', url: '/' },
    { name: 'Team', url: '/team/' },
    { name: member.name, url: `/team/${slug}/` },
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
      <ProfileCard member={member} />
    </main>
  );
}
