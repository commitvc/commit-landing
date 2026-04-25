## Why

The current `[ CLI ] | [ File System ]` toggle is unclear — users don't immediately understand that the options are clickable, and the binary choice doesn't surface the site's content (portfolio, team, about). Expanding to named content tabs makes the site navigable for non-terminal users while keeping the terminal aesthetic intact.

## What Changes

- Replace the 2-button mode switcher (`[ CLI ] | [ File System ]`) with a 4-tab navigation bar: **CLI**, **Portfolio**, **Team**, **About**
- Active tab is indicated by a `>` prefix in red (the existing prompt character) — no brackets
- Inactive tabs are dimmed (~30% opacity), full opacity + `cursor: pointer` on hover
- A `────────────────` separator line sits below the tab row
- `neofetch` is permanently hidden from `help` output (already done in `feature/fileSystem`, formalising here)
- **Portfolio tab**: renders the portfolio directory contents directly (uma, stealth, roots)
- **Team tab**: renders the team directory contents directly (abel, olivier, max, alessandro + advisors)
- **About tab**: renders the `/about/` directory tree (same tree navigator pattern as Portfolio and Team)
- Add `/about/` directory to the virtual filesystem containing `readme.txt` — CLI and visual navigation are exact mirrors; `cd about && cat readme.txt` works in CLI

## Capabilities

### New Capabilities

- `tab-nav`: Top-level navigation bar with CLI / Portfolio / Team / About tabs, terminal-aesthetic styling using `>` prefix for active state and dimmed text for inactive

### Modified Capabilities

- none

## Impact

- `index.html` only (single-file site, no build step)
- Replaces `switchMode()` and the existing mode-switcher HTML/CSS
- `renderWelcome()` updated to render new tab bar instead of old buttons
- CSS: remove `.mode-btn`, `.mode-switcher`, `.mode-separator` styles; add tab nav styles
- `neofetch` command: `hidden: true` (already set in `feature/fileSystem`)
- Virtual filesystem: add `about/` directory containing `readme.txt`; remove `readme.txt` from root `/`
