# mobile-welcome-header Specification

## Purpose
TBD - created by archiving change add-mobile-responsive-chrome. Update Purpose after archive.
## Requirements
### Requirement: The homepage WelcomeHeader detects phones via `matchMedia('(max-width: 480px)')` and renders a phone-specific variant

`components/welcome-header/WelcomeHeader.tsx` SHALL export a wrapper component that uses an SSR-safe `useIsMobile()` hook (initial state `false`, flipped via `useEffect` + `matchMedia`) to choose between two render branches: `MobileWelcomeHeader` when matched, `DesktopWelcomeHeader` otherwise.

#### Scenario: SSR matches the desktop branch

- **WHEN** the homepage is server-rendered (build time or first byte)
- **THEN** the rendered HTML matches the `DesktopWelcomeHeader` output (since `useIsMobile()` returns `false` until the client effect runs)

#### Scenario: client swaps to mobile after hydration on phones

- **WHEN** a viewport with width ≤ 480 px hydrates the page
- **THEN** within the first client render after `useEffect`, the `MobileWelcomeHeader` branch is rendered

#### Scenario: live resize across the breakpoint flips the variant

- **WHEN** the viewport is resized from 600 px to 400 px (or vice-versa) on a live page
- **THEN** the `change` listener on the `MediaQueryList` fires and the variant swaps without a page reload

### Requirement: MobileWelcomeHeader renders ASCII + Neofetch data + tagline + NavBar at first paint with no animation

The mobile branch SHALL render all four elements immediately on mount: `<AsciiLogo>`, `<NeofetchData>`, the tagline `<p>`, and `<NavBar>`. It SHALL NOT mount `BootAnimation` or `PromptEcho`, and SHALL NOT schedule any `setTimeout` for staged reveals.

#### Scenario: mobile branch contains no BootAnimation

- **WHEN** the rendered tree of `MobileWelcomeHeader` is inspected
- **THEN** there is no `BootAnimation` instance and no `>neofetch` `PromptEcho` line

#### Scenario: mobile branch fires onReady immediately

- **WHEN** `MobileWelcomeHeader` mounts
- **THEN** the `onReady` prop callback is invoked synchronously in a `useEffect` with no timer delay

### Requirement: DesktopWelcomeHeader preserves the phase machine

Above 480 px, the existing staged-reveal behaviour SHALL be unchanged: `boot → welcome-neofetch → welcome-tagline → welcome-nav → ready`, with `setTimeout(450 ms)` between phases (or `0` ms when `prefers-reduced-motion: reduce`). The `BootAnimation` and `PromptEcho cwd="/" line="neofetch"` render only on the desktop branch.

#### Scenario: desktop runs the phase machine

- **WHEN** a viewport with width > 480 px renders the homepage
- **THEN** the BootAnimation appears first; after it completes, the `>neofetch` echo line appears, followed by the Neofetch card, then the tagline, then the NavBar — in that staggered order

#### Scenario: prefers-reduced-motion collapses delays

- **WHEN** the user's OS has reduce-motion enabled and the desktop branch renders
- **THEN** the inter-phase delays are 0 ms (everything reveals instantly, but the staging order is still respected)

### Requirement: skipBoot prop bypasses the phase machine on desktop

The `skipBoot` prop (set by `LandingShell` when the user toggles header via the `header` command) SHALL cause `DesktopWelcomeHeader` to mount with `phase = 'ready'` and fire `onReady` immediately. The mobile branch ignores `skipBoot` (it has no boot to skip).

#### Scenario: skipBoot fires onReady on mount

- **WHEN** `WelcomeHeader` is mounted with `skipBoot: true`
- **THEN** `onReady` is invoked in a `useEffect` synchronously, regardless of branch

