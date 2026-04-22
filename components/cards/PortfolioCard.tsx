import type { PortfolioCompany } from '@/lib/portfolio';
import Image from 'next/image';
import styles from './Card.module.css';
import { GithubMetrics } from './GithubMetrics';

const isPlaceholder = (v: string | undefined): v is string => !!v && v.startsWith('$');

function Label({ text, placeholder }: { text: string; placeholder?: boolean }) {
  return placeholder ? (
    <span className={styles.placeholder}>{text}</span>
  ) : (
    <span className={styles.label}>{text}</span>
  );
}

function ExternalLink({ href }: { href: string }) {
  if (isPlaceholder(href)) {
    return <span className={styles.placeholder}>{href}</span>;
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={styles.link}>
      {href}
    </a>
  );
}

export function PortfolioCard({ company }: { company: PortfolioCompany }) {
  const showMetrics = company.github !== undefined && !isPlaceholder(company.github);
  return (
    <div>
      {company.story ? (
        <div className={styles.story}>
          {company.story.split('\n').map((p, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: story paragraphs are stable within a company
            <p key={i}>{p}</p>
          ))}
        </div>
      ) : null}
      <div className={styles.card}>
        <div className={`${styles.imageWrap} ${styles.portfolioImageWrap}`}>
          <Image src={company.avatar} alt={`${company.company}'s logo`} width={96} height={96} />
        </div>
        <div className={styles.data}>
          <span className={styles.rule} />
          <p>
            <Label text={company.company} placeholder={isPlaceholder(company.company)} />
          </p>
          <p>
            <span className={styles.label}>{company.oneLiner}</span>
          </p>
          <p>
            <ExternalLink href={company.website ?? '$website'} />
          </p>
          <p>
            <ExternalLink href={company.github ?? '$github'} />
          </p>
          <span className={styles.rule} />
        </div>
      </div>
      {showMetrics && company.github ? (
        <GithubMetrics github={company.github} pkg={company.package} />
      ) : null}
    </div>
  );
}
