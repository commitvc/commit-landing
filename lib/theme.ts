/**
 * Theme switching for the `theme` CLI command.
 *
 * There is no React state here on purpose. Every colour on the site resolves
 * through the custom properties in styles/globals.css, so flipping
 * `data-theme` on <html> repaints the whole page — no re-render, no context,
 * no provider. The only persistent state is the localStorage key, which the
 * inline bootstrap script in app/layout.tsx replays before first paint so a
 * reload doesn't flash the wrong theme.
 *
 * The same value is mirrored to a cookie under the same name, scoped to
 * `.commit.fund`. localStorage is per-origin, so insights.commit.fund can't
 * read ours; a cookie on the apex is the only channel the sibling subdomains
 * share. Both are written on every flip so either side can read either one.
 */

export type Theme = 'dark' | 'light';

/** Shared with the inline bootstrap script in app/layout.tsx, and used as the
 *  cookie name as well — keep all three in sync. */
export const THEME_STORAGE_KEY = 'commit-theme';

/** A year, in seconds. Long enough that the choice reads as permanent. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** How long the momentary global colour transition stays armed. Must match the
 *  220ms in the `[data-theme-transition]` rule in styles/globals.css. */
const TRANSITION_MS = 220;

/** The theme actually on screen: an explicit `data-theme` override if one is
 *  set, otherwise whatever the OS asks for. Dark is the default when the OS
 *  expresses no preference, matching the CSS. */
export function getEffectiveTheme(): Theme {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === 'light' || explicit === 'dark') return explicit;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/** Publish the choice to the cookie every *.commit.fund host can read.
 *  `domain` is only attached on the real site: browsers reject a
 *  `.commit.fund` cookie from localhost outright, which would leave dev with
 *  no cookie at all rather than a host-only one. */
function writeThemeCookie(theme: Theme): void {
  const { hostname, protocol } = window.location;
  const shared = hostname === 'commit.fund' || hostname.endsWith('.commit.fund');
  const domain = shared ? '; domain=.commit.fund' : '';
  const secure = protocol === 'https:' ? '; secure' : '';
  // biome-ignore lint/suspicious/noDocumentCookie: the Cookie Store API is async and unsupported in Safari; the bootstrap script reads this synchronously before first paint.
  document.cookie = `${THEME_STORAGE_KEY}=${theme}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax${domain}${secure}`;
}

/** Apply a theme, easing the colour change. The transition is armed only for
 *  the length of the flip — see the comment on the CSS rule for why it can't
 *  simply live on `*` permanently. */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;

  // Skip the easing entirely when the user has asked for reduced motion;
  // the CSS override already neutralises it, this just avoids the reflow.
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced) {
    root.dataset.themeTransition = '';
    window.setTimeout(() => {
      delete root.dataset.themeTransition;
    }, TRANSITION_MS);
  }

  root.dataset.theme = theme;

  // Private-mode Safari and storage-blocked contexts throw on write; the
  // theme still applies for this session, it just won't survive a reload.
  // Each sink gets its own try so a blocked localStorage doesn't cost us the
  // cookie (and the cross-subdomain hand-off) as well.
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* non-fatal */
  }
  try {
    writeThemeCookie(theme);
  } catch {
    /* non-fatal */
  }
}

/** Flip to the other theme and return the one now showing. */
export function toggleTheme(): Theme {
  const next: Theme = getEffectiveTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}
