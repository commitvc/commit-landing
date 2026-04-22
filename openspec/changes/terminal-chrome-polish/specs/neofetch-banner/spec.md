## ADDED Requirements

### Requirement: Highlights block uses a rules-only layout at every breakpoint
The "highlights" block immediately below the `commit` figlet logo — containing the Activity, Focus, Stage, and Github rows — SHALL be rendered with a single horizontal rule above and a single horizontal rule below the rows, and no side or corner borders. The same layout SHALL be used at every viewport width; there SHALL be no breakpoint-specific variants of the highlights block.

#### Scenario: Highlights render as rules-only on desktop
- **WHEN** the page loads at a viewport width of 1024px or greater
- **THEN** the highlights block shows the Activity, Focus, Stage, and Github rows with one horizontal rule above and one below, and no vertical borders or corner characters

#### Scenario: Highlights render identically on tablet
- **WHEN** the viewport is between 620px and 1024px
- **THEN** the highlights block shows the same layout as on desktop — same rules, same rows, no alternative markup

#### Scenario: Highlights render identically on mobile
- **WHEN** the viewport is narrower than 620px
- **THEN** the highlights block shows the same layout as on desktop and tablet

#### Scenario: No ASCII corner or vertical characters in the highlights
- **WHEN** any viewport width is rendered
- **THEN** the highlights block contains no `+`, `|`, `┌`, `┐`, `└`, `┘`, `│`, `╭`, `╮`, `╰`, `╯` characters as visual border elements

### Requirement: Horizontal rules are CSS-bordered, not literal dashes
Horizontal rules styled as `.neofetch-rule` — used for the highlights block, profile cards, and portfolio profile cards — SHALL be rendered as an empty element with a CSS `border-top` rule (`1px dashed`, color `rgba(200, 208, 242, 0.4)`). The tab bar separator beneath `.tab-nav-container` SHALL be rendered by a CSS `border-bottom` (or equivalent pseudo-element with a CSS border), NOT by a literal dash string clipped via `overflow: hidden`. Literal ASCII dash strings SHALL NOT be used as rule content anywhere on the page.

#### Scenario: Rule fits its container edge-to-edge at any width
- **WHEN** a `.neofetch-rule` element is rendered at any viewport width
- **THEN** the rule visually extends the full width of its container without being clipped or truncated, and without overflowing

#### Scenario: Rule appearance matches prior visual
- **WHEN** a `.neofetch-rule` renders
- **THEN** it appears as a dashed horizontal line in `rgba(200, 208, 242, 0.4)` with `6px` vertical margin above and below

#### Scenario: Rule element carries no textual content
- **WHEN** a `.neofetch-rule` element is in the DOM
- **THEN** its text content is empty — the rule is drawn purely via CSS border, not via dash characters in the markup

#### Scenario: Tab bar separator is edge-to-edge across navbar states
- **WHEN** the tab bar is rendered, whether the neofetch header is expanded or collapsed
- **THEN** the separator line beneath the tab bar extends to the viewport edges with the same width and alignment in both states, drawn via a CSS border with no literal dash content

### Requirement: Highlights layout is implemented in a single markup block
The highlights block SHALL be represented by a single block of markup, not by multiple breakpoint-specific variants shown and hidden via `display: none`.

#### Scenario: Only one highlights block exists in the DOM
- **WHEN** the page is inspected at any viewport width
- **THEN** there is exactly one highlights block in the DOM, with no sibling duplicates toggled by media queries

### Requirement: Content above the tab bar's dash line is pinned to the viewport top
The page SHALL be structured as three vertical zones: a pinned top zone, a scrollable middle zone, and a pinned bottom zone. The pinned top zone extends from the top of the page down to and including the tab bar's dash line. Everything in this zone SHALL stay fixed to the top of the viewport and never scroll with the page.

The contents of the pinned top zone depend on the navbar state:
- **Expanded (landing)**: figlet commit logo, description / highlights block, help text (`#cli-hint`), tab bar, dash line
- **Shrunk (after first tab click)**: small commit ASCII logo, tab bar, dash line

#### Scenario: Top zone stays pinned when the page is scrolled
- **WHEN** the user scrolls the page on the landing view
- **THEN** the figlet logo, highlights block, help text, tab bar, and dash line remain fixed at the top of the viewport; only content below the dash line moves

#### Scenario: Top zone stays pinned in the shrunk navbar state
- **WHEN** the user scrolls the page after the neofetch has collapsed (first tab click)
- **THEN** the small commit ASCII logo, tab bar, and dash line remain fixed at the top of the viewport; only content below the dash line moves

#### Scenario: Top zone transitions when navbar collapses
- **WHEN** the user clicks a tab for the first time and the neofetch collapses (expanded → shrunk)
- **THEN** the top zone's height changes following the existing `0.35s ease` transition on `.tab-nav-container`, and no new visual treatment (shadow, border change, color change) is introduced at the bottom edge of the top zone

### Requirement: Only the middle region scrolls
The region between the dash line (bottom of the pinned top zone) and the prompt (top of the pinned bottom zone) SHALL be the only scrollable region on the page. This region contains the CLI command history on the CLI tab, and the tree view plus any opened profile or portfolio card on the Portfolio / Team / About tabs.

#### Scenario: Middle region scrolls while both pinned zones stay fixed
- **WHEN** the user scrolls within the middle region (wheel, touch, or keyboard)
- **THEN** only the middle region's contents move; the top zone stays pinned at the top, and the prompt stays pinned at the bottom

#### Scenario: Same scroll behavior across all tabs
- **WHEN** the user is on any tab (CLI, Portfolio, Team, About) and scrolls
- **THEN** the three-zone pinning behavior is identical — top pinned, middle scrolls, prompt pinned

### Requirement: Prompt pinning and auto-scroll behavior are preserved
The existing prompt behavior SHALL be preserved without changes: the prompt input stays pinned to the viewport bottom; submitting a command auto-scrolls the middle region to its bottom; the `prompt-shadow` gradient fades in above the prompt when the middle region is not scrolled to the bottom.

#### Scenario: Prompt stays at the bottom
- **WHEN** the user scrolls the middle region upward
- **THEN** the prompt input remains pinned to the viewport bottom

#### Scenario: Submitting a command auto-scrolls to the bottom
- **WHEN** the user submits a command (Enter key) while the middle region is not scrolled to the bottom
- **THEN** the middle region auto-scrolls to the bottom so the latest output and prompt are visible

#### Scenario: Prompt shadow still triggers on scroll-up
- **WHEN** the middle region is scrolled away from its bottom
- **THEN** the `prompt-shadow` gradient fades in above the prompt, spanning the full viewport width, matching the existing `prompt-format` spec

### Requirement: No scroll-edge shadow on the top zone
The pinned top zone SHALL NOT have a shadow, border accent, or any other visual treatment at its bottom edge (below the dash line) when the middle region scrolls behind it. The dash line itself is the only visual marker of the boundary.

#### Scenario: Top zone stays plain while middle scrolls
- **WHEN** the middle region is scrolled to any position other than its top
- **THEN** the area immediately below the dash line shows no shadow, gradient, or additional border

### Requirement: Red River West button layers above the pinned top zone
The fixed "Part of Red River West" button (`.main-site-button`) SHALL remain on top of the pinned top zone at every viewport width and in both navbar states. The button keeps its existing `position: fixed; top: 20px; right: 20px; z-index: 1000` styling. The pinned top zone SHALL use a `z-index` strictly lower than `1000`.

#### Scenario: Button stays on top when the page scrolls
- **WHEN** the user scrolls the middle region
- **THEN** the Red River West button remains visible in the top-right corner, rendered above both the pinned top zone and any scrolled content

#### Scenario: Button stays on top in both navbar states
- **WHEN** the navbar is in its expanded state or its shrunk state
- **THEN** the Red River West button renders above the pinned top zone in both cases

#### Scenario: Pre-existing visual overlap with the figlet logo is accepted
- **WHEN** the navbar is expanded and the figlet logo extends into the upper-right region of the page
- **THEN** the Red River West button sits visually above the figlet's top-right edge (pre-existing behavior) — no additional layout separation is introduced by this change
