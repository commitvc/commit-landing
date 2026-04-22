import type { Metadata } from 'next';
import { PortfolioCard } from '@/components/cards/PortfolioCard';
import { ACTIVE_COMPANIES, PRE_COMMIT_COMPANIES } from '@/lib/portfolio';

export const metadata: Metadata = {
  title: 'Companies',
  description:
    'The companies >commit is investing in, and the commercial open-source companies that the team backed before.',
  alternates: { canonical: '/companies' },
};

export default function CompaniesPage() {
  return (
    <main>
      <h1 className="yellow">companies</h1>

      <section aria-label="Active portfolio" style={{ marginTop: '1rem' }}>
        <h2 className="yellow">portfolio</h2>
        {ACTIVE_COMPANIES.map((c) => (
          <PortfolioCard key={c.slug} company={c} />
        ))}
      </section>

      <section aria-label="Pre-commit companies" style={{ marginTop: '2rem' }}>
        <h2 className="yellow">pre-commit</h2>
        <p style={{ maxWidth: 640, lineHeight: 1.6 }}>
          Commercial open-source companies the team backed before &gt;commit.
        </p>
        {PRE_COMMIT_COMPANIES.map((c) => (
          <PortfolioCard key={c.slug} company={c} />
        ))}
      </section>
    </main>
  );
}
