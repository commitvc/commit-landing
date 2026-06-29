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

// Mark Porter now lives in the team listing (lib/team.ts) and renders with the
// fuller team-detail template. No standalone advisor profiles at the moment;
// the generic advisor blurb still ships via the CLI file tree (advisors.txt).
export const ADVISORS: readonly Advisor[] = [] as const;
