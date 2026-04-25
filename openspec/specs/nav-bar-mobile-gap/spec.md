# nav-bar-mobile-gap Specification

## Purpose
TBD - created by archiving change add-mobile-responsive-chrome. Update Purpose after archive.
## Requirements
### Requirement: NavBar gap follows a three-step ladder by viewport width

The `.nav` element in `components/nav-bar/NavBar.module.css` SHALL declare three gap values:

- Desktop (no media query): `gap: 4rem`
- `@media (max-width: 640px)`: `gap: 2.25rem`
- `@media (max-width: 480px)`: `gap: 1.5rem`

`1.5rem` is the mobile floor — below this, the active-tab dashed indicator visually crowds adjacent labels.

#### Scenario: desktop gap is 4rem

- **WHEN** the viewport is wider than 640 px and the computed style of `.nav` is read
- **THEN** `gap` resolves to `64px` (4rem)

#### Scenario: tablet gap is 2.25rem

- **WHEN** the viewport is between 481 px and 640 px and the computed style of `.nav` is read
- **THEN** `gap` resolves to `36px` (2.25rem)

#### Scenario: phone gap is 1.5rem

- **WHEN** the viewport is 480 px or narrower and the computed style of `.nav` is read
- **THEN** `gap` resolves to `24px` (1.5rem)

### Requirement: All five nav tabs are reachable at every viewport from 320 px upward

The five tabs (`CLI`, `Companies`, `Blog`, `Team`, `About`) SHALL be reachable on every viewport ≥ 320 px. When the bar's intrinsic width exceeds the viewport, the existing `.scroller` (`overflow-x: auto`) handles horizontal scroll; this requirement constrains gap + padding so scroll is the only fallback (no clipping, no hidden tabs).

#### Scenario: all five tabs render at 320 px

- **WHEN** the viewport is 320 px and the rendered nav DOM is inspected
- **THEN** all five tab `<a>` elements exist in the DOM (some may be off-screen in the scroller, but none are conditionally omitted)

### Requirement: A right-edge fade indicates scrollable content at ≤ 640 px

When the gap ladder narrows but the bar can still overflow on small phones, the `.scroller` element SHALL apply a `mask-image` gradient that fades the right ~28 px to transparent. This serves as a visual swipe affordance.

#### Scenario: mask-image present at ≤ 640 px

- **WHEN** the viewport is 640 px or narrower and the computed style of `.scroller` is read
- **THEN** `mask-image` is `linear-gradient(to right, black 0px, black calc(100% - 28px), transparent 100%)` and `-webkit-mask-image` is the same value (Safari prefix)

#### Scenario: no mask above 640 px

- **WHEN** the viewport is wider than 640 px and the computed style of `.scroller` is read
- **THEN** `mask-image` is unset (`none`)

### Requirement: The `<container>::after` separator dash line is unaffected

The dashed separator below the nav bar SHALL render at full width on every viewport, unaffected by the scroller's mask. The `.scroller` is an inner wrapper inside `.container`; the `::after` pseudo-element on `.container` extends edge-to-edge with `left/right: -12px`.

#### Scenario: separator extends edge-to-edge on mobile

- **WHEN** the viewport is 320 px and the `::after` of `.container` is inspected
- **THEN** its background extends from `-12 px` to `100% + 12 px`, fully spanning the viewport

