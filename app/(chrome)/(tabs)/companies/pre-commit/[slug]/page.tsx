import { CompanyCard } from '@/components/cards/CompanyCard';
import { COMPANIES } from '@/lib/companies';
import { breadcrumbJsonLd } from '@/lib/structured-data';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

const PRE_COMMIT = COMPANIES.filter((c) => c.folder === 'pre-commit');

export function generateStaticParams() {
  return PRE_COMMIT.map((c) => ({ slug: c.slug }));
}

export const dynamicParams = false;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const company = PRE_COMMIT.find((c) => c.slug === slug);
  if (!company) return {};
  const title = `${company.company} — ${company.oneLiner}`;
  const description =
    company.about ?? `${company.company}: ${company.oneLiner}. Portfolio at >commit.`;
  const url = `https://commit.fund/companies/pre-commit/${slug}/`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      images: [`https://commit.fund${company.avatar}`],
    },
  };
}

export default async function PreCommitCompanyPage({ params }: Params) {
  const { slug } = await params;
  const company = PRE_COMMIT.find((c) => c.slug === slug);
  if (!company) notFound();

  const sameAs = [company.website, company.github, company.docs].filter(
    (v): v is string => !!v,
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.company,
    description: company.about ?? company.oneLiner,
    url: `https://commit.fund/companies/pre-commit/${slug}/`,
    logo: `https://commit.fund${company.avatar}`,
    ...(sameAs.length ? { sameAs } : {}),
    ...(company.founders?.length
      ? {
          founder: company.founders.map((f) => ({ '@type': 'Person', name: f.name })),
        }
      : {}),
  };

  // Four crumbs deep: makes the temporal relationship explicit so AI doesn't
  // mistake a /pre-commit/ company for a current >commit Fund I position.
  const breadcrumb = breadcrumbJsonLd([
    { name: '>commit', url: '/' },
    { name: 'Companies', url: '/companies/' },
    { name: 'Pre-commit', url: '/companies/' },
    { name: company.company, url: `/companies/pre-commit/${slug}/` },
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
      <CompanyCard company={company} />
    </main>
  );
}
