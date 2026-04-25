## Why

The site's chrome — RRW banner + ASCII logo + tab nav + boot animation + neofetch card — was designed for desktop and broke on phones in two distinct ways. (1) The tab nav contains 5 tabs (`CLI Companies Blog Team About`) that need ~422 px to fit at the existing `4rem` desktop gap; below ~640 px the gap dropped to `2.25rem` (still ~479 px) and the bar overflowed off the right edge with the `About` tab pushed offscreen. The `.scroller` overflow already let users swipe to reveal it, but discoverability was nil. (2) The ASCII LOGO_ART is 40 chars wide; at the desktop `14px` font-size (~8.4 px/char) it's ~336 px, which clipped the right edge of the wordmark on viewports ≤ 375 px and clipped both edges on iPhone-SE-class devices.

On the homepage specifically, the `WelcomeHeader` ran a multi-second staged-reveal animation (boot log → `>neofetch` echo → Neofetch card with two-column data → tagline → NavBar) that pushed the actual content well below the fold on a 812 px viewport — about 22% of the vertical viewport was chrome before any UX appeared. The animation was enjoyable on desktop and unbearable on a phone.

This change ships a tighter mobile experience without losing the CLI aesthetic on desktop: phones get a no-animation WelcomeHeader (ASCII logo + neofetch data inline + tagline + nav, all at first paint), a tighter NavBar gap ladder, a fade-out indicator on the scrollable nav so the swipe affordance is visible, and a smaller ASCII font that fits 320 px without clipping.

## What Changes

- **Mobile branch in `WelcomeHeader.tsx`**: a new `useIsMobile()` hook (SSR-safe matchMedia on `(max-width: 480px)`) selects between a `MobileWelcomeHeader` (renders ASCII + Neofetch data + tagline + NavBar at first paint, no boot animation, no `>neofetch` PromptEcho) and the existing `DesktopWelcomeHeader` (full staged reveal). The phase-machine logic is moved into `DesktopWelcomeHeader` unchanged.
- **NavBar gap ladder**: `4rem` desktop → `2.25rem` at `≤640px` (existing) → `1.5rem` at `≤480px` (new). The 1.5rem is the floor; below it the active-tab dashed indicator starts crowding adjacent labels.
- **NavBar scroll-fade**: `mask-image: linear-gradient(to right, black 0, black calc(100% - 28px), transparent 100%)` applied to `.scroller` at `≤640px`. Always-on at this breakpoint — the gradient sits over background when scrolled to the end, harmless.
- **ASCII logo scaling**: `font-size: 12px` at `≤480px` so the 40-char wordmark fits the available width on iPhone-SE-class viewports (320 px). Applies to both the `WelcomeHeader` (where the logo is the centerpiece on phones) and the `CompactHeader` (every detail page).

## Capabilities

### New Capabilities

- `mobile-welcome-header`: the JS-detected mobile branch on the homepage and its first-paint behaviour.
- `nav-bar-mobile-gap`: the three-step gap ladder (`4rem → 2.25rem → 1.5rem`) and the scroll-fade indicator.
- `ascii-logo-mobile-scaling`: font-size scaling rules so LOGO_ART fits down to 320 px viewports.
