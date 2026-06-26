export type Advisor = {
  slug: string;
  name: string;
  role: string;
  tagline?: string;
  focus?: string;
  location?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  avatar: string;
  description?: string;
  seoDescription?: string;
};

export const ADVISORS: readonly Advisor[] = [
  {
    slug: 'mark',
    name: 'Mark Porter',
    role: 'Technical advisor',
    tagline: 'Technical advisor',
    avatar: '/advisors/mark-porter.png',
    linkedin: 'https://www.linkedin.com/in/marklovestech/',
    description:
      'Mark advises >commit and its founders on deep tech, engineering culture and safe deployments. He has spent 30+ years building and leading technology organizations across databases, cloud, education and mobility, including as CTO at MongoDB, Grab and Amplify, and General Manager at AWS, where he helped operate some of the largest computer fleets in the world. Board member, advisor or investor at companies including GitLab, MongoDB, MariaDB and Splyt.',
    seoDescription:
      'Technical advisor to >commit. Former CTO at MongoDB, Grab and Amplify; ex-AWS GM; board member/advisor across GitLab, MongoDB, MariaDB and Splyt.',
  },
] as const;
