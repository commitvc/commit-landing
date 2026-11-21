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
 * Last fetched: 2026-11-02
 */
import type { CompanyStats } from './github-stats';

export const BAKED_STATS: Record<string, CompanyStats> = {
  atuin: {
    repo: {
      stars: 32_177,
      forks: 1_020,
      openIssues: 448,
      contributors: 339,
      license: 'MIT',
      language: 'Rust',
    },
    download: { kind: 'gh-releases', count: 1_784_003, period: 'total' },
  },
  'better-auth': {
    repo: {
      stars: 30_550,
      forks: 3_051,
      openIssues: 949,
      contributors: 991,
      license: 'MIT',
      language: 'TypeScript',
    },
    download: { kind: 'npm', count: 48_143_094, period: 'month' },
  },
  macrodata: {
    repo: {
      stars: 160,
      forks: 19,
      openIssues: 32,
      contributors: 6,
      license: 'Apache-2.0',
      language: 'Python',
    },
    download: { kind: 'pypi', count: 844, period: 'month' },
  },
  mastra: {
    repo: {
      stars: 29_275,
      forks: 3_068,
      openIssues: 710,
      contributors: 702,
      language: 'TypeScript',
    },
    download: { kind: 'npm', count: 8_589_619, period: 'month' },
  },
  pandasai: {
    repo: { stars: 23_925, forks: 2_344, openIssues: 23, contributors: 112, language: 'Python' },
    download: { kind: 'pypi', count: 31_394, period: 'month' },
  },
  pangolin: {
    repo: { stars: 23_293, forks: 807, openIssues: 127, contributors: 131, language: 'TypeScript' },
    download: { kind: 'docker', count: 6_238_419, period: 'total' },
  },
  paradev: {
    repo: {
      stars: 15_835,
      forks: 1_412,
      openIssues: 1_149,
      contributors: 140,
      language: 'TypeScript',
    },
    download: { kind: 'gh-installers', count: 211_853, period: 'total' },
  },
  pyannote: {
    repo: {
      stars: 10_750,
      forks: 1_130,
      openIssues: 36,
      contributors: 77,
      license: 'MIT',
      language: 'Jupyter Notebook',
    },
    download: { kind: 'pypi', count: 1_053_003, period: 'month' },
  },
  sourcebot: {
    repo: {
      stars: 4_017,
      forks: 376,
      openIssues: 96,
      contributors: 66,
      license: 'MIT',
      language: 'Python',
    },
    download: { kind: 'ghcr', count: 1_133_500, period: 'total' },
  },
  twenty: {
    repo: {
      stars: 60_294,
      forks: 9_906,
      openIssues: 148,
      contributors: 791,
      language: 'TypeScript',
    },
    download: { kind: 'docker', count: 3_191_827, period: 'total' },
  },
  whitecircle: {
    repo: {
      stars: 81,
      forks: 8,
      openIssues: 3,
      contributors: 9,
      license: 'Apache-2.0',
      language: 'Python',
    },
    download: null,
  },
  zml: {
    repo: {
      stars: 4_217,
      forks: 201,
      openIssues: 48,
      contributors: 37,
      license: 'Apache-2.0',
      language: 'Zig',
    },
    download: { kind: 'docker', count: 11_172, period: 'total' },
  },
} as const;
