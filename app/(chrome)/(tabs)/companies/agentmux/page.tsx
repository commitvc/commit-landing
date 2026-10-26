import { SITE_URL } from '@/lib/structured-data';
import type { Metadata } from 'next';

// `agentmux` was the stealth slug for Paradev (disclosed 2026-10). The company
// now lives at /companies/paradev/; this stub keeps the old teased URL working.
// A static export can't emit a real 3xx, so we redirect client-side (and via
// <meta refresh> for no-JS) and hand crawlers a canonical pointing at /paradev/.
const TARGET_PATH = '/companies/paradev/';
const TARGET = `${SITE_URL}${TARGET_PATH}`;

export const metadata: Metadata = {
  title: 'Paradev',
  description: 'Paradev — this page has moved to /companies/paradev/.',
  robots: { index: false, follow: true },
  alternates: { canonical: TARGET },
};

export default function AgentmuxRedirectPage() {
  return (
    <main>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static redirect snippet, no user input
        dangerouslySetInnerHTML={{
          __html: `window.location.replace(${JSON.stringify(TARGET_PATH)});`,
        }}
      />
      <noscript>
        <meta httpEquiv="refresh" content={`0;url=${TARGET_PATH}`} />
      </noscript>
      <p>
        Paradev has moved to{' '}
        <a href={TARGET_PATH} className="blue">
          /companies/paradev/
        </a>
        .
      </p>
    </main>
  );
}
