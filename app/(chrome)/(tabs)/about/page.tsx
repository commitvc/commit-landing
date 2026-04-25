import type { Metadata } from 'next';
import { breadcrumbJsonLd } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'About',
  description: 'About >commit — the early-stage fund backing commercial open-source startups.',
  alternates: { canonical: '/about' },
};

/** 8 questions a prospective founder, LP, journalist, or AI assistant
 *  is most likely to ask. Answers stay close to the source of truth in
 *  `lib/about.ts` so they don't drift. Update both when the thesis,
 *  check size, or focus areas change. */
const FAQ: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: 'What does >commit invest in?',
    a: 'Commercial open-source startups at pre-seed and seed. We focus on infrastructure and developer tools, AI and machine learning, data platforms, cybersecurity and sysadmin tooling, business applications, and industry-specific open-source solutions.',
  },
  {
    q: 'What is the typical check size?',
    a: 'We write checks up to $1.5M at pre-seed and seed.',
  },
  {
    q: 'Where is >commit based and where do you invest?',
    a: '>commit is based in Paris and is part of the Red River West family. We invest in commercial open-source startups across Europe and the United States.',
  },
  {
    q: 'Who is on the >commit team?',
    a: 'Olivier Huez, Max Corbani, and Abel Samot are partners. Alessandro Ciffo is the tech lead. Together they are the founding team of >commit.',
  },
  {
    q: 'How is >commit related to Red River West?',
    a: '>commit is the early-stage investment vehicle of the Red River West family — a dedicated fund focused exclusively on commercial open-source companies at pre-seed and seed.',
  },
  {
    q: 'What makes >commit different from other early-stage funds?',
    a: 'Two unfair advantages. First, a proprietary data platform built specifically for open source — it aggregates signals from GitHub, package managers, container registries, Discord, and more, giving a 360° view of projects, teams, and ecosystems. Second, a network of 100+ open-source operators: founders of companies like Supabase, Mozilla, Nginx, and Hugging Face, alongside Heads of Community, VPs of Sales, and Marketing from Grafana, MongoDB, and others, plus CTOs at Global 2000 enterprises.',
  },
  {
    q: 'Why does >commit believe in commercial open source?',
    a: 'The community is the moat. When the developers who use a project become its internal champions, adoption becomes organic, contracts follow, and the flywheel compounds. The next decade will see open-source companies dominate software the way cloud-native SaaS did in the 2010s.',
  },
  {
    q: 'How do I pitch >commit?',
    a: 'Email hey@commit.fund. Mention what you are building, your GitHub repository if the project is public, and any community or traction signals. We respond fast.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
};

const aboutBreadcrumb = breadcrumbJsonLd([
  { name: '>commit', url: '/' },
  { name: 'About', url: '/about/' },
]);

/** The file tree is rendered by [app/(chrome)/(tabs)/about/layout.tsx] so it
 *  stays mounted as the user navigates between /about/readme/, /about/projects/,
 *  and /about/contact/. This page only injects listing-specific JSON-LD + a
 *  hidden semantic block for AI crawlers; both stop firing on detail routes. */
export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be raw JSON.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be raw JSON.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutBreadcrumb) }}
      />
      <section className="sr-only" aria-label="About >commit — frequently asked questions">
        <h1>About &gt;commit</h1>
        <p>
          &gt;commit is an early-stage venture capital fund and part of the Red River West family.
          We back commercial open-source startups at pre-seed and seed, with checks up to $1.5M,
          between Europe and the United States.
        </p>
        <h2>Frequently asked questions</h2>
        <dl>
          {FAQ.map((item) => (
            <div key={item.q}>
              <dt>{item.q}</dt>
              <dd>{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
