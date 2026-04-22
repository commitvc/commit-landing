## 1. Prompt Format

- [x] 1.1 Update `formatPrompt()` — return plain `>` at root, `${path} >` in subdirectories (no red span, no `user@commit.fund:` prefix)
- [x] 1.2 Update `updatePrompt()` — remove space between prompt and input: `${formatPrompt(currentDirectory)}`
- [x] 1.3 Update neofetch boot echo — `>neofetch` (no space)
- [x] 1.4 Update static HTML input line — plain `>` (no red span)
- [x] 1.5 Update command history echoes — `${formatPrompt(currentDirectory)}${escapeHtml(input.value)}` (no space)
- [x] 1.6 Update error history echoes — same format as valid commands

## 2. Physical Directory Rename

- [x] 2.1 Rename `portfolio/roots/` to `portfolio/pre-commit/` on disk (all PNG files move with it)
- [x] 2.2 Verify all 10 PNG files are present in `portfolio/pre-commit/` after rename

## 3. Virtual Filesystem — `pre-commit/`

- [x] 3.1 Remove the `roots` entry from the `portfolio` directory in the virtual filesystem
- [x] 3.2 Add `pre-commit` directory to `portfolio` with 10 company `.txt` entries (content from specs/pre-commit-folder/spec.md)
- [x] 3.3 Remove `about.txt` from the pre-commit virtual directory
- [x] 3.4 Update `cat` command routing: `pre-commit/` files route to `portfolioProfile`
- [x] 3.5 Update `viewFile()` routing: `pre-commit/` files route to `portfolioProfile`

## 4. `portfolioProfile` Renderer — Story Field & Card Layout

- [x] 4.1 Add `lastKey` accumulation pattern for multi-line `Story:` field parsing
- [x] 4.2 Render story paragraphs in `.story-text` class above the card
- [x] 4.3 `.story-text` CSS: `color: #c8d0f2` (default text color, not white), no `max-width`
- [x] 4.4 Replace short dashes with `.neofetch-rule` spans (~160 dashes, `overflow: hidden`)
- [x] 4.5 Add line breaks between card fields to match image height
- [x] 4.6 Remove `<pre>` wrapping from `portfolioProfile` output in both `cat` and `viewFile()`

## 5. Profile Card Container CSS

- [x] 5.1 `.profile-card2-container`: `align-items: center; justify-content: flex-start; gap: 1rem`
- [x] 5.2 `.image-container`: `flex-shrink: 0`
- [x] 5.3 `.profile-card2-data`: `min-width: 0; overflow: hidden` (clips neofetch-rule dashes)
- [x] 5.4 Remove `overflow-x: hidden` from `.container` (shadow pseudo-element needs to escape)

## 6. Team Profile — 4-Line Format

- [x] 6.1 Combine Name + Role on one line with comma: `${teamprofile.Name}, ${teamprofile.Role}`
- [x] 6.2 Replace short dashes with `.neofetch-rule` spans (same as company cards)
- [x] 6.3 Add line breaks between fields to match image height
- [x] 6.4 Remove `<pre>` wrapping from `profile` output in both `cat` and `viewFile()`
- [x] 6.5 `.profile-image`: fixed `10rem × 10rem`, `object-fit: cover`, `object-position: top`, no border

## 7. `whois` Command

- [x] 7.1 Add `whois` command with `hidden: true`
- [x] 7.2 `whois commit.fund` renders RDAP-style block with RRW details
- [x] 7.3 `whois` with no/wrong argument returns usage hint

## 8. RRW Mention in `about/readme.txt`

- [x] 8.1 Move RRW sentence to the BEGINNING of readme content: ">commit is part of the Red River West family and is the early-stage investment vehicle focused on commercial open source startups. We back commercial open source companies at pre-seed and seed, with checks up to $1.5M."
- [x] 8.2 Remove duplicate RRW sentence from end of readme

## 9. LinkedIn on Team Profiles

- [x] 9.1 Add `LinkedIn:` field to all 4 team members in virtual filesystem
- [x] 9.2 Update `profile` renderer: show LinkedIn conditionally below Github
- [x] 9.3 LinkedIn renders as clickable link, styled same as Github

## 10. CLI Spacing & Prompt Area

- [x] 10.1 `.command-output` margin-bottom: `1.5rem`
- [x] 10.2 Always emit `.command-output` div even for empty output (e.g. `cd`)
- [x] 10.3 `#terminal-output` max-height: `calc(100vh - 75px)`
- [x] 10.4 `#input-container`: `padding: 1rem 12px 1rem 0`, `background-color: #313445`
- [x] 10.5 `.container` bottom padding: `1.5rem`
- [x] 10.6 Scroll shadow: `::before` pseudo-element on `#input-container`, `width: 100vw`, gradient `rgba(0,0,0,0.5)` to transparent, 8px tall, toggled via `.prompt-shadow` class
- [x] 10.7 JS scroll listener on `#terminal-output`: add/remove `.prompt-shadow` class based on scroll position, with 5px threshold
- [x] 10.8 CSS transition: `opacity 0.3s ease` for smooth fade in/out
