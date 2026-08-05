import type { Metadata } from 'next';
import { breadcrumbJsonLd } from '@/lib/structured-data';
import styles from './insights.module.css';

/** Where the Insights platform itself lives — the only thing on this page that
 *  points outside the marketing site. */
const INSIGHTS_LOGIN_URL = 'https://insights.commit.fund';

export const metadata: Metadata = {
  title: 'Insights',
  description:
    "Insights is >commit's operating system for portfolio founders — repository metrics, qualitative insight, competitive analysis, a community hub, warm intro requests into the advisors & CTO network, and direct access to the team for hiring and marketing support.",
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
        <p className={styles.tagline}>
          Insights is &gt;commit&rsquo;s operating system for portfolio founders.
        </p>
        <p className={styles.lede}>
          One platform where data, tooling, and community around your project come together.
        </p>

        <div className={styles.section}>
          <h2 className={styles.sectionHeading}># data &amp; signal</h2>
          <p>
            Repository metrics and qualitative insight on your project and the communities around
            it, plus competitive analysis on your market — everything you need to know where you
            stand.
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionHeading}># team &amp; network</h2>
          <p>
            A community hub to reach other &gt;commit founders, warm intro requests into the
            advisors &amp; CTO network, and direct access to the team for hiring and marketing
            support.
          </p>
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
