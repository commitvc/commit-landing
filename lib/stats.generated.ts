/**
 * GENERATED FILE — do not edit by hand.
 *
 * Written by scripts/fetch-stats.mjs, which runs as `pnpm prebuild`. Committed
 * on purpose: it is the source of truth for `next build`, so the build never
 * depends on the network, and these numbers ship inside the static HTML where
 * crawlers and AI search can actually read them.
 *
 * To refresh: `pnpm fetch-stats` (needs GITHUB_TOKEN, or a logged-in `gh`).
 *
 * Last fetched: 2026-08-04
 */
import type { CompanyStats } from './github-stats';

export const BAKED_STATS: Record<string, CompanyStats> = {
  atuin: {
    repo: {
      stars: 31_018,
      forks: 918,
      openIssues: 376,
      contributors: 316,
      license: 'MIT',
      language: 'Rust',
    },
    download: { kind: 'gh-releases', count: 1_386_130, period: 'total' },
  },
  'better-auth': {
    repo: {
      stars: 29_452,
      forks: 2_772,
      openIssues: 641,
      contributors: 903,
      license: 'MIT',
      language: 'TypeScript',
    },
    download: { kind: 'npm', count: 24_484_541, period: 'month' },
  },
  macrodata: {
    repo: {
      stars: 109,
      forks: 11,
      openIssues: 27,
      contributors: 5,
      license: 'Apache-2.0',
      language: 'Python',
    },
    download: { kind: 'pypi', count: 344, period: 'month' },
  },
  mastra: {
    repo: {
      stars: 26_908,
      forks: 2_562,
      openIssues: 632,
      contributors: 591,
      language: 'TypeScript',
    },
    download: { kind: 'npm', count: 5_196_180, period: 'month' },
  },
  pandasai: {
    repo: { stars: 23_686, forks: 2_338, openIssues: 21, contributors: 112, language: 'Python' },
    download: { kind: 'pypi', count: 191_449, period: 'month' },
  },
  pangolin: {
    repo: { stars: 21_985, forks: 742, openIssues: 101, contributors: 106, language: 'TypeScript' },
    download: { kind: 'docker', count: 3_677_970, period: 'total' },
  },
  pyannote: {
    repo: {
      stars: 10_373,
      forks: 1_093,
      openIssues: 32,
      contributors: 76,
      license: 'MIT',
      language: 'Jupyter Notebook',
    },
    download: { kind: 'pypi', count: 2_239_418, period: 'month' },
  },
  sourcebot: {
    repo: { stars: 3_655, forks: 331, openIssues: 166, contributors: 54, language: 'TypeScript' },
    download: { kind: 'ghcr', count: 650_862, period: 'total' },
  },
  twenty: {
    repo: {
      stars: 54_244,
      forks: 8_342,
      openIssues: 141,
      contributors: 704,
      language: 'TypeScript',
    },
    download: { kind: 'docker', count: 1_897_795, period: 'total' },
  },
  whitecircle: {
    repo: {
      stars: 72,
      forks: 5,
      openIssues: 0,
      contributors: 9,
      license: 'Apache-2.0',
      language: 'Python',
    },
    download: null,
  },
  zml: {
    repo: {
      stars: 3_956,
      forks: 172,
      openIssues: 39,
      contributors: 32,
      license: 'Apache-2.0',
      language: 'Zig',
    },
    download: { kind: 'docker', count: 4_647, period: 'total' },
  },
} as const;
