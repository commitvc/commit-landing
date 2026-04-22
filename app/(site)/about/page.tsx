import type { Metadata } from 'next';
import Link from 'next/link';
import { ABOUT_CONTACT, ABOUT_PROJECTS, ABOUT_README } from '@/lib/about';

export const metadata: Metadata = {
  title: 'About',
  description: 'About >commit — the early-stage fund backing commercial open-source startups.',
  alternates: { canonical: '/about' },
};

function LinkifyEmail({ text }: { text: string }) {
  const parts = text.split(/(hey@commit\.fund)/g);
  return (
    <>
      {parts.map((p, i) =>
        p === 'hey@commit.fund' ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: static split of a constant string
          <a key={i} href="mailto:hey@commit.fund" className="blue">
            {p}
          </a>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: static split of a constant string
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split('\n\n').map((p, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: paragraphs in a constant string are stable
        <p key={i} style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          <LinkifyEmail text={p} />
        </p>
      ))}
    </>
  );
}

export default function AboutPage() {
  return (
    <main style={{ maxWidth: 720 }}>
      <h1 className="yellow">about</h1>

      <section aria-label="Readme">
        <h2 className="yellow">readme</h2>
        <Paragraphs text={ABOUT_README} />
      </section>

      <section aria-label="Projects" style={{ marginTop: '2rem' }}>
        <h2 className="yellow">projects</h2>
        <Paragraphs text={ABOUT_PROJECTS} />
      </section>

      <section aria-label="Contact" style={{ marginTop: '2rem' }}>
        <h2 className="yellow">contact</h2>
        <pre style={{ lineHeight: 1.6, margin: 0 }}>{ABOUT_CONTACT}</pre>
      </section>

      <section aria-label="Legal" style={{ marginTop: '2rem' }}>
        <h2 className="yellow">legal</h2>
        <p>
          <Link href="/about/legal" className="blue">
            Full legal notice →
          </Link>
        </p>
      </section>
    </main>
  );
}
