## Context

Single-file vanilla JS/HTML/CSS site (`index.html`) on the `feature/fileSystem` branch. No build step, no framework. The current mode switcher (`switchMode()`) toggles between a CLI view and a File System tree view. We're replacing this with a 4-tab navigation: CLI, Portfolio, Team, About — where Portfolio/Team/About are curated views into the existing virtual filesystem, not raw tree browsers.

Current state:
- `currentMode` ∈ `{ "cli", "fs" }`
- `switchMode(mode)` shows/hides `#file-tree-container` and `#input-container`
- `renderWelcome()` injects the mode-switcher HTML
- CSS classes: `.mode-btn`, `.mode-switcher`, `.mode-separator`

## Goals / Non-Goals

**Goals:**
- 4 tabs: CLI, Portfolio, Team, About
- Active tab: `>` prefix in red (`#e63424`), full opacity
- Inactive tabs: no prefix, ~30% opacity, `cursor: pointer`, full opacity on hover
- `────────────────` separator line below tab row
- Portfolio tab: renders uma, stealth, and roots companies as portfolio cards
- Team tab: renders abel, olivier, max, alessandro as profile cards + advisors as plain text
- About tab: renders `/readme.txt` content as plain text
- `neofetch` hidden from `help` (already done, keep it)

**Non-Goals:**
- Mobile-specific tab layout (existing responsive CSS handles neofetch area; tabs are simple text and will wrap gracefully)
- Animated tab transitions
- Deep-linking / URL routing
- Any change to the virtual filesystem structure or command set

## Decisions

**1. Tab renders content directly, not via CLI commands**

Portfolio/Team/About tabs call the existing `portfolioProfile`, `profile`, and file content functions directly — they don't simulate `ls` + `cat` in the terminal. This gives a cleaner, faster UX for non-CLI users.

Alternatively: tabs could auto-run CLI commands and show output in the terminal. Rejected — it muddies the separation between CLI mode and GUI mode, and forces the user to re-clear output when switching.

**2. `currentMode` extended to 4 values**

`currentMode` ∈ `{ "cli", "portfolio", "team", "about" }`. Each tab maps to a dedicated render function: `renderCLI()`, `renderPortfolio()`, `renderTeam()`, `renderAbout()`.

Alternatively: keep the `cli` / `fs` split and make Portfolio/Team/About sub-views of `fs`. Rejected — the file tree was an intermediate step; the named tabs replace it entirely.

**3. Active state via `>` prefix + opacity, no CSS classes for color**

Active tab gets `<span class="red">></span>` prepended inline. Inactive tabs are wrapped in a `<span>` with `opacity: 0.3`. Hover handled via CSS `:hover` selector on the tab element.

Alternatively: toggle a CSS class `.active` with a color rule. Either works — inline prefix is chosen to stay consistent with how the rest of the terminal output is constructed (inline spans, not class toggles).

**4. Separator uses `─` box-drawing character**

A `<div>` of repeated `─` characters (or a CSS `border-bottom` on the tab container) sits below the tab row. Box-drawing char preferred to stay typographically consistent with the rest of the site.

**5. `renderWelcome()` drives tab initialization**

`renderWelcome()` already re-renders the full welcome state (called by `clear`). It will now render the tab bar and default to CLI mode. `switchMode()` renamed to `switchTab(tab)` for clarity.

## Risks / Trade-offs

- **Content duplication**: Portfolio/Team tab content is already accessible via CLI (`cat portfolio/uma.txt` etc). Two ways to access same data is intentional — serves different user types. Risk: content gets out of sync if filesystem structure changes. Mitigation: tabs call the same render functions (`portfolioProfile`, `profile`) as `cat` does.
- **Stealth placeholder visible in Portfolio tab**: The grayed-out `$placeholder` rendering for stealth companies will be visible. This is intentional — it signals "something is coming."
- **Roots in Portfolio tab**: `roots/` is a sub-folder with 10 companies + an `about.txt`. The Portfolio tab uses the file system tree (mixed folder + files), so `roots/` appears as a collapsible directory node. `about.txt` is accessible by clicking it.
- **Stealth placeholder visible in Portfolio tab**: The grayed-out `$placeholder` rendering for stealth companies will be visible. This is intentional — it signals "something is coming."

**6. All content tabs use the same tree navigator, no file is auto-opened**

Portfolio, Team, and About all call `renderTabTree(rootPath)` scoped to their respective virtual directory. Files are never auto-opened — content appears only on click. About currently has one file (`readme.txt`) and no subdirectories; the tree handles this naturally without special-casing. If About gains more files or folders later, no code changes needed.

**7. CLI and visual tabs are exact mirrors — virtual filesystem is the source of truth**

The tab views are scoped views into the same virtual filesystem that the CLI navigates. This means:
- `/about/readme.txt` exists in the filesystem → `cd about && cat readme.txt` works in CLI, and About tab shows the same tree
- `/portfolio/` → Portfolio tab scoped to `portfolio/`, CLI can `cd portfolio`
- `/team/` → Team tab scoped to `team/`, CLI can `cd team`
- `readme.txt` moves from `/` into `/about/` — it no longer lives at root

The root `/` in CLI will no longer contain `readme.txt` directly (it moves to `about/`). The tab structure makes the hierarchy explicit for GUI users; CLI users discover the same structure via `ls`.

`admin/` is intentionally absent from the tabs — tabs are scoped to `about/`, `team/`, and `portfolio/` only. `admin/` remains a CLI-only easter egg for technical visitors who explore the filesystem manually.
