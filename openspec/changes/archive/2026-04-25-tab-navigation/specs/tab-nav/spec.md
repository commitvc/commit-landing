## ADDED Requirements

### Requirement: Tab bar renders with four named tabs
The site SHALL display a horizontal tab bar with four tabs — CLI, Portfolio, Team, About — below the neofetch output on page load.

#### Scenario: Tab bar visible on load
- **WHEN** the page loads and boot sequence completes
- **THEN** the tab bar is rendered with tabs: CLI, Portfolio, Team, About

#### Scenario: Active tab has `>` prefix in red
- **WHEN** a tab is the active/selected tab
- **THEN** it is prefixed with `>` in red (`#e63424`) and rendered at full opacity

#### Scenario: Inactive tabs are dimmed
- **WHEN** a tab is not the active tab
- **THEN** it is rendered without a prefix at approximately 30% opacity

#### Scenario: Separator line below tab row
- **WHEN** the tab bar is rendered
- **THEN** a `─` box-drawing character separator line appears directly below the tab row

---

### Requirement: Tabs are clickable and switch content
Clicking any tab SHALL switch the content area to that tab's view and update the active tab indicator.

#### Scenario: Clicking an inactive tab activates it
- **WHEN** user clicks an inactive tab
- **THEN** that tab becomes active (gains `>` prefix, full opacity) and its content is rendered

#### Scenario: Clicking the active tab does nothing
- **WHEN** user clicks the already-active tab
- **THEN** no change occurs

#### Scenario: Hover signals clickability
- **WHEN** user hovers over any tab
- **THEN** the cursor changes to `pointer` and the tab text reaches full opacity

---

### Requirement: CLI tab renders the terminal interface
The CLI tab SHALL display the command input and output area, matching the current CLI behavior.

#### Scenario: CLI tab is active by default
- **WHEN** the page loads
- **THEN** the CLI tab is the default active tab and the terminal input is focused

#### Scenario: Switching to CLI tab restores terminal
- **WHEN** user switches to CLI tab from another tab
- **THEN** the terminal input is shown and focused; previous command output is preserved

---

### Requirement: All content tabs use the file system tree navigator
Portfolio, Team, and About tabs SHALL all use the same file system tree navigator, scoped to their respective virtual directory. Files are listed and clickable; directories are expandable. No file is auto-opened on tab load — content is revealed on click only.

#### Scenario: Tab tree shows contents without auto-opening
- **WHEN** a content tab (Portfolio, Team, About) is activated
- **THEN** the tree navigator renders listing files and folders; no file content is shown until the user clicks

#### Scenario: Clicking a file in any tab opens its content
- **WHEN** user clicks a file entry in any tab
- **THEN** the file's content is rendered using the appropriate renderer (profile card, portfolio card, or plain text)

#### Scenario: Single-file tree works the same as multi-file tree
- **WHEN** a tab's directory contains only one file (e.g., About with `readme.txt`)
- **THEN** the tree renders that single file as a clickable entry; behavior is identical to multi-file trees

---

### Requirement: Portfolio tab uses file system tree navigator
The Portfolio tab SHALL render the `portfolio/` directory as a file system tree, following the mixed-content rule (contains `roots/` folder plus individual files).

#### Scenario: Portfolio tree shows roots folder and individual files
- **WHEN** Portfolio tab is active
- **THEN** a tree is shown with `roots/` as a collapsible directory node, and `uma.txt`, `stealth.txt` as sibling file entries

#### Scenario: Clicking a portfolio company file renders a portfolio card
- **WHEN** user clicks a `.txt` file in the portfolio tree (except `roots/about.txt`)
- **THEN** the file is rendered as a portfolio profile card using `portfolioProfile`

#### Scenario: Stealth placeholder fields are grayed out
- **WHEN** a portfolio card has `$placeholder` values
- **THEN** those fields are rendered in muted color with `cursor: not-allowed`

---

### Requirement: Team tab uses file system tree navigator
The Team tab SHALL render the `team/` directory as a file system tree, following the mixed-content rule (contains folders and files).

#### Scenario: Team tree shows member files and subdirectories
- **WHEN** Team tab is active
- **THEN** a tree is shown with `advisors/` and `private/` as collapsible nodes, and member `.txt` files as clickable entries

#### Scenario: Clicking a team member file renders a profile card
- **WHEN** user clicks a team member `.txt` file (abel, olivier, max, alessandro)
- **THEN** the file is rendered as a profile card using the `profile` renderer

---

### Requirement: About tab uses file system tree navigator scoped to `/about/`
The About tab SHALL render the tree navigator scoped to `/about/`, which contains `readme.txt`. The file SHALL NOT be auto-opened.

#### Scenario: About tab shows tree with readme not opened
- **WHEN** About tab is active
- **THEN** the tree renders `/about/` showing `readme.txt` as a clickable entry; no content is shown automatically

#### Scenario: Clicking readme in About tab renders its content
- **WHEN** user clicks `readme.txt`
- **THEN** the content of `/about/readme.txt` is rendered as plain text

---

### Requirement: `/about/` directory exists in the virtual filesystem
The virtual filesystem SHALL contain an `about/` directory with `readme.txt` inside it. `readme.txt` SHALL be moved from the root `/` into `/about/`.

#### Scenario: CLI can navigate to about directory
- **WHEN** user types `cd about` in CLI
- **THEN** the current directory changes to `/about/`

#### Scenario: CLI can list and read about files
- **WHEN** user types `ls` in `/about/` then `cat readme.txt`
- **THEN** the directory listing shows `readme.txt` and `cat` renders its content

#### Scenario: readme.txt no longer exists at root
- **WHEN** user types `cat readme.txt` from `/`
- **THEN** the CLI returns `cat: readme.txt: No such file or directory`

---

### Requirement: `neofetch` is hidden from help output
The `neofetch` command SHALL be excluded from the `help` command's listed commands.

#### Scenario: Help does not list neofetch
- **WHEN** user runs `help`
- **THEN** `neofetch` does not appear in the list of available commands

#### Scenario: neofetch still runs on boot
- **WHEN** the page loads and boot sequence completes
- **THEN** neofetch output is still rendered automatically before the tab bar
