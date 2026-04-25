# prompt-format Specification

## Purpose
Defines the visible format of the CLI terminal prompt and command echoes — the host prefix, the working-directory path, the `>` glyph, and the spacing rules between them. The prompt is the most-typed surface on the site and its visual rhythm is part of the brand.

## Requirements
### Requirement: Terminal prompt displays `>` in default text color
The terminal prompt SHALL render with `user@commit.fund` as a constant left-hand prefix (in the prompt's pink/highlight colour), followed directly (no colon, no space) by the current working directory if it is not `/`, followed by `>` in the default terminal text colour (`#c8d0f2` — NOT red; the red `>` is reserved exclusively for the active tab prefix in the tab bar). There SHALL be no space between the `>` and the typed command text, nor between the host prefix and the path.

#### Scenario: Prompt at root shows `user@commit.fund>`
- **WHEN** the current directory is `/`
- **THEN** the input line renders as `user@commit.fund>` with `user@commit.fund` in the prompt highlight colour and `>` in the default terminal text colour, no path between them, no space before the typed command

#### Scenario: Prompt in subdirectory shows host directly followed by path then `>`
- **WHEN** the current directory is `/companies`
- **THEN** the input line renders as `user@commit.fund/companies>` (no colon, no space between the host and the path, no space between the path and `>`)

#### Scenario: Command history echoes use the same format
- **WHEN** a command is executed and echoed in terminal history
- **THEN** the history line renders as `user@commit.fund<path>><command>` with the same format as the live prompt and no space between `>` and the command text

#### Scenario: Neofetch boot echo uses the same format
- **WHEN** the terminal boots and auto-runs the neofetch echo line on the homepage WelcomeHeader (desktop branch only)
- **THEN** the echoed command renders as `user@commit.fund>neofetch` (host prefix, no path because it is at root, no space, no colon)

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
