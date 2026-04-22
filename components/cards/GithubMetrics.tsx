'use client';

import { type GithubStats, fetchGithubStats, formatNumber } from '@/lib/github-stats';
import { useEffect, useState } from 'react';
import styles from './Card.module.css';

type Props = { github: string; pkg?: string };

export function GithubMetrics({ github, pkg }: Props) {
  const [stats, setStats] = useState<GithubStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchGithubStats(github, pkg).then((s) => {
      if (cancelled) return;
      setStats(s);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [github, pkg]);

  if (loading) {
    return (
      <div className={styles.metrics} aria-label="Loading repository metrics">
        <span style={{ opacity: 0.4 }}>⋯</span>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className={styles.metrics}>
      <span className={styles.metric}>
        ★ <span className={styles.metricValue}>{formatNumber(stats.stars)}</span>
      </span>
      <span className={styles.metric}>
        ⑂ <span className={styles.metricValue}>{formatNumber(stats.forks)}</span>
      </span>
      {stats.downloads !== undefined ? (
        <span className={styles.metric}>
          ↓ <span className={styles.metricValue}>{formatNumber(stats.downloads)}/mo</span>
        </span>
      ) : null}
    </div>
  );
}
