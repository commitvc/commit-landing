import { breadcrumbJsonLd, teamItemList } from '@/lib/structured-data';
import { TEAM } from '@/lib/team';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Team',
  description: 'The team behind >commit — partners and tech lead.',
  alternates: { canonical: '/team' },
};

/** The file tree is rendered by [app/(chrome)/(tabs)/team/layout.tsx] so it
 *  stays mounted as the user navigates between team member detail pages.
 *  This page only injects the listing-specific JSON-LD + a hidden semantic
 *  block for AI crawlers; both stop firing on detail routes. */
export default function TeamPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: '>commit', url: '/' },
    { name: 'Team', url: '/team/' },
  ]);
  const list = teamItemList();

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be raw JSON.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be raw JSON.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(list) }}
      />
      <section className="sr-only" aria-label="The >commit team">
        <h1>The &gt;commit team</h1>
        <p>
          {TEAM.length} people: three partners and a tech lead who together founded &gt;commit
          inside the Red River West family.
        </p>
        <ul>
          {TEAM.map((m) => (
            <li key={m.slug}>
              <a href={`/team/${m.slug}/`}>
                <strong>{m.name}</strong>
              </a>{' '}
              — {m.role}
              {m.focus ? ` (focus: ${m.focus})` : ''}. {m.description}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
