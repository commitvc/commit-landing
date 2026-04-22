# Spec — ascii-logo

## Purpose
Reusable component that renders the "commit" ASCII logo used in the nav header
and in the `neofetch` output. Single source of truth for the art.

## Requirements

- MUST render the same 5-line ASCII block currently present in `index.html`
  (the `.red` span under `.logo p`) and in `shared/nav.js`.
- MUST wrap the art in an `<a>` when `href` is provided, or in a `<div>` otherwise.
- MUST apply `font-family: monospace; line-height: 1.2; color: var(--red);`
  via CSS Modules (not inline styles).
- MUST preserve exact character-for-character output — regression tested with
  a snapshot.
- SHOULD expose an `ariaLabel` prop (default `"commit"`) so screen readers
  announce a word, not ASCII noise.
- MUST NOT inject markup via `dangerouslySetInnerHTML`; the art is a static
  string rendered as text in a `<pre>` or `<span>` with `white-space: pre`.

## Non-goals
- Animated variants. Neofetch animation wraps `<AsciiLogo />` from the outside.
