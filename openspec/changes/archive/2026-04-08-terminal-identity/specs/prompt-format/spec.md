## MODIFIED Requirements

### Requirement: Terminal prompt displays `>` in default text color
The terminal prompt SHALL render `>` in the default terminal text color (`#c8d0f2`), NOT red. The red `>` is reserved exclusively for the active tab prefix in the tab bar. When the current directory is `/`, the prompt is `>` alone. When in a subdirectory, the current path is shown before `>`. The `user@commit.fund:` prefix is removed entirely. There SHALL be no space between the prompt `>` and the typed command text.

#### Scenario: Prompt at root shows only `>`
- **WHEN** the current directory is `/`
- **THEN** the input line renders as `>` in default text color, no space before command text

#### Scenario: Prompt in subdirectory shows path then `>`
- **WHEN** the current directory is `/portfolio`
- **THEN** the input line renders as `/portfolio >` with `>` in default text color

#### Scenario: Command history echoes use the same format with no space
- **WHEN** a command is executed and echoed in terminal history
- **THEN** the history line renders as `>command` (no space between `>` and command text)

#### Scenario: Neofetch boot echo uses the new format
- **WHEN** the terminal boots and auto-runs the neofetch echo line
- **THEN** the echoed command renders as `>neofetch` (no space, no prefix)

### Requirement: CLI command blocks have visual spacing
Each command block (prompt + output) SHALL have a `1.5rem` bottom margin on the `.command-output` div. A `.command-output` div SHALL always be emitted after every command, even if the command produces no output (e.g. `cd`), to ensure consistent spacing between command blocks.

#### Scenario: Spacing between consecutive commands
- **WHEN** multiple commands are run
- **THEN** there is a `1.5rem` gap between the end of one command's output and the next command's prompt

#### Scenario: Commands with no output still produce spacing
- **WHEN** a command like `cd` produces no visible output
- **THEN** an empty `.command-output` div is emitted, preserving the `1.5rem` gap

### Requirement: Terminal output area and prompt area are properly separated
The `#terminal-output` div SHALL have `max-height: calc(100vh - 75px)` with `overflow-y: auto`, creating an internal scroll container. The `#input-container` sits below it with `1rem` top and bottom padding. The `.container` has `1.5rem` bottom padding so the prompt never touches the viewport bottom.

#### Scenario: Prompt shadow on scroll
- **WHEN** the terminal output is not scrolled to the bottom
- **THEN** a gradient shadow (8px tall, `rgba(0,0,0,0.5)` to transparent) fades in above the prompt, spanning the full viewport width via a `::before` pseudo-element with `width: 100vw` and `left: -12px`
- **WHEN** the terminal output is scrolled to the bottom
- **THEN** the shadow fades out over 0.3s via CSS `opacity` transition
