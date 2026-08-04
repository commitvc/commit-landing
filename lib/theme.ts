/**
 * Theme switching for the `theme` CLI command.
 *
 * There is no React state here on purpose. Every colour on the site resolves
 * through the custom properties in styles/globals.css, so flipping
 * `data-theme` on <html> repaints the whole page — no re-render, no context,
 * no provider. The only persistent state is the localStorage key, which the
 * inline bootstrap script in app/layout.tsx replays before first paint so a
 * reload doesn't flash the wrong theme.
 */

export type Theme = 'dark' | 'light';

/** Shared with the inline bootstrap script in app/layout.tsx — keep in sync. */
export const THEME_STORAGE_KEY = 'commit-theme';

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
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
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
