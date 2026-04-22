export type PortfolioCompany = {
  slug: string;
  company: string;
  oneLiner: string;
  website?: string;
  github?: string;
  package?: string;
  story?: string;
  avatar: string;
  folder: 'pre-commit' | 'active';
};

const PRE_COMMIT_STORY_PREFIX =
  'Before >commit, the team spent years backing open-source founders and companies.\n';

export const PORTFOLIO: readonly PortfolioCompany[] = [
  {
    slug: 'twenty',
    company: 'Twenty',
    oneLiner: 'Open source CRM',
    website: 'https://twenty.com',
    github: 'https://github.com/twentyhq/twenty',
    story: `${PRE_COMMIT_STORY_PREFIX}Twenty showed us how open source could redefine entire business application categories through community momentum and bottom-up distribution.`,
    avatar: '/portfolio/pre-commit/twenty.png',
    folder: 'pre-commit',
  },
  {
    slug: 'sourcebot',
    company: 'Sourcebot',
    oneLiner: 'Open source code search and intelligence',
    website: 'https://sourcebot.dev',
    github: 'https://github.com/sourcebot-dev/sourcebot',
    story: `${PRE_COMMIT_STORY_PREFIX}Sourcebot showed us that code search and intelligence, built openly, can become essential infrastructure for the next generation of developer platforms.`,
    avatar: '/portfolio/pre-commit/sourcebot.png',
    folder: 'pre-commit',
  },
  {
    slug: 'pyannote',
    company: 'pyannote',
    oneLiner: 'Open source speaker diarization',
    website: 'https://pyannote.ai',
    github: 'https://github.com/pyannote/pyannote-audio',
    package: 'pypi:pyannote.audio',
    story: `${PRE_COMMIT_STORY_PREFIX}pyannote showed us that the most impactful open-source projects are often invisible to the end user, quietly powering entire ecosystems of voice and audio intelligence.`,
    avatar: '/portfolio/pre-commit/pyannote.png',
    folder: 'pre-commit',
  },
  {
    slug: 'pangolin',
    company: 'Pangolin',
    oneLiner: 'Open source self-hosted tunneling',
    website: 'https://pangolin.network',
    github: 'https://github.com/fosrl/pangolin',
    story: `${PRE_COMMIT_STORY_PREFIX}Pangolin showed us the remarkable scale of demand for open, self-hosted networking infrastructure that is privacy-first by design and not by marketing.`,
    avatar: '/portfolio/pre-commit/pangolin.png',
    folder: 'pre-commit',
  },
  {
    slug: 'whitecircle',
    company: 'White Circle',
    oneLiner: 'AI observability and guardrails',
    story: `${PRE_COMMIT_STORY_PREFIX}White Circle showed us how critical it is to observe and guardrail AI systems in the age of LLMs, and that community-driven benchmarks can define standards beyond the boundaries of pure open source.`,
    avatar: '/portfolio/pre-commit/whitecircle.png',
    folder: 'pre-commit',
  },
  {
    slug: 'keep',
    company: 'Keep',
    oneLiner: 'Open source alerting and observability',
    story: `${PRE_COMMIT_STORY_PREFIX}Keep showed us that even in a commoditized space, an MIT licensed and community rooted platform can monetize by solving real developer problems, and become a powerful path to acquisition.`,
    avatar: '/portfolio/pre-commit/keep.png',
    folder: 'pre-commit',
  },
  {
    slug: 'pandasai',
    company: 'PandasAI',
    oneLiner: 'AI-powered data analysis on pandas',
    website: 'https://pandas-ai.com',
    github: 'https://github.com/Sinaptik-AI/pandas-ai',
    package: 'pypi:pandasai',
    story: `${PRE_COMMIT_STORY_PREFIX}PandasAI showed us the compounding power of bringing AI capabilities to the libraries developers already live inside, turning existing ecosystems into launchpads for entirely new workflows.`,
    avatar: '/portfolio/pre-commit/pandasAI.png',
    folder: 'pre-commit',
  },
  {
    slug: 'mastra',
    company: 'Mastra',
    oneLiner: 'TypeScript AI agent framework',
    website: 'https://mastra.ai',
    github: 'https://github.com/mastra-ai/mastra',
    package: 'npm:@mastra/core',
    story: `${PRE_COMMIT_STORY_PREFIX}Mastra showed us how an opinionated open-source framework can define an entire category before it fully exists, and revealed the remarkable power of building community conviction through education and writing at scale.`,
    avatar: '/portfolio/pre-commit/mastra.png',
    folder: 'pre-commit',
  },
  {
    slug: 'better-auth',
    company: 'Better Auth',
    oneLiner: 'TypeScript authentication library',
    website: 'https://better-auth.com',
    github: 'https://github.com/better-auth/better-auth',
    package: 'npm:better-auth',
    story: `${PRE_COMMIT_STORY_PREFIX}Better Auth showed us how to reimagine a crowded category in a way that puts full ownership back in developers' hands. It also reminded us that open source knows no borders.`,
    avatar: '/portfolio/pre-commit/better-auth.png',
    folder: 'pre-commit',
  },
  {
    slug: 'graphcore',
    company: 'Graphcore',
    oneLiner: 'AI hardware and open toolchain',
    website: 'https://graphcore.ai',
    github: 'https://github.com/graphcore',
    story: `${PRE_COMMIT_STORY_PREFIX}Graphcore showed us that in AI infrastructure, the openness of the toolchain and the strength of the developer community matter as much as the hardware itself.`,
    avatar: '/portfolio/pre-commit/graphcore.png',
    folder: 'pre-commit',
  },
  {
    slug: 'uma',
    company: 'UMA',
    oneLiner: 'Intelligent robots that enhance quality of life for everyone',
    website: 'https://uma.bot',
    github: 'https://github.com/uma-robots',
    avatar: '/portfolio/uma.png',
    folder: 'active',
  },
  {
    slug: 'stealth-inference',
    company: 'Stealth',
    oneLiner: 'AI inference stack',
    avatar: '/portfolio/$img.png',
    folder: 'active',
  },
  {
    slug: 'stealth-specs',
    company: 'Stealth',
    oneLiner: 'Specifications framework',
    avatar: '/portfolio/$img.png',
    folder: 'active',
  },
] as const;

export const PRE_COMMIT_COMPANIES = PORTFOLIO.filter((c) => c.folder === 'pre-commit');
export const ACTIVE_COMPANIES = PORTFOLIO.filter((c) => c.folder === 'active');
