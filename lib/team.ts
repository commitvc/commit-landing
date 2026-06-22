export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  tagline?: string;
  focus?: string;
  languages?: string;
  location: string;
  github: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  avatar: string;
  /** Long-form bio — rendered in the page body and the Person JSON-LD's
   *  `description`. Often 400-600 chars; can include hobbies + life context. */
  description?: string;
  /** Short, SERP/social-friendly (~120 chars) — used as `<meta name=
   *  "description">` and `og:description` on the team-detail page. Falls
   *  back to `description` if absent, but `description` is too long for
   *  SERPs and gets mid-sentence-truncated by Google. Keep this tight,
   *  punchy, credibility-first; no hobbies. */
  seoDescription?: string;
};

export const TEAM: readonly TeamMember[] = [
  {
    slug: 'abel',
    name: 'Abel Samot',
    role: 'Partner',
    focus: 'Data · AI · Robotics',
    languages: 'Python · SQL',
    location: 'Paris, France 🇫🇷',
    github: 'https://github.com/abelsamot',
    linkedin: 'https://www.linkedin.com/in/abel-samot/',
    twitter: 'https://x.com/abel_samot',
    avatar: '/team/Abel.png',
    description:
      "Abel is a founding partner at >commit. He started coding and building projects at a young age, before becoming an AI engineer deploying deep learning models (BERT, etc.) in large enterprises. He later spent six years at Red River West investing in infrastructure software, while building the data team and the firm's data platform. He holds engineering and business degrees. A music lover, pianist and DJ in his spare time, as well as a cooking and running enthusiast, his passion for new technologies is matched by a deep interest in history.",
    seoDescription:
      "Partner at >commit. Built RAMP — Red River West's open-source sourcing brain — from scratch. ISEP engineer; ESSEC Master's.",
  },
  {
    slug: 'olivier',
    name: 'Olivier Huez',
    role: 'Partner',
    focus: 'Hardware · Cybersecurity · AI',
    languages: 'Java · Javascript',
    location: 'Geneva, Switzerland 🇨🇭',
    github: 'https://github.com/olivierhuez',
    linkedin: 'https://www.linkedin.com/in/olivierhuez/',
    twitter: 'https://x.com/olivierhuez',
    avatar: '/team/olivier.png',
    description:
      "Olivier is part of >commit's founding team. Spent a decade at Orange and then as CFO of two startups before crossing to venture, where he co-founded C4 Ventures and backed companies like Graphcore, Riskified and Via (the last two IPO'd on NYSE). General Partner at Red River West. Polytechnique Engineer who grabbed an accountancy degree along the way (confuses people at times). French and British, lived in Pretoria, Washington DC and London, now sharing his time between Geneva and Paris. Plays the saxophone in a band. Black belt in Judo, the dojo hasn't seen him in a while, world traveler.",
    seoDescription:
      "Partner at >commit. Co-founded C4 Ventures; backed Graphcore, Riskified, and Via — the last two IPO'd on NYSE.",
  },
  {
    slug: 'max',
    name: 'Max Corbani',
    role: 'Partner',
    focus: 'DevTools · Infrastructure · AI',
    languages: 'TypeScript · Rust',
    location: 'Paris, France 🇫🇷',
    github: 'https://github.com/mxcrbn',
    linkedin: 'https://www.linkedin.com/in/mxcrbn/',
    twitter: 'https://x.com/mxcrbn',
    website: 'https://mxcrbn.com',
    avatar: '/team/max.png',
    description:
      "Max is part of >commit's founding team, after years on both sides of the table. He started Symolia, then Dashblock, a browser agent he took through Y Combinator (S19), before joining the VC world to back OSS and infra founders between Europe and the US. Graduated in civil engineering, though tech had him hooked long before the diploma did. He's lived in Brazil, the US, Hungary, and France. Climbs and plays handpan in theory. In practice, survives three kids.",
    seoDescription:
      'Partner at >commit. Founded Dashblock (Y Combinator S19, browser agents). Backs open-source and infrastructure founders.',
  },
  {
    slug: 'alessandro',
    name: 'Alessandro Ciffo',
    role: 'Tech Lead',
    focus: 'Data · AI · Infra',
    languages: 'Python · TypeScript',
    location: 'Paris, France 🇫🇷',
    github: 'https://github.com/alessandro-ciffo',
    linkedin: 'https://www.linkedin.com/in/alessandro-ciffo-4b7710191/',
    website: 'https://aleciffo.com',
    avatar: '/team/alessandro.png',
    description:
      "Alessandro leads tech at >commit, building the data and AI tools behind the fund data pillar. Started in research at Bocconi's data-science lab, detoured through Amazon and co-founded Casify, an ML platform for Italian real-estate investors. Italian in Paris. Produces music, reads, and does calisthenics. Bouldering and running semi marathons on the side.",
    seoDescription:
      'Tech lead at >commit. Builds the data and AI platform behind the fund. Bocconi research, ex-Amazon, co-founded Casify.',
  },
  {
    slug: 'thomas',
    name: 'Thomas Saudemont',
    role: 'Data Engineer',
    focus: '',
    languages: '',
    location: 'Paris, France 🇫🇷',
    github: 'https://github.com/0xthomass',
    linkedin: 'https://www.linkedin.com/in/thomas-saudemont/',
    avatar: '/team/thomas.png',
    description: '',
    seoDescription: '',
  },
] as const;

export const ADVISORS_TEXT =
  '>commit is supported by a team of advisors who are passionate about open source. ' +
  "They're all founders or executives who built and scaled commercial open source companies, " +
  'or CTOs and technical leaders at Global 2000 enterprises.\n\n' +
  'Examples include: Mozilla, Supabase, Hugging Face, Sentry, Nginx, Cesium, Suse, Airbyte, ' +
  'Sonar, DBT Labs, MongoDB and many others.';
