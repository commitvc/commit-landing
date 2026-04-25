# Spec — ascii-logo

## Purpose
Reusable component that renders the "commit" ASCII logo used in the nav header
and in the `neofetch` output. Single source of truth for the art.

## ADDED Requirements

### Requirement: Render the same 5-line ASCII block currently present in `index.html` (the `.red`
MUST render the same 5-line ASCII block currently present in `index.html` (the `.red` span under `.logo p`) and in `shared/nav.js`.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST render the same 5-line ASCII block currently present in `index.html` (the `.red` span under `.logo p`) and in `shared/nav.js`.

### Requirement: Wrap the art in an `<a>` when `href` is provided, or in
MUST wrap the art in an `<a>` when `href` is provided, or in a `<div>` otherwise.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST wrap the art in an `<a>` when `href` is provided, or in a `<div>` otherwise.

### Requirement: Apply `font-family
MUST apply `font-family: monospace; line-height: 1.2; color: var(--red);` via CSS Modules (not inline styles).

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST apply `font-family: monospace; line-height: 1.2; color: var(--red);` via CSS Modules (not inline styles).

### Requirement: Preserve exact character-for-character output — regression tested with a snapshot
MUST preserve exact character-for-character output — regression tested with a snapshot.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST preserve exact character-for-character output — regression tested with a snapshot.

### Requirement: Expose an `ariaLabel` prop (default `"commit"`) so screen readers announce a word
The migration SHALL ensure: SHOULD expose an `ariaLabel` prop (default `"commit"`) so screen readers announce a word, not ASCII noise.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** SHOULD expose an `ariaLabel` prop (default `"commit"`) so screen readers announce a word, not ASCII noise.

### Requirement: Inject markup via `dangerouslySetInnerHTML`; the art is a static string rendered as text in a `<pre>` or `<span>` with `white-space
MUST NOT inject markup via `dangerouslySetInnerHTML`; the art is a static string rendered as text in a `<pre>` or `<span>` with `white-space: pre`.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST NOT inject markup via `dangerouslySetInnerHTML`; the art is a static string rendered as text in a `<pre>` or `<span>` with `white-space: pre`.

## Non-goals
- Animated variants. Neofetch animation wraps `<AsciiLogo />` from the outside.
