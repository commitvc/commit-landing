import type { Metadata } from 'next';

const TARGET = 'https://www.redriverwest.com/legal';

export const metadata: Metadata = {
  title: 'Legal',
  description: 'Legal information for commit.fund and Red River West SAS.',
  robots: { index: false, follow: false },
  alternates: { canonical: TARGET },
};

export default function LegalPage() {
  return (
    <main>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static redirect snippet, no user input
        dangerouslySetInnerHTML={{
          __html: `window.location.replace(${JSON.stringify(TARGET)});`,
        }}
      />
      <noscript>
        <meta httpEquiv="refresh" content={`0;url=${TARGET}`} />
      </noscript>
      <p>
        Redirecting to the Red River West legal notice. If you are not redirected,{' '}
        <a href={TARGET} className="blue">
          click here
        </a>
        .
      </p>
    </main>
  );
}
