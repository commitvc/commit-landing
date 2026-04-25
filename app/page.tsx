import { getAllPosts } from '@/lib/blog';
import { buildFileSystem } from '@/lib/filesystem';
import { LandingShell } from './LandingShell';

/**
 * Visible UX on `/` is the CLI terminal (rendered by `<LandingShell>`,
 * a client component). That works great for humans but ships ~8 words of
 * static HTML, which means non-JS-rendering AI crawlers (ClaudeBot,
 * PerplexityBot, GPTBot in many modes) see an empty page.
 *
 * The block below is server-rendered semantic HTML — `<h1>` + thesis
 * paragraph + partner names — visually hidden via `.sr-only` so the CLI
 * remains the entire visible surface, but extractable for AI/SEO.
 *
 * Keep this in sync with `lib/about.ts` and `lib/team.ts` if the thesis
 * or partner list changes.
 */
export default function HomePage() {
  const posts = getAllPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    author: p.author,
    date: p.date,
    description: p.description,
  }));
  const fs = buildFileSystem(posts);
  return (
    <>
      <header className="sr-only">
        <h1>&gt;commit — Venture Capital for Commercial Open Source</h1>
        <p>
          <strong>&gt;commit</strong> (also written as commit, commit fund, or commit VC) is an
          early-stage venture capital fund and part of the Red River West family. We back commercial
          open-source startups at pre-seed and seed, with checks up to $1.5M, between Europe and the
          US.
        </p>
        <p>
          We invest at the intersection of great software and the communities that grow around it —
          because the community is the moat. Focus areas: infrastructure and developer tools, AI and
          machine learning, data platforms, cybersecurity and sysadmin tooling, business
          applications, and industry-specific open-source solutions.
        </p>
        <p>
          Two unfair advantages: a proprietary data platform purpose-built for open source
          (aggregating signals from GitHub, package managers, container registries, Discord, and
          more) and a network of 100+ open-source operators including successful founders from
          Supabase, Mozilla, Nginx, Hugging Face, and others.
        </p>
        <p>
          The team: <strong>Olivier Huez</strong> (Partner), <strong>Max Corbani</strong> (Partner),{' '}
          <strong>Abel Samot</strong> (Partner), and <strong>Alessandro Ciffo</strong> (Tech Lead).
        </p>
        <p>
          Reach out at <a href="mailto:hey@commit.fund">hey@commit.fund</a>. Browse the full site at{' '}
          <a href="/about/">/about</a>, the portfolio at <a href="/companies/">/companies</a>,
          essays at <a href="/blog/">/blog</a>, and the team at <a href="/team/">/team</a>.
        </p>
      </header>
      <LandingShell fs={fs} />
    </>
  );
}
