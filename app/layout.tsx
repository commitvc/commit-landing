import { CliStateProvider } from '@/components/cli-terminal/CliStateContext';
import { PostHogProvider } from '@/components/posthog-provider';
import { RedRiverButton } from '@/components/red-river-button/RedRiverButton';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { meslo } from './fonts';
import '../styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://commit.fund'),
  title: {
    default: 'commit — Venture Capital for Commercial Open Source',
    template: '%s | commit',
  },
  description: 'Venture Capital fund backing commercial open-source startups at pre-seed and seed.',
  icons: { icon: '/favicon.jpeg' },
  openGraph: {
    type: 'website',
    url: 'https://commit.fund',
    siteName: 'commit',
    images: ['/card.png'],
  },
  alternates: { canonical: '/' },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'commit',
  url: 'https://commit.fund',
  logo: 'https://commit.fund/favicon.jpeg',
  description: 'Venture Capital fund backing commercial open-source startups',
  sameAs: [
    'https://linkedin.com/company/red-river-west',
    'https://redriverwest.com',
    'https://www.crunchbase.com/organization/red-river-west',
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={meslo.variable}>
      <head>
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be raw JSON.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body>
        <PostHogProvider>
          <CliStateProvider>
            <RedRiverButton />
            <div className="container">{children}</div>
          </CliStateProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
