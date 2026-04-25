# Spec — nav-bar

## Purpose
Primary tab navigation: CLI / Companies / Blog / Team / About, with an
animated dashed indicator underneath the active tab.

## ADDED Requirements

### Requirement: Render exactly 5 tabs in this order
MUST render exactly 5 tabs in this order: CLI (`/`), Companies (`/companies`), Blog (`/blog`), Team (`/team`), About (`/about`).

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST render exactly 5 tabs in this order: CLI (`/`), Companies (`/companies`), Blog (`/blog`), Team (`/team`), About (`/about`).

### Requirement: Use `next/link` for every tab (real `<a>` in the DOM), NOT `<span>`
MUST use `next/link` for every tab (real `<a>` in the DOM), NOT `<span>`.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST use `next/link` for every tab (real `<a>` in the DOM), NOT `<span>`.

### Requirement: Derive the active tab from `usePathname()`; `/cli` and `/` both highlight the
MUST derive the active tab from `usePathname()`; `/cli` and `/` both highlight the CLI tab.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST derive the active tab from `usePathname()`; `/cli` and `/` both highlight the CLI tab.

### Requirement: Set `aria-current="page"` on the active tab's `<a>`
MUST set `aria-current="page"` on the active tab's `<a>`.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST set `aria-current="page"` on the active tab's `<a>`.

### Requirement: Use `className="active"` as the sole signal — `aria-current` is the contract
MUST NOT use `className="active"` as the sole signal — `aria-current` is the contract.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST NOT use `className="active"` as the sole signal — `aria-current` is the contract.

### Requirement: Apply dimmed color (`--fg-muted`) to inactive tabs and full `--fg` to the
MUST apply dimmed color (`--fg-muted`) to inactive tabs and full `--fg` to the active tab.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST apply dimmed color (`--fg-muted`) to inactive tabs and full `--fg` to the active tab.

### Requirement: Render a dashed separator line directly below the tab row that spans
MUST render a dashed separator line directly below the tab row that spans the full viewport width (matches legacy `.shared-nav-container::after`).

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST render a dashed separator line directly below the tab row that spans the full viewport width (matches legacy `.shared-nav-container::after`).

### Requirement: Render a short dash indicator aligned under the active tab; indicator position
MUST render a short dash indicator aligned under the active tab; indicator position MUST animate (transition) when the active tab changes.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST render a short dash indicator aligned under the active tab; indicator position MUST animate (transition) when the active tab changes.

### Requirement: Respect `prefers-reduced-motion
MUST respect `prefers-reduced-motion: reduce` — indicator snaps without transition.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST respect `prefers-reduced-motion: reduce` — indicator snaps without transition.

### Requirement: Reposition the indicator on viewport resize
MUST reposition the indicator on viewport resize.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST reposition the indicator on viewport resize.

### Requirement: Lazy-hydrate the indicator animation on the client; first paint without JS still
The migration SHALL ensure: SHOULD lazy-hydrate the indicator animation on the client; first paint without JS still shows a correctly-placed indicator (computed from the active tab's text width).

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** SHOULD lazy-hydrate the indicator animation on the client; first paint without JS still shows a correctly-placed indicator (computed from the active tab's text width).

## Non-goals
- Mobile hamburger menu. Current layout is single-row and horizontally
  scrollable on small screens.
