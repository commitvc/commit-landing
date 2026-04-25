## ADDED Requirements

### Requirement: `whois commit.fund` returns structured metadata about commit
The terminal SHALL support a `whois` command. Running `whois commit.fund` SHALL return a styled block of registration-style metadata, including the Red River West management company relationship. The command SHALL be hidden from `help` output.

#### Scenario: `whois commit.fund` returns structured output
- **WHEN** user runs `whois commit.fund`
- **THEN** the terminal renders a block containing: Domain, Vehicle, Manager (Red River West SAS with address and AMF ref), Focus, and Contact fields

#### Scenario: `whois` does not appear in `help` output
- **WHEN** user runs `help`
- **THEN** `whois` is not listed (hidden: true)

#### Scenario: `whois` with no argument or wrong argument returns usage hint
- **WHEN** user runs `whois` with no argument or a domain other than `commit.fund`
- **THEN** the terminal returns `whois: try 'whois commit.fund'`

### Requirement: `whois` output format mimics RDAP/whois style
The output SHALL be formatted as a monospaced key-value block, consistent with real `whois` command output, using the terminal's existing yellow accent for field labels.

#### Scenario: Output is styled consistently with the terminal
- **WHEN** `whois commit.fund` output renders
- **THEN** field labels are styled in yellow, values in default terminal colour, consistent with `neofetch` output style
