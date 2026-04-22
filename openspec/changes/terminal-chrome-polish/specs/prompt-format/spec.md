## MODIFIED Requirements

### Requirement: Terminal prompt displays red `user@commit.fund ` host prefix before `>`
The terminal prompt SHALL render a red `user@commit.fund` host prefix followed by a single space before the `>` character. The `>` itself SHALL remain in the default terminal text color (`#c8d0f2`) — red is applied only to the host prefix, not to the prompt symbol. No colon SHALL appear between the host prefix and the rest of the prompt. When the current directory is `/`, the prompt is `user@commit.fund >`. When in a subdirectory, the current path is shown between the host prefix and the `>`, rendered as `user@commit.fund <path> >`. There SHALL be no space between the prompt `>` and the typed command text.

The red `>` used as the active-tab prefix in the tab bar is unaffected by this requirement and continues to render in red — the two uses are distinct elements that happen to share the color.

#### Scenario: Prompt at root shows host prefix and `>`
- **WHEN** the current directory is `/`
- **THEN** the input line renders as `user@commit.fund >` with `user@commit.fund` in red and `>` in default text color, no colon, single space between prefix and `>`, no space before the command text

#### Scenario: Prompt in subdirectory shows host prefix, path, then `>`
- **WHEN** the current directory is `/portfolio`
- **THEN** the input line renders as `user@commit.fund /portfolio >` with `user@commit.fund` in red, `/portfolio >` in default text color

#### Scenario: Command history echoes carry the host prefix
- **WHEN** a command is executed and echoed in terminal history
- **THEN** the history line renders as `user@commit.fund >command` at root, or `user@commit.fund <path> >command` in a subdirectory, with no space between `>` and the command text

#### Scenario: Neofetch boot echo uses the new format
- **WHEN** the terminal boots and auto-runs the neofetch echo line
- **THEN** the echoed command renders as `user@commit.fund >neofetch` with `user@commit.fund` in red and no space between `>` and `neofetch`

#### Scenario: Host prefix is owned by the central prompt helper
- **WHEN** any terminal output renders a prompt (live input, history echo, boot echo)
- **THEN** the host prefix is produced by the `formatPrompt()` helper, not concatenated at individual callsites
