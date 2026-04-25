## 1. Highlights — HTML

- [x] 1.1 In `index.html:44-72`, replace the three `<pre class="ascii-box *">` variants and the `.ascii-box-mobile` wrapper with a single block: one `<span class="neofetch-rule"></span>` above, one below, and the Activity / Focus / Stage / Github rows between them — no `+`, `-`, or `|` border characters
- [x] 1.2 Keep the existing `class="yellow"` labels and `class="blue"` link styling on the four rows unchanged

## 2. Rules — CSS swap

- [x] 2.1 In `index.html:1930-1936`, rewrite `.neofetch-rule`: drop `white-space: nowrap` and `overflow: hidden`; add `border-top: 1px dashed rgba(200, 208, 242, 0.4)`; keep `display: block`, the color, and `margin: 6px 0`
- [x] 2.2 Remove the literal dash strings from every `<span class="neofetch-rule">…</span>` on the page — the span is now empty: lines ~66, ~71 (highlights mobile, now gone after §1), ~103, ~108 (profile card), ~155, ~160 (portfolio profile card)
- [x] 2.3 Apply the same CSS-border swap to the tab bar separator at `index.html:1848-1861`: drop the 240-char `content: '-----…'` string, `white-space: nowrap`, and `overflow: hidden`; replace with a `border-bottom: 1px dashed rgba(200, 208, 242, 0.3)` on `.tab-nav-container` (or equivalent pseudo-element with a CSS border), preserving the existing full-viewport-width behavior (`left: -12px; right: -12px` or equivalent)
- [x] 2.4 Verify the tab separator stays edge-to-edge and aligned across both the expanded (neofetch visible) and collapsed (neofetch hidden) navbar states — this supersedes the prior `tab-navigation` backlog item on tab-dash width consistency

## 3. Highlights — CSS cleanup

- [x] 3.1 Delete `.ascii-box`, `.ascii-box-wide`, `.ascii-box-narrow`, `.ascii-box-mobile` rules and their media queries (`index.html:1678-1700`)
- [x] 3.2 Verify no other selectors reference `.ascii-box*` anywhere in the file

## 4. Prompt — `formatPrompt` helper

- [x] 4.1 In `index.html:897-899`, update `formatPrompt(path)` to prepend `<span class="red">user@commit.fund</span> ` (red host, single space, no colon) before the existing `>` or `<path> >`
- [x] 4.2 Confirm the three existing callsites — `index.html:1246` (live input), `index.html:1397` (stdout echo), `index.html:1407` (stderr echo) — render correctly without further change

## 5. Prompt — boot echo

- [x] 5.1 In `index.html:1085`, replace the hardcoded `>neofetch` string with `${formatPrompt("/")}neofetch` so the boot echo picks up the host prefix via the helper
- [x] 5.2 Verify the initial page render shows `user@commit.fund >neofetch` (red prefix, default-color `>`, no space between `>` and `neofetch`, matching the existing "no space after `>`" rule from `prompt-format`)

## 6. Sticky layout — top zone pinned, middle scrolls

- [x] 6.1 Restructure the layout so the region from the top of the page down through the tab bar's dash line is pinned to the viewport top (never scrolls). This region contains — in expanded state: figlet commit logo, description/highlights block, help text (`#cli-hint` at `index.html:1088`), tab bar, dash line. In shrunk state: small commit ASCII logo, tab bar, dash line. Either wrap these in a `position: sticky; top: 0` container, OR reorganise to use a `position: fixed` top zone + compensating top padding on the scroll container — pick whichever plays nicest with the existing `#terminal-output` overflow rules at `index.html:1708`
- [x] 6.2 Make the middle region (everything below the dash line and above the prompt) the only scrollable area. On the CLI tab this is the command history; on Portfolio / Team / About tabs this is the tree view and any opened card. Size it as `flex: 1` (or `height: calc(100vh - <top-zone-height> - <prompt-height>)`) so it fills the space between the two pinned zones
- [x] 6.3 Preserve the existing prompt pinning at the bottom (`#input-container`) — do NOT change its positioning, the prompt-shadow behavior at `index.html:1832`, or the auto-scroll-to-bottom on command submission. Both sticky zones coexist: top zone pinned to viewport top, prompt pinned to viewport bottom, content between them scrolls
- [x] 6.4 When the neofetch header collapses on first tab click (expanded → shrunk), the top zone's height change SHALL follow the existing `transition: margin 0.35s ease` on `.tab-nav-container` (`index.html:1845`). The transition applies to the height/margin change, not to any new shadow or visual treatment
- [x] 6.5 No shadow or visual treatment is added at the bottom edge of the sticky top zone when the middle scrolls — it stays plain. The existing `prompt-shadow` above the bottom prompt is the only scroll-edge treatment on the page
- [x] 6.6 Confirm the fixed Red River West button (`.main-site-button` at `index.html:1512-1520`) keeps `z-index: 1000` and renders above the sticky top zone. The sticky top zone SHALL use a `z-index` lower than `1000` (e.g. `10` or similar) to preserve layering. The pre-existing visual overlap between the RRW button and the top-right corner of the figlet logo is accepted as-is — no layout changes to separate them
- [x] 6.7 Remove or adapt the existing `max-height: calc(100vh - 75px); overflow-y: auto` on `#terminal-output` at `index.html:1708` since the new three-zone flex layout replaces that scroll container. Ensure the scroll behavior on the middle region still supports the prompt-shadow trigger at `index.html:1201-1209`

## 7. Verification

- [x] 7.1 Load page at desktop width (≥1024px): highlights show rules-only layout, host prefix appears before the live prompt, top zone is pinned (scroll the page — figlet, highlights, help text, tab bar, dash line do not move)
- [x] 7.2 Resize to tablet width (≈700px): layout identical, rules still edge-to-edge within container, top zone still pinned
- [x] 7.3 Resize to mobile width (≈400px): layout identical, rules still edge-to-edge, top zone still pinned
- [x] 7.4 Run a few commands (`ls`, `cd portfolio`, `cd ..`): every echoed history line carries the red host prefix and the path-aware `>`; history scrolls within the middle region only; prompt stays pinned at the bottom; auto-scroll-to-bottom on submission still works
- [x] 7.5 Click a tab to trigger the neofetch collapse: top zone height transitions smoothly (0.35s), nothing else animates, no shadow appears at the dash line
- [x] 7.6 Open a profile card and a portfolio profile card: their `neofetch-rule` separators render as CSS-bordered dashed lines, full container width, same visual weight as before; the card scrolls within the middle region, top zone stays pinned
- [x] 7.7 Scroll the middle region up so the prompt-shadow fades in above the prompt; verify the fade-in still triggers and the shadow still spans the full viewport width (`100vw`, `left: -12px`) as specced in `prompt-format`
- [x] 7.8 Confirm the Red River West button renders above the pinned top zone at every breakpoint and navbar state
