export type Founder = {
  /** Full name as shown in the `founders` row. */
  name: string;
  /** First name (or preferred short form) used in the intro line:
   *  "We're grateful to Sam, Shane, and Abhi for showing us ...". */
  short: string;
};

/**
 * Describes a package or container from which we can surface a downloads/pulls
 * stat. The prefix picks the registry; the body is the identifier used by that
 * registry's API.
 *
 *   'npm:<pkg>'              — npmjs.org (last-month downloads)
 *   'pypi:<pkg>'             — pypistats.org (recent monthly)
 *   'docker:<owner>/<img>'   — Docker Hub (pull_count)
 *   'ghcr:<owner>/<repo>'    — GitHub Container Registry (scraped at build time
 *                              into lib/container-pulls.generated.ts)
 *   'gh-releases:<owner>/<repo>' — cumulative downloads across all release
 *                              assets. Use for tools shipped as prebuilt
 *                              binaries (install script / Homebrew / direct
 *                              download) rather than through a registry — a
 *                              Rust or Go CLI, typically. A language registry
 *                              would only see the fraction who install that
 *                              way; see the note on ghReleaseDownloads.
 */
export type PackageRef =
  | `npm:${string}`
  | `pypi:${string}`
  | `docker:${string}`
  | `ghcr:${string}`
  | `gh-releases:${string}`;

export type Company = {
  slug: string;
  company: string;
  /** Short pitch, as close as possible to the company's own landing page. */
  oneLiner: string;
  /** 'pre-commit' → companies the team backed before >commit. Rendered with
   *  the "Before >commit ..." intro paragraph.
   *  'active' → current >commit portfolio. No intro paragraph. */
  folder: 'pre-commit' | 'active';
  avatar: string;

  // Header link row — rendered in this order when present:
  //   github · huggingface · website · docs · discord|slack
  website?: string;
  github?: string;
  docs?: string;
  discord?: string;
  slack?: string;
  huggingface?: string;

  package?: PackageRef;

  // Metadata grid
  stage?: string;
  location?: string;
  founders?: Founder[];

  /** ISO date of the first commit on the primary `github` repo. Static —
   *  it's a fact of the past, fetched once and baked in so we don't burn
   *  GitHub API quota on every page view. */
  firstCommit?: string;

  /** Manual license override. GitHub's auto-detector returns NOASSERTION for
   *  hybrid LICENSE files (e.g. main repo under one license, `ee/` under
   *  another). Set this when the detector can't pick a single SPDX id. */
  license?: string;

  /** Manual primary-language override. Use when GitHub's heuristic picks a
   *  skewing file type (e.g. "Jupyter Notebook") over the repo's real main
   *  language. */
  language?: string;

  /** The # about paragraph — describes what the company does. */
  about?: string;

  /** Short, SERP/social-friendly version (~120-140 chars) used as `<meta
   *  name="description">` and `og:description` on the company-detail page.
   *  Falls back to `about` if absent — but `about` is typically 250-400
   *  chars and gets mid-sentence-truncated by Google. Keep this tight,
   *  factual, with the >commit relationship as a brief tag at the end. */
  seoDescription?: string;

  /** The per-company ending of the intro paragraph, continuing
   *  "We're grateful to {names} for showing us …".
   *  Only set on pre-commit companies. */
  thankInsight?: string;

  /** Rendered as "(acq. Elastic)" next to the company name. */
  acquiredBy?: string;

  /** Only meaningful alongside `acquiredBy`. By default an acquisition freezes
   *  the card: CompanyCard skips the live GitHub/registry fetch, because on a
   *  repo that's been archived or merged into the acquirer, live
   *  stars/forks/contributors read as misleading (see keep, graphcore).
   *
   *  Set this when the project stays independently alive under the acquirer
   *  and the live numbers are still the true story — better-auth is the case
   *  that prompted it. Decide per acquisition rather than by default; if you
   *  set this, drop any baked `license`/`language` overrides so the live
   *  values come through. */
  keepLiveStats?: boolean;

  /** Stealth investments. When `true`, the CompanyCard renders a single
   *  `<filename>: Permission denied` line instead of the normal layout, the
   *  page emits no Organization JSON-LD (we don't index a teaser as a real
   *  entity), and the file shows muted in the file tree. */
  stealth?: boolean;
};

export const COMPANIES: readonly Company[] = [
  {
    slug: 'mastra',
    company: 'Mastra',
    oneLiner: 'TypeScript AI agent framework',
    folder: 'pre-commit',
    avatar: '/companies/pre-commit/mastra.png',
    website: 'https://mastra.ai',
    github: 'https://github.com/mastra-ai/mastra',
    docs: 'https://mastra.ai/docs',
    discord: 'https://discord.com/invite/BTYqqHKUrf',
    package: 'npm:@mastra/core',
    stage: 'Seed',
    location: 'San Francisco',
    founders: [
      { name: 'Sam Bhagwat', short: 'Sam' },
      { name: 'Shane Thomas', short: 'Shane' },
      { name: 'Abhi Aiyer', short: 'Abhi' },
    ],
    firstCommit: '2024-08-06',
    license: 'Apache-2.0',
    about:
      'Mastra is an opinionated TypeScript framework for building agents, workflows, RAG pipelines, and evals. It ships the primitives (memory, tools, tracing, voice) under a single API so teams can go from a notebook prototype to a production agent without reassembling the stack each time.',
    seoDescription:
      'TypeScript framework for AI agents, workflows, RAG, and evals. Backed by the >commit team before the fund.',
    thankInsight:
      'how an opinionated framework can define a category before it fully exists, and the power of building community conviction through great writing.',
  },
  {
    slug: 'twenty',
    company: 'Twenty',
    oneLiner: 'Enterprise CRM at AI Speed',
    folder: 'pre-commit',
    avatar: '/companies/pre-commit/twenty.png',
    website: 'https://twenty.com',
    github: 'https://github.com/twentyhq/twenty',
    docs: 'https://docs.twenty.com/developers',
    discord: 'https://discord.gg/cx5n4Jzs57',
    package: 'docker:twentycrm/twenty',
    stage: 'Seed',
    location: 'San Francisco, Paris',
    founders: [
      { name: 'Charles Bochet', short: 'Charles' },
      { name: 'Félix Malfait', short: 'Félix' },
      { name: 'Thomas des Francs', short: 'Thomas' },
    ],
    firstCommit: '2022-12-01',
    license: 'AGPL-3.0',
    about:
      'Twenty is an open-source CRM platform: a developer-first extensibility toolkit for composing customer and internal apps without vendor lock-in. It ships production-grade building blocks (data model, permissions, workflows, authentication), runs locally like normal software, and is AI-native via an MCP server so agents can iterate on the schema, layouts, and automation directly.',
    seoDescription:
      'Open-source CRM platform — developer-first, AI-native via MCP. Backed by the >commit team before the fund.',
    thankInsight:
      'how open source can redefine entire business-application categories by turning developer ergonomics and community momentum into a distribution engine.',
  },
  {
    slug: 'better-auth',
    company: 'Better Auth',
    oneLiner: 'Auth that lives inside your app',
    folder: 'pre-commit',
    avatar: '/companies/pre-commit/better-auth.png',
    website: 'https://better-auth.com',
    github: 'https://github.com/better-auth/better-auth',
    docs: 'https://better-auth.com/docs',
    discord: 'https://discord.gg/better-auth',
    package: 'npm:better-auth',
    stage: 'Seed',
    location: 'San Francisco',
    founders: [{ name: 'Bereket Engida', short: 'Bereket' }],
    acquiredBy: 'Vercel',
    // Unlike keep and graphcore, better-auth stays independently alive under
    // Vercel — the repo is unarchived and still shipping, and the adoption
    // numbers are the most impressive part of the story. So keep the live
    // fetch, and no baked license/language overrides: GitHub reports MIT and
    // TypeScript correctly here.
    keepLiveStats: true,
    firstCommit: '2024-08-10',
    about:
      'Better Auth is a framework-agnostic TypeScript authentication library that lives inside your app rather than behind a vendor API. It ships session management, social sign-on, two-factor, and organizations out of the box, and a plugin system that lets teams extend the auth layer instead of outgrowing it.',
    seoDescription:
      'Framework-agnostic TypeScript auth that lives inside your app. Sessions, social sign-on, 2FA, plugins. Acquired by Vercel. Backed by the >commit team before the fund.',
    thankInsight:
      'how to reimagine a crowded, vendor-dominated category by giving developers full ownership again — and that open source knows no borders.',
  },
  {
    slug: 'atuin',
    company: 'Atuin',
    oneLiner: 'Making your terminal magical',
    folder: 'pre-commit',
    avatar: '/companies/pre-commit/atuin.png',
    website: 'https://atuin.sh',
    github: 'https://github.com/atuinsh/atuin',
    docs: 'https://docs.atuin.sh',
    discord: 'https://discord.gg/Fq8bJSKPHh',
    // Release assets, not crates.io. Atuin is installed via its script,
    // Homebrew or a distro package — `cargo install atuin` is a small slice, so
    // crates.io reads ~5k/90d against ~1.4M actual binary downloads.
    package: 'gh-releases:atuinsh/atuin',
    stage: 'Seed',
    location: 'San Francisco',
    founders: [{ name: 'Ellie Huxtable', short: 'Ellie' }],
    firstCommit: '2020-10-04',
    // No license/language overrides — GitHub reports MIT and Rust correctly.
    about:
      'Atuin replaces your shell history with a searchable SQLite database, then syncs it between machines with end-to-end encryption. It records the context around every command — exit code, duration, directory, session — so history becomes something you can actually query, and ships a self-hostable server for anyone who would rather keep their own data.',
    seoDescription:
      'Shell history as a searchable, end-to-end encrypted, syncable database. Self-hostable. Backed by the >commit team before the fund.',
    thankInsight:
      "that a side project she started to scratch her own itch can build an enormous community long before it's a business — and that building in the open is the way to earn developer trust.",
  },
  {
    slug: 'sourcebot',
    company: 'Sourcebot',
    oneLiner: 'The Code Understanding Platform',
    folder: 'pre-commit',
    avatar: '/companies/pre-commit/sourcebot.png',
    website: 'https://sourcebot.dev',
    github: 'https://github.com/sourcebot-dev/sourcebot',
    docs: 'https://docs.sourcebot.dev',
    package: 'ghcr:sourcebot-dev/sourcebot',
    stage: 'Seed',
    location: 'San Francisco, Vancouver',
    founders: [
      { name: 'Brendan Kellam', short: 'Brendan' },
      { name: 'Michael Sukkarieh', short: 'Michael' },
    ],
    firstCommit: '2024-08-23',
    license: 'FSL-1.1-ALv2',
    about:
      'Sourcebot is a self-hosted code understanding platform. It indexes every repository in an organization, answers natural-language questions across them, and powers AI-assisted search so teams can navigate large, multi-service codebases without rebuilding context every time.',
    seoDescription:
      'Self-hosted code understanding platform. Indexes every repo, answers natural-language questions across them. Backed by the >commit team before the fund.',
    thankInsight:
      'that code search and intelligence, built openly, can become essential infrastructure for the next generation of developer platforms.',
  },
  {
    slug: 'pyannote',
    company: 'pyannote',
    oneLiner: 'Speaker intelligence for developers',
    folder: 'pre-commit',
    avatar: '/companies/pre-commit/pyannote.png',
    website: 'https://pyannote.ai',
    github: 'https://github.com/pyannote/pyannote-audio',
    docs: 'https://docs.pyannote.ai',
    slack: 'https://join.slack.com/t/pyannoteai/shared_invite/zt-3njz241t3-Juqc~wCf~x6HrNEV5k1wsA',
    huggingface: 'https://huggingface.co/pyannote',
    package: 'pypi:pyannote.audio',
    stage: 'Seed',
    location: 'Paris',
    founders: [
      { name: 'Hervé Bredin', short: 'Hervé' },
      { name: 'Vincent Molina', short: 'Vincent' },
    ],
    firstCommit: '2016-03-07',
    language: 'Python',
    about:
      'pyannote turns real-world audio into structured, programmable intelligence — speaker diarization, voice identification, overlap detection, and real-time streaming — delivered through developer APIs and built on the widely-used pyannote.audio open-source toolkit.',
    seoDescription:
      'Speaker intelligence APIs — diarization, voice ID, real-time streaming. Built on pyannote.audio. Backed by the >commit team before the fund.',
    thankInsight:
      'that the most impactful open-source projects are often invisible to the end user, quietly powering entire ecosystems of voice and audio intelligence.',
  },
  {
    slug: 'pangolin',
    company: 'Pangolin',
    oneLiner: 'The All-in-One Remote Access Hub',
    folder: 'pre-commit',
    avatar: '/companies/pre-commit/pangolin.png',
    website: 'https://pangolin.net',
    github: 'https://github.com/fosrl/pangolin',
    docs: 'https://docs.pangolin.net',
    slack: 'https://pangolin.net/slack',
    package: 'docker:fosrl/pangolin',
    stage: 'Seed',
    location: 'San Francisco',
    founders: [
      { name: 'Milo Schwartz', short: 'Milo' },
      { name: 'Owen Schwartz', short: 'Owen' },
    ],
    firstCommit: '2024-09-27',
    license: 'AGPL-3.0',
    about:
      'Pangolin is an identity-aware remote-access hub built for IT/OT, IoT, and engineering: a self-hosted reverse proxy and tunneled VPN that gives users secure, SSO-backed access to applications and infrastructure, with context-aware rules and a unified control plane.',
    seoDescription:
      'Identity-aware remote-access hub for IT/OT and IoT. Self-hosted reverse proxy + tunneled VPN. Backed by the >commit team before the fund.',
    thankInsight:
      'the remarkable scale of demand for open, self-hosted networking infrastructure that is privacy-first by design and not by marketing.',
  },
  {
    slug: 'whitecircle',
    company: 'White Circle',
    oneLiner: 'Control your AI',
    folder: 'pre-commit',
    avatar: '/companies/pre-commit/whitecircle.png',
    website: 'https://whitecircle.ai',
    github: 'https://github.com/whitecircle-ai/circle-guard-bench',
    huggingface: 'https://huggingface.co/whitecircle-ai',
    stage: 'Pre-seed',
    location: 'San Francisco, Paris',
    founders: [{ name: 'Denis Shilov', short: 'Denis' }],
    firstCommit: '2025-05-02',
    about:
      'White Circle is a control layer for AI applications — stress-testing models for jailbreaks and hallucinations, enforcing low-latency safeguards at runtime, and auto-patching vulnerabilities — so teams can ship LLM features with confidence.',
    seoDescription:
      'Control layer for AI applications — jailbreak and hallucination tests, runtime safeguards, auto-patching. Backed by the >commit team before the fund.',
    thankInsight:
      'how critical it is to observe and guardrail AI systems in the age of LLMs — and that community-driven benchmarks can define the standard.',
  },
  {
    slug: 'keep',
    company: 'Keep',
    oneLiner: 'The Open-Source AIOps Platform',
    folder: 'pre-commit',
    avatar: '/companies/pre-commit/keep.png',
    website: 'https://www.keephq.dev',
    github: 'https://github.com/keephq/keep',
    docs: 'https://docs.keephq.dev',
    slack: 'https://slack.keephq.dev',
    stage: 'Seed',
    location: 'Tel Aviv, San Francisco',
    founders: [
      { name: 'Shahar Glazner', short: 'Shahar' },
      { name: 'Tal Borenstein', short: 'Tal' },
    ],
    acquiredBy: 'Elastic',
    firstCommit: '2023-02-04',
    license: 'MIT',
    // No `keepLiveStats` here, so `acquiredBy` freezes the card and skips the
    // live api.github.com fetch — the right default for a repo that's been
    // absorbed by the acquirer, where live stars/contributors mislead. Without
    // the fetch, `language` falls through to whatever is set here, so bake the
    // value GitHub reported while the project was active. Same for graphcore
    // below; better-auth is the counter-example that opts back in.
    language: 'Python',
    about:
      'Keep is an open-source AIOps platform — a Swiss-knife for managing alerts and events at scale. It correlates noisy signals from monitoring tools, runs automated workflows across them, and ships with AI-powered deduplication so on-call teams see fewer pages and more signal.',
    seoDescription:
      'Open-source AIOps platform. Correlates alerts, automates workflows, AI-powered dedup. Acquired by Elastic. Backed by the >commit team before the fund.',
    thankInsight:
      'that even in a commoditized space, an MIT-licensed, community-rooted platform can monetize by solving real developer problems — and become a powerful path to acquisition.',
  },
  {
    slug: 'pandasai',
    company: 'PandasAI',
    oneLiner: 'AI Dashboard for Business Intelligence',
    folder: 'pre-commit',
    avatar: '/companies/pre-commit/pandasAI.png',
    website: 'https://pandas-ai.com',
    github: 'https://github.com/Sinaptik-AI/pandas-ai',
    docs: 'https://docs.pandas-ai.com',
    discord: 'https://discord.com/invite/kF7FqH2FwS',
    package: 'pypi:pandasai',
    stage: 'Pre-seed',
    location: 'San Francisco, Munich',
    founders: [{ name: 'Gabriele Venturi', short: 'Gabriele' }],
    firstCommit: '2023-04-22',
    license: 'MIT',
    about:
      'PandasAI makes data analysis conversational. It lets teams chat with SQL databases, datalakes, and local files (CSV, Parquet) using LLMs and RAG, delivering business-intelligence answers without writing SQL or Python.',
    seoDescription:
      'Conversational data analysis — chat with SQL, datalakes, and CSV/Parquet using LLMs and RAG. Backed by the >commit team before the fund.',
    thankInsight:
      'the compounding power of bringing AI capabilities to the libraries developers already live inside, turning existing ecosystems into launchpads for entirely new workflows.',
  },
  {
    slug: 'graphcore',
    company: 'Graphcore',
    oneLiner: 'Accelerating machine learning in the cloud',
    folder: 'pre-commit',
    avatar: '/companies/pre-commit/graphcore.png',
    website: 'https://graphcore.ai',
    github: 'https://github.com/graphcore/poptorch',
    docs: 'https://docs.graphcore.ai',
    stage: 'Seed',
    location: 'Bristol',
    founders: [
      { name: 'Nigel Toon', short: 'Nigel' },
      { name: 'Simon Knowles', short: 'Simon' },
    ],
    acquiredBy: 'SoftBank',
    firstCommit: '2020-02-17',
    license: 'MIT',
    language: 'C++',
    about:
      'Graphcore builds Intelligence Processing Units (IPUs) — a new class of silicon purpose-built for machine intelligence — alongside an open toolchain that lets developers run PyTorch, TensorFlow, and custom models on IPU-accelerated infrastructure in the cloud.',
    seoDescription:
      'Intelligence Processing Units for machine intelligence. Open toolchain for PyTorch and TensorFlow. Acquired by SoftBank. Backed by Olivier before >commit.',
    thankInsight:
      'that in AI infrastructure, the openness of the toolchain and the strength of the developer community matter as much as the hardware itself.',
  },
  {
    // Disclosed at launch (TechCrunch, 2026-07-08). Slug is the company name
    // now that it's public (`zml.txt`, /companies/zml/); the old stealth
    // /companies/inference/ path 301s here via a redirect stub route.
    slug: 'zml',
    company: 'ZML',
    oneLiner: 'Production inference stack decoupling AI from proprietary hardware',
    folder: 'active',
    avatar: '/companies/zml.png',
    website: 'https://zml.ai',
    github: 'https://github.com/zml/zml',
    docs: 'https://docs.zml.ai',
    discord: 'https://discord.gg/6y72SN2E7H',
    package: 'docker:zmlai/llmd',
    stage: 'Seed',
    location: 'Paris',
    founders: [{ name: 'Steeve Morin', short: 'Steeve' }],
    firstCommit: '2024-09-17',
    license: 'Apache-2.0',
    language: 'Zig',
    about:
      'ZML is a production inference stack that decouples AI workloads from proprietary hardware. From a single codebase it compiles large language models — Llama, Gemma, Qwen, Mistral — to run at peak speed across NVIDIA, AMD, Google TPU, Intel, and Apple Metal, letting teams mix accelerators, break vendor lock-in, and cut inference cost and energy. Its LLMD inference server, built on Zig, MLIR, and OpenXLA, launched free in 2026.',
    seoDescription:
      'Production inference stack that runs LLMs at peak speed across NVIDIA, AMD, TPU, Intel, and Apple chips. >commit Fund I.',
  },
  {
    slug: 'specs',
    company: 'Stealth',
    oneLiner: 'Specifications framework',
    folder: 'active',
    avatar: '',
    stealth: true,
  },
  {
    slug: 'agent-mux',
    company: 'Stealth',
    oneLiner: 'The Code Editor for AI Agents',
    folder: 'active',
    avatar: '',
    stealth: true,
  },
  {
    slug: 'backup',
    company: 'Stealth',
    oneLiner: 'Open-source backup platform',
    folder: 'active',
    avatar: '',
    stealth: true,
  },
  {
    slug: 'macrodata',
    company: 'Macrodata Labs',
    oneLiner: 'Every strong model starts with great data',
    folder: 'active',
    avatar: '/companies/macrodata.png',
    website: 'https://macrodata.co',
    github: 'https://github.com/macrodata-labs/refiner',
    docs: 'https://macrodata.co/docs',
    discord: 'https://discord.gg/S8kZtmBR2x',
    huggingface: 'https://huggingface.co/macrodata',
    package: 'pypi:macrodata-refiner',
    stage: 'Pre-seed',
    location: 'Paris',
    founders: [
      { name: 'Guilherme Penedo', short: 'Guilherme' },
      { name: 'Hynek Kydlíček', short: 'Hynek' },
    ],
    firstCommit: '2026-01-12',
    about:
      'Macrodata Labs builds training-data infrastructure for physical AI. Its open-source framework, Refiner, turns raw multimodal robotics data (trajectories, camera feeds, audio, language) into high-quality training datasets, running locally for development and scaling to an elastic serverless cloud with a single command. Built by the team behind FineWeb, the largest open LLM pre-training datasets.',
    seoDescription:
      'Training data infrastructure for physical AI. Open-source Refiner framework, by the creators of FineWeb. >commit Fund I.',
  },
  {
    slug: 'uma',
    company: 'UMA',
    oneLiner: 'Intelligent robots that enhance quality of life for everyone',
    folder: 'active',
    avatar: '/companies/uma.png',
    website: 'https://uma.bot',
    github: 'https://github.com/uma-robots',
    stage: 'Pre-seed',
    location: 'Paris',
    founders: [
      { name: 'Rémi Cadene', short: 'Rémi' },
      { name: 'Robert Knight', short: 'Robert' },
      { name: 'Pierre Sermanet', short: 'Pierre' },
      { name: 'Simon Alibert', short: 'Simon' },
    ],
    about:
      'UMA builds humanoid robots that combine human-level dexterity with a deep understanding of the physical world. The team blends AI research from DeepMind, Tesla Autopilot, and HuggingFace with decades of humanoid-robotics hardware experience to ship general-purpose machines that can take on everyday physical tasks.',
    seoDescription:
      'Humanoid robots with human-level dexterity. Team from DeepMind, Tesla Autopilot, and HuggingFace. >commit Fund I.',
  },
] as const;

/** Portfolio display order: public companies before stealth, then
 *  alphabetical by slug within each group. The COMPANIES array stays in the
 *  order entries were added (readability + minimal diffs when a new
 *  investment lands); anything that *renders* the portfolio derives its order
 *  from this comparator rather than array position, so a new company slots
 *  into the right place automatically. Mirrors `compareFileEntries` in
 *  lib/filesystem, which applies the same rule to the file-tree / CLI `ls`. */
export function byPortfolioOrder(a: Company, b: Company): number {
  const sa = a.stealth ? 1 : 0;
  const sb = b.stealth ? 1 : 0;
  if (sa !== sb) return sa - sb;
  return a.slug.localeCompare(b.slug);
}

export const PRE_COMMIT_COMPANIES = COMPANIES.filter((c) => c.folder === 'pre-commit');
export const ACTIVE_COMPANIES = COMPANIES.filter((c) => c.folder === 'active').sort(
  byPortfolioOrder,
);

/** Format a list of founder short names with Oxford comma:
 *   ["Sam"]                     → "Sam"
 *   ["Sam", "Shane"]            → "Sam and Shane"
 *   ["Sam", "Shane", "Abhi"]    → "Sam, Shane, and Abhi"
 */
export function formatFounderShortNames(founders: readonly Founder[]): string {
  const names = founders.map((f) => f.short);
  if (names.length === 0) return '';
  if (names.length === 1) return names[0] ?? '';
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}
