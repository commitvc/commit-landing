import type { Metadata } from 'next';
import { breadcrumbJsonLd } from '@/lib/structured-data';
import styles from './insights.module.css';

/** Where the Insights platform itself lives — the only thing on this page that
 *  points outside the marketing site. */
const INSIGHTS_LOGIN_URL = 'https://insights.commit.fund';

export const metadata: Metadata = {
  title: 'Insights',
  description:
    'Insights is the operating system of >commit — repository data, community signals, and direct access to the team for portfolio founders, and a real-time portfolio view for limited partners.',
  alternates: { canonical: '/insights' },
};

const insightsBreadcrumb = breadcrumbJsonLd([
  { name: '>commit', url: '/' },
  { name: 'Insights', url: '/insights/' },
]);

/** Marketing + login entry point for Insights. The platform itself lives
 *  behind the CTA; this page only explains what it is and who it is for. */
export default function InsightsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be raw JSON.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(insightsBreadcrumb) }}
      />
      <div className={styles.page}>
        {/* The nav tab already labels the page, so the h1 is hidden rather than
            dropped — the document still needs one for crawlers and screen readers. */}
        <h1 className="sr-only">Insights</h1>
        <p className={styles.tagline}>Insights is the operating system of &gt;commit.</p>
        <p className={styles.lede}>
          One platform reserved for portfolio founders and limited partners, where the data,
          tooling, community and more come together.
        </p>

        <div className={styles.section}>
          <h2 className={styles.sectionHeading}># for portfolio founders</h2>
          <p>
            Quantitative and qualitative insights on your repositories and the communities around
            them — plus direct access to the &gt;commit team for marketing, sales, hiring,
            mentoring, and everything in between.
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionHeading}># for limited partners</h2>
          <p>A real-time view of the portfolio: every company, every milestone, as it happens.</p>
        </div>

        <div className={styles.ctaRow}>
          <a
            className={styles.cta}
            href={INSIGHTS_LOGIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Log in to Insights"
          >
            Log in
            <span className={styles.arrow} aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </div>
    </>
  );
}
