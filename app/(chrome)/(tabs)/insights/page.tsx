import type { Metadata } from 'next';
import { breadcrumbJsonLd } from '@/lib/structured-data';
import styles from './insights.module.css';

export const metadata: Metadata = {
  title: 'Insights',
  description: 'Open-source ecosystem data and insights from >commit.',
  alternates: { canonical: '/insights' },
  // Deliberately kept out of the index (and out of app/sitemap.ts) while the
  // page is a placeholder — an empty page shouldn't be advertised to crawlers.
  // Drop this and add '/insights' to STATIC_PATHS once the embed ships.
  robots: { index: false, follow: true },
};

const insightsBreadcrumb = breadcrumbJsonLd([
  { name: '>commit', url: '/' },
  { name: 'Insights', url: '/insights/' },
]);

/** Placeholder shell. The `.frame` wrapper is the intended mount point for the
 *  dashboard iframe — it already fills the scrollable content zone, so dropping
 *  an <iframe> in with width/height 100% and no border needs no layout work. */
export default function InsightsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be raw JSON.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(insightsBreadcrumb) }}
      />
      <section className="sr-only" aria-label=">commit insights">
        <h1>Insights</h1>
        <p>Open-source ecosystem data from &gt;commit. This section is not yet published.</p>
      </section>
      <div className={styles.frame}>
        <p className={styles.pending}>Coming soon.</p>
      </div>
    </>
  );
}
