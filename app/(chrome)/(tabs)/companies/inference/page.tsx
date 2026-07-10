import { SITE_URL } from '@/lib/structured-data';
import type { Metadata } from 'next';

// `inference` was the stealth slug for ZML (disclosed 2026-07-08). The company
// now lives at /companies/zml/; this stub keeps the old teased URL working.
// A static export can't emit a real 3xx, so we redirect client-side (and via
// <meta refresh> for no-JS) and hand crawlers a canonical pointing at /zml/.
const TARGET_PATH = '/companies/zml/';
const TARGET = `${SITE_URL}${TARGET_PATH}`;

export const metadata: Metadata = {
  title: 'ZML',
  description: 'ZML — this page has moved to /companies/zml/.',
  robots: { index: false, follow: true },
  alternates: { canonical: TARGET },
};

export default function InferenceRedirectPage() {
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
        ZML has moved to{' '}
        <a href={TARGET_PATH} className="blue">
          /companies/zml/
        </a>
        .
      </p>
    </main>
  );
}
