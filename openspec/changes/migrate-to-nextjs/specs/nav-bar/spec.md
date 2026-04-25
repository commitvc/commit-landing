# Spec — nav-bar

## Purpose
Primary tab navigation: CLI / Companies / Blog / Team / About, with an
animated dashed indicator underneath the active tab.

## Requirements

- MUST render exactly 5 tabs in this order: CLI (`/`), Companies (`/companies`),
  Blog (`/blog`), Team (`/team`), About (`/about`).
- MUST use `next/link` for every tab (real `<a>` in the DOM), NOT `<span>`.
- MUST derive the active tab from `usePathname()`; `/cli` and `/` both
  highlight the CLI tab.
- MUST set `aria-current="page"` on the active tab's `<a>`.
- MUST NOT use `className="active"` as the sole signal — `aria-current` is
  the contract.
- MUST apply dimmed color (`--fg-muted`) to inactive tabs and full `--fg` to
  the active tab.
- MUST render a dashed separator line directly below the tab row that spans
  the full viewport width (matches legacy `.shared-nav-container::after`).
- MUST render a short dash indicator aligned under the active tab; indicator
  position MUST animate (transition) when the active tab changes.
- MUST respect `prefers-reduced-motion: reduce` — indicator snaps without transition.
- MUST reposition the indicator on viewport resize.
- SHOULD lazy-hydrate the indicator animation on the client; first paint
  without JS still shows a correctly-placed indicator (computed from the
  active tab's text width).

## Non-goals
- Mobile hamburger menu. Current layout is single-row and horizontally
  scrollable on small screens.
