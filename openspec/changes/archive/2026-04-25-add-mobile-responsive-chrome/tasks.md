## 1. useIsMobile hook

- [x] 1.1 Define `useIsMobile()` in `components/welcome-header/WelcomeHeader.tsx` (or as a shared hook if reused)
- [x] 1.2 SSR-safe: initial state `false`, flips on first client effect via `matchMedia('(max-width: 480px)')`
- [x] 1.3 Subscribe to `change` event so live resize across the breakpoint flips the variant

## 2. Mobile WelcomeHeader branch

- [x] 2.1 Extract existing phase-machine logic into a `DesktopWelcomeHeader` function
- [x] 2.2 Add `MobileWelcomeHeader` function: AsciiLogo + NeofetchData + tagline + NavBar, all rendered at first paint
- [x] 2.3 Mobile branch fires `onReady` immediately on mount (CLI below enables prompt without waiting for animation)
- [x] 2.4 Wrapper exports `WelcomeHeader` that picks branch via `useIsMobile()`
- [x] 2.5 Add `.mobile` and `.mobileLogo` rules to `WelcomeHeader.module.css`

## 3. NavBar gap ladder + scroll fade

- [x] 3.1 Add `@media (max-width: 480px) { .nav { gap: 1.5rem } }` to `NavBar.module.css`
- [x] 3.2 Add `mask-image` (with `-webkit-mask-image` prefix) to `.scroller` at `@media (max-width: 640px)`
- [x] 3.3 Verify on 320, 375, 480, 481, 640 px viewports — no clipping, fade present at ≤640, all 5 tabs reachable

## 4. AsciiLogo scaling

- [x] 4.1 Add `@media (max-width: 480px) { .logo { font-size: 12px } }` to `AsciiLogo.module.css`
- [x] 4.2 Verify on 320 px viewport: LOGO_ART renders without clipping (~288 px in ~296 px content area)
- [x] 4.3 Verify CompactHeader detail pages also benefit (same `.logo` class)

## 5. Verification

- [x] 5.1 `pnpm typecheck` clean
- [x] 5.2 `pnpm exec biome check` clean on touched files
- [x] 5.3 Manual visual test on 320, 375, 480, 481 px viewports
- [x] 5.4 `pnpm build` produces a clean static export with the mobile rules in CSS
