## Context

The terminal is a single `index.html` file with vanilla JS. The prompt is rendered in two places: `updatePrompt()` (the live input line) and inline in command history output. The virtual filesystem is a JS object. The `portfolio/roots/` physical directory contains company logo PNGs.

## Goals / Non-Goals

**Goals:**
- Prompt is `>` in default text color everywhere — input line, command history, boot neofetch echo
- Red `>` reserved exclusively for the active tab prefix
- No space between `>` and command text
- `pre-commit/` replaces `roots/` in both physical directory and virtual filesystem
- Each company in `pre-commit/` has a story blurb + card fields, no folder-level `about.txt`
- `whois commit.fund` returns structured output mentioning Red River West
- `about/readme.txt` opens with the RRW family sentence
- Team profiles gain a `LinkedIn` field in a compact 4-line card format
- Profile cards use `.neofetch-rule` dividers (same length as neofetch)
- Profile cards render without `<pre>` wrapping to preserve flex layout
- CLI command blocks have consistent `1.5rem` spacing between them
- Prompt area has padding, background color, and a scroll-aware shadow

**Non-Goals:**
- Pagination or scrolling for long `pre-commit/` entries
- The `whois` command responding to any domain other than `commit.fund`

## Decisions

### 1. Prompt: `>` in default text color, no space before command

**Decision:** The prompt is `>` when at `/`, and `/path >` when in a subdirectory. The `>` uses the default terminal text color (`#c8d0f2`), not red. There is no space between `>` and the command text in history echoes and the boot neofetch line.

**Why:** The red `>` is reserved for the active tab indicator in the tab bar. Using the same red in the prompt created visual confusion between the prompt and the tab prefix. Default text color is clean and unambiguous. No space between `>` and command text matches the `>commit` brand style.

**Rendering:** `formatPrompt()` returns plain `>` at root, `${path} >` in subdirectories. History echoes use `${formatPrompt(currentDirectory)}${escapeHtml(input.value)}` (no space). Boot echo is `>neofetch`.

### 2. `pre-commit/` company file format with story blurb

**Decision:** Each company `.txt` file contains a `Story:` field (multi-line via `lastKey` accumulation pattern) followed by card fields. The `portfolioProfile` renderer renders story paragraphs in `.story-text` (`color: #c8d0f2`) above the card. Story text has no `max-width` constraint.

**Card layout:** Image box (left, `flex-shrink: 0`) + data box (right, `min-width: 0; overflow: hidden`). Container uses `align-items: center; justify-content: flex-start; gap: 1rem`. Horizontal dividers use `.neofetch-rule` class (~160 dashes, `overflow: hidden`, `white-space: nowrap`). Line breaks between fields fill the image height. Profile HTML is returned without `<pre>` wrapping.

### 3. `whois` command output format

**Decision:** `whois commit.fund` returns a styled block mimicking RDAP/whois output, with Manager pointing to Red River West SAS at 9 rue des Colonnes du Trône, 75012 Paris.

The command is `hidden: true`. Only discoverable by typing it.

### 4. Team profile — compact 4-line format

**Decision:** Team profile cards use a 4-line layout: `Name, Role` (comma separator) → `Location` → `Github` → `LinkedIn` (conditional). Image is 10rem × 10rem, `object-fit: cover`, `object-position: top`, no border. Same `.neofetch-rule` dividers and card container layout as company cards.

**Why comma separator:** Reads naturally ("Max Corbani, Partner") and is warmer than a pipe `|`.

### 5. CLI spacing and prompt area

**Decision:** `.command-output` always gets emitted (even for empty output like `cd`) with `margin-bottom: 1.5rem`. This ensures consistent spacing between command blocks regardless of whether the command produced output.

The prompt area (`#input-container`) has `1rem` top/bottom padding and `background-color: #313445`. A `::before` pseudo-element (8px gradient, `width: 100vw`) fades in when `#terminal-output` is not scrolled to the bottom, providing a subtle shadow. `#terminal-output` has `max-height: calc(100vh - 75px)` and `.container` has `1.5rem` bottom padding.

### 6. Readme opens with RRW sentence

**Decision:** `about/readme.txt` now begins with ">commit is part of the Red River West family and is the early-stage investment vehicle focused on commercial open source startups. We back commercial open source companies at pre-seed and seed, with checks up to $1.5M."

**Why:** Establishes the fund's identity and relationship upfront rather than burying it at the end.

## Risks / Trade-offs

- **Multi-place prompt update** — the prompt appears in `formatPrompt()`, `updatePrompt()`, the static HTML input line, and the neofetch boot echo. All were updated.
- **`pre-commit/` physical rename** — image assets moved from `portfolio/roots/*.png` to `portfolio/pre-commit/*.png`. All `Avatar:` fields updated.
- **No `<pre>` wrapping for profile cards** — profile renderers return HTML directly. Only plain text files use `<pre>`. This prevents flex layout breakage inside cards.
- **`.neofetch-rule` in cards** — the long dash string with `white-space: nowrap` could expand the data container. Fixed with `min-width: 0; overflow: hidden` on `.profile-card2-data`.
- **Scroll shadow** — uses `::before` with `width: 100vw` which relies on `overflow-x: hidden` being removed from `.container` (kept on `html` element instead).
