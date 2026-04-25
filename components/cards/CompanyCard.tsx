'use client';

import { type Company, formatFounderShortNames } from '@/lib/companies';
import {
  type CompanyStats,
  downloadLabel,
  fetchCompanyStats,
  formatNumber,
} from '@/lib/github-stats';
import Image from 'next/image';
import { Fragment, useEffect, useState } from 'react';
import styles from './CompanyCard.module.css';

type Props = { company: Company };

/** "2024-08-06" → "Aug 2024" — how the `# project` block shows first commit. */
function formatMonthYear(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/** Join strings with " · " for display (metadata values, link row, founders). */
function InterleaveWithSeparator({
  parts,
  separator,
}: {
  parts: React.ReactNode[];
  separator: React.ReactNode;
}) {
  return (
    <>
      {parts.map((p, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: stable derived list
        <Fragment key={i}>
          {i > 0 ? separator : null}
          {p}
        </Fragment>
      ))}
    </>
  );
}

function Intro({ company }: Props) {
  if (company.folder !== 'pre-commit' || !company.thankInsight || !company.founders?.length) {
    return null;
  }
  const names = formatFounderShortNames(company.founders);
  return (
    <p className={styles.intro}>
      Before &gt;commit, the team spent years backing open-source founders. We&rsquo;re grateful to{' '}
      {names} for showing us {company.thankInsight}
    </p>
  );
}

function Header({ company }: Props) {
  const links: React.ReactNode[] = [];
  if (company.github) {
    links.push(
      <a key="github" href={company.github} target="_blank" rel="noopener noreferrer">
        GitHub
      </a>,
    );
  }
  if (company.huggingface) {
    links.push(
      <a key="huggingface" href={company.huggingface} target="_blank" rel="noopener noreferrer">
        Hugging Face
      </a>,
    );
  }
  if (company.website) {
    links.push(
      <a key="website" href={company.website} target="_blank" rel="noopener noreferrer">
        Website
      </a>,
    );
  }
  if (company.docs) {
    links.push(
      <a key="docs" href={company.docs} target="_blank" rel="noopener noreferrer">
        Docs
      </a>,
    );
  }
  if (company.discord) {
    links.push(
      <a key="discord" href={company.discord} target="_blank" rel="noopener noreferrer">
        Discord
      </a>,
    );
  } else if (company.slack) {
    links.push(
      <a key="slack" href={company.slack} target="_blank" rel="noopener noreferrer">
        Slack
      </a>,
    );
  }

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Image src={company.avatar} alt={`${company.company} logo`} width={120} height={120} />
      </div>
      <div className={styles.headerBody}>
        <h2 className={styles.title}>
          {company.company}
          {company.acquiredBy ? (
            <span className={styles.acquired}>(acq. {company.acquiredBy})</span>
          ) : null}
        </h2>
        <p className={styles.tagline}>{company.oneLiner}</p>
        {links.length > 0 ? <div className={styles.linkRow}>{links}</div> : null}
      </div>
    </header>
  );
}

function MetadataGrid({ company }: Props) {
  const dot = (
    <span className={styles.linkSep} aria-hidden>
      {' '}
      ·{' '}
    </span>
  );
  const rows: { label: string; value: React.ReactNode }[] = [];
  if (company.stage) rows.push({ label: 'stage', value: company.stage });
  if (company.founders?.length) {
    const names = company.founders.map((f, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: stable order
      <Fragment key={i}>{f.name}</Fragment>
    ));
    rows.push({
      label: 'founders',
      value: <InterleaveWithSeparator parts={names} separator={dot} />,
    });
  }
  if (company.location) rows.push({ label: 'location', value: company.location });
  if (rows.length === 0) return null;
  return (
    <dl className={styles.meta}>
      {rows.map((r) => (
        <Fragment key={r.label}>
          <dt className={styles.metaLabel}>{r.label}</dt>
          <dd className={styles.metaValue}>{r.value}</dd>
        </Fragment>
      ))}
    </dl>
  );
}

function AboutSection({ about }: { about: string }) {
  return (
    <section className={styles.section}>
      <h3 className={styles.sectionHeading}># about</h3>
      <p className={styles.about}>{about}</p>
    </section>
  );
}

function Stat({
  value,
  label,
  loading,
}: {
  value: string | undefined;
  label: string;
  loading: boolean;
}) {
  if (!loading && !value) return null;
  return (
    <div className={styles.stat}>
      <span className={loading ? styles.statValueMuted : styles.statValue}>
        {loading ? '⋯' : value}
      </span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

function ProjectSection({ company, stats }: Props & { stats: CompanyStats | null }) {
  const loading = stats === null;
  const repo = stats?.repo ?? null;
  const download = stats?.download ?? null;

  const firstCommit = company.firstCommit ? formatMonthYear(company.firstCommit) : undefined;
  const license = company.license ?? repo?.license;
  const language = company.language ?? repo?.language ?? undefined;
  const stars = repo ? formatNumber(repo.stars) : undefined;
  const contributors =
    repo?.contributors !== undefined ? formatNumber(repo.contributors) : undefined;
  const downloads = download
    ? `${formatNumber(download.count)}${download.period === 'month' ? '/mo' : ''}`
    : undefined;

  // Skip the whole section if there's nothing to show and we're not loading.
  if (
    !loading &&
    !license &&
    !language &&
    !firstCommit &&
    !stars &&
    contributors === undefined &&
    !downloads
  ) {
    return null;
  }

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionHeading}># project</h3>
      <div className={styles.projectGrid}>
        <Stat value={license} label="LICENSE" loading={loading && !!company.github} />
        <Stat value={language} label="LANGUAGE" loading={loading && !!company.github} />
        <Stat value={firstCommit} label="FIRST COMMIT" loading={false} />
        <Stat value={stars} label="STARS" loading={loading && !!company.github} />
        <Stat value={contributors} label="CONTRIBUTORS" loading={loading && !!company.github} />
        <Stat
          value={downloads}
          label={download ? downloadLabel(download.kind) : 'DOWNLOADS'}
          loading={loading && !!company.package}
        />
      </div>
    </section>
  );
}

export function CompanyCard({ company }: Props) {
  const [stats, setStats] = useState<CompanyStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCompanyStats(company.github, company.package).then((s) => {
      if (!cancelled) setStats(s);
    });
    return () => {
      cancelled = true;
    };
  }, [company.github, company.package]);

  // Does the project block have any chance of rendering anything?
  const hasAnyProjectInfo = !!(company.github || company.package || company.firstCommit);

  return (
    <article className={styles.card}>
      <Intro company={company} />
      <Header company={company} />
      <MetadataGrid company={company} />
      {company.about ? <AboutSection about={company.about} /> : null}
      {hasAnyProjectInfo ? <ProjectSection company={company} stats={stats} /> : null}
    </article>
  );
}
