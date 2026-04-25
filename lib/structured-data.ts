/**
 * JSON-LD helpers. Centralised so every page emits the same canonical
 * shape and so the output stays in sync with the data in `lib/`.
 *
 * All emitters return plain objects — render them with:
 *   <script type="application/ld+json"
 *           dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }} />
 *
 * AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.)
 * pick up structured data without executing JavaScript, which is why this
 * lives in server components.
 */
import { ACTIVE_COMPANIES, COMPANIES, PRE_COMMIT_COMPANIES } from './companies';
import { TEAM } from './team';

export const SITE_URL = 'https://commit.fund';

type JsonLd = Record<string, unknown>;

/** Stable @id for the Organization across the site, so cross-references
 *  (Article.publisher, Person.worksFor, etc.) resolve to one node. */
export const ORG_ID = `${SITE_URL}/#org`;

/** Reusable ImageObject for `publisher.logo` on Article schemas. Google
 *  requires `publisher.logo` to be an ImageObject (not a string) for
 *  Article rich results. The favicon is 512x512 — well above the 112x112
 *  minimum Google enforces for AMP-era Article markup, which is the same
 *  shape AI extractors look for. */
export const LOGO_IMAGE = {
  '@type': 'ImageObject',
  url: `${SITE_URL}/favicon.jpeg`,
  width: 512,
  height: 512,
} as const;

/** Resolves a free-text author name from blog frontmatter to the
 *  matching team-member URL. Returns `null` if the author is not on
 *  the current team (e.g. a guest writer). */
export function teamMemberUrlByName(name: string): string | null {
  const match = TEAM.find((m) => m.name.toLowerCase() === name.toLowerCase());
  return match ? `${SITE_URL}/team/${match.slug}/` : null;
}

export const organizationJsonLd: JsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORG_ID,
  // The fund's canonical name is ">commit" (with the leading angle bracket).
  // We also list the variants AI tokenizers will collapse it to so the
  // entity stays recognisable across query phrasings.
  name: '>commit',
  alternateName: ['commit', 'commit fund', 'commit VC'],
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/favicon.jpeg`,
    width: 512,
    height: 512,
  },
  description:
    'Early-stage venture capital fund backing commercial open-source startups at pre-seed and seed.',
  email: 'hey@commit.fund',
  foundingLocation: {
    '@type': 'Place',
    name: 'Paris, France',
  },
  parentOrganization: {
    '@type': 'Organization',
    name: 'Red River West',
    url: 'https://redriverwest.com',
  },
  sameAs: [
    'https://github.com/commitvc',
    'https://www.linkedin.com/company/commitvc/',
    'https://x.com/commitvc',
    'https://redriverwest.com',
    'https://www.linkedin.com/company/red-river-west/',
    'https://www.crunchbase.com/organization/red-river-west',
  ],
};

/** A WebSite node enables sitelinks search box rendering in some AI surfaces
 *  and is a common entity-graph anchor. */
export const websiteJsonLd: JsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: '>commit',
  alternateName: 'commit',
  publisher: { '@id': ORG_ID },
  inLanguage: 'en',
};

type BreadcrumbCrumb = { name: string; url: string };

export function breadcrumbJsonLd(crumbs: readonly BreadcrumbCrumb[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url.startsWith('http') ? c.url : `${SITE_URL}${c.url}`,
    })),
  };
}

type ItemListItem = { name: string; url: string; description?: string };

export function itemListJsonLd(name: string, items: readonly ItemListItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: it.url.startsWith('http') ? it.url : `${SITE_URL}${it.url}`,
      name: it.name,
      ...(it.description ? { description: it.description } : {}),
    })),
  };
}

/** ItemList of every team member, for /team/. */
export function teamItemList(): JsonLd {
  return itemListJsonLd(
    '>commit team',
    TEAM.map((m) => ({
      name: `${m.name} — ${m.role}`,
      url: `/team/${m.slug}/`,
      description: m.description,
    })),
  );
}

/** ItemList of all portfolio companies, for /companies/. We split the URLs
 *  by folder so /pre-commit/<slug>/ vs /<slug>/ stays accurate. */
export function companiesItemList(): JsonLd {
  return itemListJsonLd(
    '>commit portfolio',
    COMPANIES.map((c) => ({
      name: `${c.company} — ${c.oneLiner}`,
      url: c.folder === 'active' ? `/companies/${c.slug}/` : `/companies/pre-commit/${c.slug}/`,
      description: c.about,
    })),
  );
}

/** Two distinct ItemLists for active vs pre-commit. Use these instead of
 *  `companiesItemList()` if you want AI to clearly separate the two.
 *
 *  Stealth investments are omitted — they're real Fund I commitments but
 *  we don't broadcast them to AI knowledge graphs as entities until launch.
 *  Their detail pages still ship (with no Organization JSON-LD) so direct
 *  visitors hit the redacted card. */
export function activeCompaniesItemList(): JsonLd {
  return itemListJsonLd(
    '>commit Fund I portfolio',
    ACTIVE_COMPANIES.filter((c) => !c.stealth).map((c) => ({
      name: `${c.company} — ${c.oneLiner}`,
      url: `/companies/${c.slug}/`,
      description: c.about,
    })),
  );
}

export function preCommitCompaniesItemList(): JsonLd {
  return itemListJsonLd(
    'Companies the >commit team backed before the fund',
    PRE_COMMIT_COMPANIES.map((c) => ({
      name: `${c.company} — ${c.oneLiner}`,
      url: `/companies/pre-commit/${c.slug}/`,
      description: c.about,
    })),
  );
}
