## Why

Two regressions in the terminal's visual identity have accumulated:

1. The "highlights" panel under the `commit` figlet logo is an ASCII `+---+` rectangle with three hand-aligned responsive variants (wide, narrow, mobile). The `+` corners and `|` verticals feel dated, compete visually with the figlet logo, and the three-variant approach is fragile — minor copy changes break alignment on one breakpoint but not the others.
2. The terminal prompt lost its `user@commit.fund` host prefix in the recent rewrite (tracked in `prompt-format` spec). The current bare `>` reads as anonymous and loses the neofetch/bash metaphor the rest of the site leans into.

Both fixes live in the same file and same visual region. Bundling them keeps the change small and focused.

## What Changes

- Replace the ASCII `+---+` highlights box with a rules-only treatment (dashed horizontal lines above and below the key/value block, no vertical borders, no corners) — the treatment already used on mobile, now promoted to all breakpoints
- Replace all literal ASCII dash strings (`----...`) across the page with a CSS-bordered element so the rule auto-fits its container at every viewport width, edge-to-edge. This covers both the `.neofetch-rule` spans (highlights, profile cards, portfolio profile cards) and the `.tab-nav-container::after` separator below the tab bar — same pattern, same fix
- Collapse the three responsive variants (`.ascii-box-wide`, `.ascii-box-narrow`, `.ascii-box-mobile`) into a single layout
- Restore the `user@commit.fund ` prefix before every terminal prompt, rendered in red (`.red`), with a single space separator (no colon)
- Fold the prefix into the central `formatPrompt()` helper so every callsite picks it up; patch the one hardcoded `>neofetch` echo that bypasses the helper
- Restructure the page layout into three vertical zones so that the region above the tab bar's dash line stays pinned to the viewport top (never scrolls) and only the content between the dash line and the prompt scrolls. The pinned top zone contains, in expanded state, the figlet logo + highlights + help text + tab bar + dash line; in shrunk state, the small ASCII logo + tab bar + dash line. Existing prompt pinning and auto-scroll-to-bottom behavior are preserved unchanged. No shadow is added at the bottom edge of the top zone. The fixed Red River West button keeps its `z-index: 1000` and continues to layer above the top zone

## Capabilities

### Modified Capabilities

- `prompt-format` — the "Terminal prompt displays `>` in default text color" requirement is replaced. The prompt now carries a red `user@commit.fund` host prefix before the `>`; the `>` itself stays in default color.

### New Capabilities

- `neofetch-banner` — formalises the visual treatment of the top-of-page banner: figlet logo, highlights block (Activity / Focus / Stage / Github), and the horizontal rules that frame it. Documents the CSS-bordered rule (single source of truth for all `.neofetch-rule` instances on the page).

## Impact

- `index.html` only (single-file site, no build step)
- HTML changes:
  - `index.html:44-72` — collapse three `.ascii-box*` variants into one rules-only block
  - `index.html:1085` — hardcoded `>neofetch` echo updated to use `formatPrompt` (or at minimum carry the host prefix)
  - `index.html:103`, `index.html:108`, `index.html:155`, `index.html:160`, `index.html:66`, `index.html:71` — replace literal dash strings in `<span class="neofetch-rule">` with an empty element styled by CSS
  - `index.html:1848-1861` — `.tab-nav-container::after` drops its 240-char literal dash `content` string; the separator is drawn by a `border-bottom` on the container (or an equivalent CSS-border approach), preserving the full-viewport-width behavior
- JS changes:
  - `index.html:897-899` — `formatPrompt()` gains the red host prefix; all existing callsites (`index.html:1246`, `index.html:1397`, `index.html:1407`) inherit automatically
- CSS changes:
  - `index.html:1678-1700` — delete `.ascii-box`, `.ascii-box-wide`, `.ascii-box-narrow`, `.ascii-box-mobile` and their media queries
  - `index.html:1930-1936` — `.neofetch-rule` becomes a CSS-bordered element (`border-top: 1px dashed rgba(200, 208, 242, 0.4)`) instead of a `white-space: nowrap; overflow: hidden` clipper on a literal dash string
