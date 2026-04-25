## ADDED Requirements

### Requirement: AsciiLogo font-size scales to 12 px at viewports ≤ 480 px

The `.logo` rule in `components/ascii-logo/AsciiLogo.module.css` SHALL declare `font-size: 14px` (default desktop) and `font-size: 12px` inside `@media (max-width: 480px)`.

#### Scenario: desktop font-size is 14 px

- **WHEN** the viewport is wider than 480 px and the computed style of `.logo` is read
- **THEN** `font-size` resolves to `14px`

#### Scenario: phone font-size is 12 px

- **WHEN** the viewport is 480 px or narrower and the computed style of `.logo` is read
- **THEN** `font-size` resolves to `12px`

### Requirement: LOGO_ART renders without horizontal clipping down to 320 px viewports

The 40-character-wide `LOGO_ART` constant SHALL render fully visible on every viewport ≥ 320 px. The 12 px font-size rule above gives ~7.2 px per monospace character (approx ~288 px total width), which fits the ~296 px content area at a 320 px viewport with `.container { padding: 0 12px }`.

#### Scenario: full wordmark visible at 320 px

- **WHEN** the homepage or any detail page is rendered at 320 px viewport
- **THEN** the rightmost character of `LOGO_ART` is within the viewport (no horizontal scroll triggered by the logo, no clip-path cutting off the trailing stroke)

#### Scenario: full wordmark visible at 375 px

- **WHEN** the homepage or any detail page is rendered at 375 px viewport
- **THEN** the rightmost character of `LOGO_ART` is within the viewport with at least 16 px of right-padding clearance

### Requirement: The scaling rule applies to both WelcomeHeader and CompactHeader

The font-size rule SHALL live on the shared `.logo` class consumed by `<AsciiLogo>` so both surfaces — the homepage's `WelcomeHeader` (where the logo is the centerpiece on phones) and the `CompactHeader` (every detail page) — inherit the same scaling without per-surface duplication.

#### Scenario: CompactHeader logo also scales

- **WHEN** a detail page (`/about/`, `/blog/<slug>/`, etc.) is rendered at 480 px or narrower
- **THEN** the CompactHeader's logo font-size is 12 px (same scaling as the WelcomeHeader's mobile branch)
