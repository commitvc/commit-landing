## Context

The pre-existing `WelcomeHeader` is a `'use client'` component running a phase machine: `boot → welcome-neofetch → welcome-tagline → welcome-nav → ready`, with each transition gated by a `setTimeout(450ms)` (or 0 ms with `prefers-reduced-motion`). Total cold-start time on the homepage was ~1.4 seconds before the NavBar appeared, plus the boot typewriter animation on top.

That timing was chosen for a desktop visitor watching the screen on first load. On a phone, with the NavBar overflowing offscreen and the boot text consuming most of the vertical viewport, the same animation reads as "the site is broken / loading". Plus the SSR'd HTML for crawlers (covered separately in the GEO-optimisation change) carries the real content; the boot is purely flavour.

The CompactHeader (used on every detail page — `/cli/`, `/about/`, `/blog/<x>`, etc.) doesn't run an animation but uses the same `AsciiLogo` and `NavBar`. Whatever fixes apply to those two components apply on detail pages for free.

## Goals / Non-Goals

**Goals**

1. On phones, the homepage paints content immediately — no animation, no setTimeout chain.
2. The full ASCII wordmark renders without clipping down to 320 px viewports.
3. All five nav tabs are reachable on every viewport. Where they don't fit at once, the swipe affordance is visually signalled.
4. Desktop behaviour is unchanged — the boot animation, Neofetch data column, and staged reveal remain at viewports above 480 px.

**Non-Goals**

- Hamburger / collapsing nav. The horizontal-scroll fallback works, doesn't fight the CLI aesthetic, and doesn't introduce a state machine.
- Per-route mobile redesigns. The chrome is the chrome on every page; if the chrome works, the page works.
- Touch-specific gestures (long-press, pinch, etc.). Out of scope.
- Dynamic Hide/Show on scroll. Sticky behaviour stays as-is.

## Decisions

### Decision 1: JS-detected mobile branch, not pure CSS

`WelcomeHeader.tsx` exports a wrapper that runs `useIsMobile()` (a `useState(false)` defaulted on the server, flipped during the first client effect via `matchMedia('(max-width: 480px)')`). If `isMobile`, render `MobileWelcomeHeader`; else `DesktopWelcomeHeader`.

**Why JS, not CSS**: the desktop branch contains a `setTimeout` chain (`useEffect`) that runs phase transitions. Hiding it with CSS still mounts the component and runs the timers. JS branching mounts only one variant — phones never schedule animation timers, never run BootAnimation logic.

**SSR-safety**: `useState(false)` on the server, `useEffect` on the client. SSG'd HTML matches the desktop variant; phones see a brief flash (the desktop variant's first paint is empty — boot typewriter hasn't typed yet) and swap within ~16 ms.

**Trade-off**: a one-frame flash on first paint on phones. Acceptable because (a) the desktop variant's first frame has nothing visible (BootAnimation phase 0 is empty), so the flash reads as instant, and (b) the alternative (rendering both, hiding one with CSS) wastes timer scheduling and can occasionally produce visual glitches when timers fire after unmount.

### Decision 2: Three-step gap ladder, not a single jump

The NavBar already had `4rem` (desktop) → `2.25rem` at `≤640 px`. Adding a third step at `≤480 px` (`1.5rem`) gives a smooth taper rather than a jarring jump from desktop to phone.

**Why three steps**: 5 tabs at `1.5rem` need ~431 px (text + gap + padding). Just over a 480 px viewport's content width (after `.container` `padding: 0 12px`) — fits exactly with no scroll. At 375 px it overflows by ~80 px (scrolls). At 640 px tablet it would feel cramped at `1.5rem` — so the intermediate `2.25rem` step keeps tablets comfortable.

**Below 1.5rem is the floor**: the active-tab `>` prefix indicator (red, ~14 px wide) starts visually crowding adjacent labels at 1.25rem.

### Decision 3: Mask-image scroll fade, always-on at ≤640 px

The `.scroller` (already an `overflow-x: auto` container) gets `mask-image: linear-gradient(to right, black 0, black calc(100% - 28px), transparent 100%)` at `≤640 px`. The fade is always-on at this breakpoint, not gated on scroll position.

**Why always-on**: detecting "is content scrolled to the end" requires JS scroll listeners or experimental CSS scroll-state queries (very new, low support). The trade-off is that when a user has scrolled to reveal `About`, the right-edge fade still applies — but the fade sits over the page background at that point, not over a tab edge, so it's harmless.

**Why a 28 px fade width**: roughly half a character at the desktop font-size — wide enough to read as "fading off" but narrow enough that the half-visible tab still reads clearly. Tested at 320 px, 375 px, 480 px, 640 px.

### Decision 4: ASCII logo scales to 12 px at ≤480 px

LOGO_ART is 40 chars wide. At the desktop `14 px` font-size with monospace ~0.6em char width (~8.4 px), it's ~336 px wide. The `.container` padding of `0 12 px` gives a 320 px viewport ~296 px of content width, so 14 px clips by ~40 px on the right.

Dropping to `12 px` (~7.2 px/char) brings it to ~288 px — fits 320 px viewport with 8 px to spare.

**Why apply at ≤480 px and not ≤375 px**: keeps the rule simple. On 481 px the logo at 14 px (~336 px) fits the 457-px content area comfortably. On 480 px (~336 px in 456 px area) it also fits. Below 480 px it starts being tight; the 12 px floor pre-empts that. Visitors won't notice the size step on the breakpoint boundary.

**Both surfaces**: the rule lives on `.logo` in `AsciiLogo.module.css` so both `WelcomeHeader` (Neofetch slot) and `CompactHeader` (detail pages) inherit it.

## Risks / Trade-offs

- **First-paint flash on phones**: as noted, brief and visually empty. If users complain, an alternate approach is to render both branches with CSS visibility flips; the cost is wasted timer scheduling that doesn't fire animations the user can see.
- **`useIsMobile` is a client-only hook**: the brief desktop-then-mobile swap is observable in the React DevTools timeline. Real users won't notice but tooling does.
- **Mask-image polyfill**: WebKit needs `-webkit-mask-image`. The CSS uses both prefixes so Safari renders correctly.
- **Active-tab indicator at 1.5rem gap**: tested visually at 320 px, 375 px, 480 px. The dashed indicator under `Companies` (the longest tab) sits with ~6 px of breathing room from the next label. Tighter and it crowds; this is the floor.

## Migration Plan

Retroactive — code already shipped. After the change applies, the three new capability specs land in `openspec/specs/`. The pre-existing `tab-navigation` change (in-progress, 28/38 tasks complete) defines the desktop NavBar; this change adds the mobile rules without modifying that capability. If `tab-navigation` later proposes additional mobile rules, a future amendment can reconcile.

## Open Questions

1. Is there a desire to ship a per-route mobile design pass (e.g., the long blog posts' typography on phones), or does this change cover what's needed for now?
2. Should the `>neofetch` echo line and BootAnimation appear at `prefers-reduced-motion: reduce` on phones too? Currently the mobile branch skips them regardless. The reduce flag only collapses animation timing on desktop.
