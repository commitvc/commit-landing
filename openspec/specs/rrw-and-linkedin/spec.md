# rrw-and-linkedin Specification

## Purpose
Defines the canonical opening sentence of the about-page README (the Red River West family relationship), the LinkedIn field on team profiles, and the team profile card's 4-line layout.

## Requirements
### Requirement: `about/readme.txt` opens with the Red River West family sentence
The `about/` directory's `readme.txt` content SHALL begin with: ">commit is part of the Red River West family and is the early-stage investment vehicle focused on commercial open source startups. We back commercial open source companies at pre-seed and seed, with checks up to $1.5M."

#### Scenario: RRW sentence appears at the start of the about readme
- **WHEN** user runs `cat about/readme.txt` or clicks `readme.txt` in the about tab
- **THEN** the first line of the content is ">commit is part of the Red River West family and is the early-stage investment vehicle focused on commercial open source startups. We back commercial open source companies at pre-seed and seed, with checks up to $1.5M."

### Requirement: Team profile `.txt` files include a LinkedIn field
Each team member `.txt` file SHALL include a `LinkedIn:` field with the member's LinkedIn profile URL. The `profile` renderer SHALL display this field in the card alongside Github.

#### Scenario: LinkedIn field renders in team profile card
- **WHEN** user views a team member profile card
- **THEN** a LinkedIn line is visible in the card, styled and linked consistently with the Github field

#### Scenario: Profile card without LinkedIn field does not error
- **WHEN** a team member `.txt` file has no `LinkedIn:` field
- **THEN** the profile card renders normally with no LinkedIn line and no error

### Requirement: Team profile card layout — 4-line format
The team profile card SHALL display data in a compact 4-line format: `Name, Role` on one line (comma separator), then `Location`, then `Github` link, then `LinkedIn` link (if present). The image is 10rem × 10rem fixed, `object-fit: cover`, `object-position: top`, no border. The card uses `.neofetch-rule` horizontal dividers (same as neofetch) above and below the text, with line breaks between fields to fill the image height.

#### Scenario: Name and role on same line
- **WHEN** user views a team member profile card
- **THEN** the first content line reads e.g. "Max Corbani, Partner"

### Requirement: Profile cards (team and company) are not wrapped in `<pre>`
Both `viewFile()` and the `cat` command SHALL return profile card HTML directly, without wrapping in `<pre>` tags. Only plain text files use `<pre>`. This prevents the `<pre>` tag from breaking flex layout inside cards.

#### Scenario: profile card emits raw HTML
- **WHEN** the `cat team/<member>.txt` command renders or the file-tree viewer opens a profile
- **THEN** the rendered output is the card's HTML directly, without an enclosing `<pre>` element

### Requirement: Profile card container layout
`.profile-card2-container` SHALL use `display: flex; align-items: center; justify-content: flex-start; gap: 1rem`. Image container uses `flex-shrink: 0`. Data container uses `min-width: 0; overflow: hidden` so long `.neofetch-rule` dashes clip rather than expanding the layout.

#### Scenario: container is flex with non-shrinking image
- **WHEN** the computed style of `.profile-card2-container` is read
- **THEN** `display` is `flex`, the image container has `flex-shrink: 0`, and the data container has `min-width: 0` and `overflow: hidden`

### Requirement: Story text uses default terminal color
The `.story-text` class SHALL use `color: #c8d0f2` (the standard terminal text colour), not white.

#### Scenario: story-text colour matches terminal default
- **WHEN** the computed style of an element with `.story-text` is read
- **THEN** `color` resolves to `rgb(200, 208, 242)` (i.e. `#c8d0f2`)

**LinkedIn URLs:**
- Max Corbani: https://www.linkedin.com/in/mxcrbn/
- Olivier Huez: https://www.linkedin.com/in/olivierhuez/
- Abel Samot: https://www.linkedin.com/in/abel-samot/
- Alessandro Ciffo: https://www.linkedin.com/in/alessandro-ciffo-4b7710191/
