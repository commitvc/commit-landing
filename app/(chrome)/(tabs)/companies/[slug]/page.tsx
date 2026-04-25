import { CompanyCard } from '@/components/cards/CompanyCard';
import { COMPANIES } from '@/lib/companies';
import { SITE_URL, breadcrumbJsonLd } from '@/lib/structured-data';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

/** Flat /companies/<slug>/ is reserved for the active portfolio. Pre-commit
 *  companies live at /companies/pre-commit/<slug>/ — see the sibling route. */
const ACTIVE = COMPANIES.filter((c) => c.folder === 'active');

export function generateStaticParams() {
  return ACTIVE.map((c) => ({ slug: c.slug }));
}

export const dynamicParams = false;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const company = ACTIVE.find((c) => c.slug === slug);
  if (!company) return {};
  const title = `${company.company} — ${company.oneLiner}`;
  // Stealth: short auto-generated teaser (already SERP-friendly). Otherwise
  // prefer the company's `seoDescription` (~120-140 chars), then fall back
  // to the long `about` (gets truncated by Google but still shippable).
  const description = company.stealth
    ? `Stealth Fund I investment — ${company.oneLiner}. Disclosure pending.`
    : (company.seoDescription ??
      company.about ??
      `${company.company}: ${company.oneLiner}. Portfolio at >commit.`);
  const url = `${SITE_URL}/companies/${slug}/`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      // Skip the OG image for stealth — there's no real avatar to share.
      ...(company.avatar ? { images: [`${SITE_URL}${company.avatar}`] } : {}),
    },
  };
}

export default async function CompanyDetailPage({ params }: Params) {
  const { slug } = await params;
  const company = ACTIVE.find((c) => c.slug === slug);
  if (!company) notFound();

  const sameAs = [company.website, company.github, company.docs].filter(
    (v): v is string => !!v,
  );

  // Skip Organization JSON-LD for stealth — we don't index ████ as a real
  // entity in AI knowledge graphs. BreadcrumbList still renders so the page
  // has navigation context.
  const orgJsonLd = company.stealth
    ? null
    : {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: company.company,
        description: company.about ?? company.oneLiner,
        url: `${SITE_URL}/companies/${slug}/`,
        logo: `${SITE_URL}${company.avatar}`,
        ...(sameAs.length ? { sameAs } : {}),
        ...(company.founders?.length
          ? {
              founder: company.founders.map((f) => ({ '@type': 'Person', name: f.name })),
            }
          : {}),
      };

  const breadcrumb = breadcrumbJsonLd([
    { name: '>commit', url: '/' },
    { name: 'Companies', url: '/companies/' },
    { name: company.company, url: `/companies/${slug}/` },
  ]);

  return (
    <main>
      {orgJsonLd ? (
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be raw JSON.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      ) : null}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be raw JSON.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <CompanyCard company={company} />
    </main>
  );
}
