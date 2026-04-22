import { ProfileCard } from '@/components/cards/ProfileCard';
import { ADVISORS_TEXT, TEAM } from '@/lib/team';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Team',
  description: 'The team behind >commit — partners and tech lead.',
  alternates: { canonical: '/team' },
};

export default function TeamPage() {
  return (
    <main>
      <h1 className="yellow">team</h1>
      <section aria-label="Team members">
        {TEAM.map((m) => (
          <ProfileCard key={m.slug} member={m} />
        ))}
      </section>
      <section aria-label="Advisors" style={{ marginTop: '2rem', maxWidth: 640 }}>
        <h2 className="yellow">advisors</h2>
        {ADVISORS_TEXT.split('\n\n').map((p, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: advisors text paragraphs are stable
          <p key={i} style={{ lineHeight: 1.6 }}>
            {p}
          </p>
        ))}
      </section>
    </main>
  );
}
