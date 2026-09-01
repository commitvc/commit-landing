import { SITE_URL } from '@/lib/structured-data';
import type { Metadata } from 'next';

// `agent-mux` was the original slug for this stealth entry, renamed to
// `agentmux`. The company now lives at /companies/agentmux/; this stub keeps
// the old teased URL working. A static export can't emit a real 3xx, so we
// redirect client-side (and via <meta refresh> for no-JS) and hand crawlers a
// canonical pointing at /agentmux/.
const TARGET_PATH = '/companies/agentmux/';
const TARGET = `${SITE_URL}${TARGET_PATH}`;

export const metadata: Metadata = {
  title: 'Stealth',
  description: 'This page has moved to /companies/agentmux/.',
  robots: { index: false, follow: true },
  alternates: { canonical: TARGET },
};

export default function AgentMuxRedirectPage() {
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
        This page has moved to{' '}
        <a href={TARGET_PATH} className="blue">
          /companies/agentmux/
        </a>
        .
      </p>
    </main>
  );
}
