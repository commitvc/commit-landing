import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { CliStateProvider } from '@/components/cli-terminal/CliStateContext';
import { PostHogProvider } from '@/components/posthog-provider';
import { RedRiverButton } from '@/components/red-river-button/RedRiverButton';
import { organizationJsonLd, SITE_URL, websiteJsonLd } from '@/lib/structured-data';
import { THEME_STORAGE_KEY } from '@/lib/theme';
import { meslo } from './fonts';
import '../styles/globals.css';

// Replays a stored `theme` choice onto <html> before first paint, so a reload
// doesn't flash the previous theme. Must stay a plain synchronous inline
// script — next/script defers, which is exactly the flash we're avoiding.
// Absence of a stored value is meaningful: it leaves `data-theme` unset so the
// prefers-color-scheme path in globals.css decides.
const THEME_BOOTSTRAP = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t}}catch(e){}})();`;

// Shared OG/Twitter image. Canonical 1200×630 PNG so every unfurling
// platform (Twitter `summary_large_image`, Facebook, LinkedIn, iMessage,
// Discord, Slack) renders without center-crop. `alt` is read by AI summary
// tools and accessibility tooling; the explicit `width`/`height` lets
// crawlers skip a HEAD request to read dimensions.
const SHARE_CARD = {
  url: '/card.png',
  width: 1200,
  height: 630,
  alt: '>commit — Venture Capital for Commercial Open Source Startups',
} as const;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '>commit — Venture Capital for Commercial Open Source Startups',
    template: '%s | >commit',
  },
  description: 'Venture Capital fund backing commercial open-source startups at pre-seed and seed.',
  keywords: [
    '>commit',
    'commit fund',
    'commit VC',
    'venture capital',
    'commercial open source',
    'open source',
    'pre-seed',
    'seed',
    'developer tools',
    'AI infrastructure',
    'Red River West',
  ],
  authors: [{ name: '>commit', url: SITE_URL }],
  icons: { icon: '/favicon.jpeg' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: '>commit',
    locale: 'en_US',
    images: [SHARE_CARD],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@commitvc',
    creator: '@commitvc',
    images: [SHARE_CARD],
  },
  alternates: { canonical: '/' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: THEME_BOOTSTRAP sets `data-theme` on this
    // element before React hydrates, so the attribute legitimately differs from
    // the SSR'd markup and React would otherwise log a hydration mismatch on
    // every load. Scoped one level deep, so it only covers <html>'s own attrs.
    <html lang="en" className={meslo.variable} suppressHydrationWarning>
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: must run synchronously before first paint to avoid a theme flash.
          dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }}
        />
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be raw JSON.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be raw JSON.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
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
