## 1. Cleanup — Remove old mode switcher

- [x] 1.1 Remove `.mode-btn`, `.mode-switcher`, `.mode-separator` CSS classes
- [x] 1.2 Remove `switchMode()` function
- [x] 1.3 Remove `currentMode` variable and `fileTreeState` variable
- [x] 1.4 Remove `buildFileTree()`, `toggleDir()`, `renderFileTree()` functions
- [x] 1.5 Remove File System tree HTML/CSS (`.file-tree`, `.file-tree-container`, `.tree-item`, `.tree-prefix`, `.tree-toggle`, `.tree-dir`, `.tree-file`, `.file-viewer`, `.file-viewer-header`)

## 2. Tab Bar — HTML & CSS

- [x] 2.1 Add tab bar CSS: tab container, tab item styles, active state (`>` prefix in red), inactive state (30% opacity), hover state (100% opacity + `cursor: pointer`)
- [x] 2.2 Add separator CSS: `─` character line below tab bar at ~20% opacity

## 3. Tab Bar — JavaScript

- [x] 3.1 Add `currentTab` variable ∈ `{ "cli", "portfolio", "team", "about" }`, default `"cli"`
- [x] 3.2 Implement `switchTab(tab)` — updates active tab indicator, shows/hides content areas
- [x] 3.3 Update `renderWelcome()` to render 4-tab bar instead of old mode-switcher buttons
- [x] 3.4 Wire tab click handlers to `switchTab()`

## 4. Shared: Tab-scoped File System Tree

- [x] 4.1 Implement `renderTabTree(rootPath)` — renders the file system tree navigator scoped to a given virtual path; no file is auto-opened on render (reuses `buildFileTree` logic from `feature/fileSystem`)
- [x] 4.2 Ensure `viewFile()` is called on click and uses the correct renderer (profile card, portfolio card, or plain text) regardless of which tab is active

## 5. Portfolio Tab Content

- [x] 5.1 Implement `renderPortfolio()` — calls `renderTabTree("portfolio")` scoped to `portfolio/`
- [x] 5.2 Verify clicking a portfolio `.txt` file renders a portfolio profile card via `portfolioProfile`
- [x] 5.3 Verify stealth placeholder fields (`$website`, `$github`, `$img.png`) render grayed out with `cursor: not-allowed`

## 6. Team Tab Content

- [x] 6.1 Implement `renderTeam()` — calls `renderTabTree("team")` scoped to `team/`
- [x] 6.2 Verify clicking a team member file renders a profile card via `profile`

## 7. About Tab Content

- [x] 7.1 Implement `renderAbout()` — calls `renderTabTree("about")` scoped to `/about/`
- [x] 7.2 Verify `readme.txt` is listed but not auto-opened; clicking renders its content as plain text

## 8. Virtual Filesystem — Add `/about/` directory

- [x] 8.1 Add `about` directory to the virtual filesystem at `/`, containing `readme.txt` with the existing fund overview content
- [x] 8.2 Remove `readme.txt` from the root `/` of the virtual filesystem
- [x] 8.3 Verify CLI: `cd about`, `ls`, `cat readme.txt` all work correctly
- [x] 8.4 Verify CLI: `cat readme.txt` from `/` returns a not-found error

## 9. CLI Tab — Verify Behaviour

- [x] 9.1 Confirm CLI tab is active by default on load and terminal input is focused
- [x] 9.2 Confirm switching away from CLI and back preserves command history output
- [x] 9.3 Confirm `neofetch` has `hidden: true` and does not appear in `help` output
- [x] 9.4 Confirm `clear` command re-renders welcome screen with tab bar defaulting to CLI

---

## Backlog

### Content & Features
- [ ] Add a manifesto
- [x] Write a GitHub README for the repo — done; `README.md` at repo root
- [ ] Improve advisor tab (logos grid, tiered view) — details TBD
- [x] Add OSS data to portcos (GitHub stars, community metrics, etc.) — done; `CompanyCard`'s `# project` block surfaces license, language, first commit, stars, contributors, and NPM/PYPI/Docker/GHCR pulls
- [ ] Fix newsletter subscription and reactivate the email command — partial; `email` CLI command exists (`mailto:hey@commit.fund`); no newsletter signup form
- [x] Update OG meta details (title, description, image) — done; root `app/layout.tsx` `openGraph` + per-route `metadata` exports
- [x] Migrate PostHog to aggregated account (currently on ad-hoc account) — shipped (tracked outside this repo)

### UI / Polish
- [x] Mobile layout — full responsive pass (tab bar behavior, spacing) — shipped piecemeal: mobile-only `WelcomeHeader` branch, NavBar overflow-x scroller with mobile mask, CompactHeader rendering
- [~] ~~Content margins: equalise left/right margins between shrunk and unshrunk navbar states~~ — obsolete; route-based architecture replaced the shrunk/unshrunk navbar concept (separate `WelcomeHeader` and `CompactHeader` components, no shrunk state)
- [~] ~~Active tab indicator: sliding red→gray dash underline with 0.3s animation (Option C collapse — neofetch collapses only on first tab click)~~ — partly shipped (sliding indicator with cubic-bezier transition is live), partly obsolete (Option C neofetch-collapse-on-first-click died with the route-based architecture)

### Superseded
- [~] ~~ASCII box: add spaces around `+` corner symbols for equal horizontal & vertical spacing~~ — obsolete; the ASCII box is removed entirely by `terminal-chrome-polish`
- [~] ~~Tab dash line: fix edge-to-edge width consistency between shrunk and unshrunk navbar states~~ — absorbed into `terminal-chrome-polish` (same literal-dash pattern as `.neofetch-rule`; same CSS-border fix)
