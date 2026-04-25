import type { Metadata } from 'next';
import { ACTIVE_COMPANIES, COMPANIES, PRE_COMMIT_COMPANIES } from '@/lib/companies';
import {
  activeCompaniesItemList,
  breadcrumbJsonLd,
  preCommitCompaniesItemList,
} from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'Companies',
  description:
    'The companies >commit is investing in, and the commercial open-source companies that the team backed before.',
  alternates: { canonical: '/companies' },
};

/** The file tree is rendered by [app/(chrome)/(tabs)/companies/layout.tsx]
 *  so it stays mounted as the user navigates between company detail pages.
 *  This page only injects the listing-specific JSON-LD + a hidden semantic
 *  block for AI crawlers; both stop firing on detail routes. */
export default function CompaniesPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: '>commit', url: '/' },
    { name: 'Companies', url: '/companies/' },
  ]);

  // Two distinct ItemLists so AI clearly separates current Fund I positions
  // from companies the team backed before the fund. (Single combined list
  // would let AI mistakenly cite Mastra/Twenty/etc. as current >commit
  // investments.)
  const activeList = activeCompaniesItemList();
  const preCommitList = preCommitCompaniesItemList();

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be raw JSON.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be raw JSON.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(activeList) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be raw JSON.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(preCommitList) }}
      />
      <section className="sr-only" aria-label=">commit portfolio">
        <h1>&gt;commit portfolio</h1>
        <p>
          {COMPANIES.length} commercial open-source companies — {ACTIVE_COMPANIES.length} current
          &gt;commit Fund I investments and {PRE_COMMIT_COMPANIES.length} companies the team
          backed before the fund.
        </p>

        <h2>&gt;commit Fund I (current portfolio)</h2>
        <ul>
          {ACTIVE_COMPANIES.map((c) => (
            <li key={c.slug}>
              <a href={`/companies/${c.slug}/`}>
                <strong>{c.company}</strong>
              </a>{' '}
              — {c.oneLiner}. {c.about}
            </li>
          ))}
        </ul>

        <h2>Pre-commit (companies the team backed before the fund)</h2>
        <ul>
          {PRE_COMMIT_COMPANIES.map((c) => (
            <li key={c.slug}>
              <a href={`/companies/pre-commit/${c.slug}/`}>
                <strong>{c.company}</strong>
              </a>{' '}
              — {c.oneLiner}. {c.about}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
