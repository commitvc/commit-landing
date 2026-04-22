export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  location: string;
  github: string;
  linkedin?: string;
  avatar: string;
};

export const TEAM: readonly TeamMember[] = [
  {
    slug: 'abel',
    name: 'Abel Samot',
    role: 'Partner',
    location: 'Paris, France 🇫🇷',
    github: 'https://github.com/abelsamot',
    linkedin: 'https://www.linkedin.com/in/abel-samot/',
    avatar: '/team/abel.png',
  },
  {
    slug: 'olivier',
    name: 'Olivier Huez',
    role: 'Partner',
    location: 'Geneva, Switzerland 🇨🇭',
    github: 'https://github.com/olivierhuez',
    linkedin: 'https://www.linkedin.com/in/olivierhuez/',
    avatar: '/team/olivier.png',
  },
  {
    slug: 'max',
    name: 'Max Corbani',
    role: 'Partner',
    location: 'Paris, France 🇫🇷',
    github: 'https://github.com/mxcrbn',
    linkedin: 'https://www.linkedin.com/in/mxcrbn/',
    avatar: '/team/max.png',
  },
  {
    slug: 'alessandro',
    name: 'Alessandro Ciffo',
    role: 'Tech Lead',
    location: 'Paris, France 🇫🇷',
    github: 'https://github.com/alessandro-ciffo',
    linkedin: 'https://www.linkedin.com/in/alessandro-ciffo-4b7710191/',
    avatar: '/team/alessandro.png',
  },
] as const;

export const ADVISORS_TEXT =
  '>commit is supported by a team of advisors who are passionate about open source. ' +
  "They're all founders or executives who built and scaled commercial open source companies, " +
  'or CTOs and technical leaders at Global 2000 enterprises.\n\n' +
  'Examples include: Mozilla, Supabase, Hugging Face, Sentry, Nginx, Cesium, Suse, Airbyte, ' +
  'Sonar, DBT Labs, MongoDB and many others.';
