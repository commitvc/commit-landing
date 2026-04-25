# Spec — prompt-bar

## Purpose
The `user@commit.fund > _` input line at the bottom of the terminal.

## ADDED Requirements

### Requirement: Render three parts in a single row
MUST render three parts in a single row: `<red>user@commit.fund</red>`, `<auto-resizing input>`, `<blinking cursor>`.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST render three parts in a single row: `<red>user@commit.fund</red>`, `<auto-resizing input>`, `<blinking cursor>`.

### Requirement: Auto-resize the input's width to fit its current value (no hard-coded width)
MUST auto-resize the input's width to fit its current value (no hard-coded width).

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST auto-resize the input's width to fit its current value (no hard-coded width).

### Requirement: Position the blinking cursor immediately after the input's text cursor; updates on
MUST position the blinking cursor immediately after the input's text cursor; updates on `input`, `click`, `keyup`, window resize.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST position the blinking cursor immediately after the input's text cursor; updates on `input`, `click`, `keyup`, window resize.

### Requirement: Maintain a command history; Up arrow steps back, Down steps forward
MUST maintain a command history; Up arrow steps back, Down steps forward. New submissions reset the history cursor to the tail.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST maintain a command history; Up arrow steps back, Down steps forward. New submissions reset the history cursor to the tail.

### Requirement: Invoke `onSubmit(line)` on Enter; clears input afterward
MUST invoke `onSubmit(line)` on Enter; clears input afterward.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST invoke `onSubmit(line)` on Enter; clears input afterward.

### Requirement: Invoke `suggest(input)` on Tab and show a single-line inline suggestion appended in
MUST invoke `suggest(input)` on Tab and show a single-line inline suggestion appended in dim color (same behavior as legacy).

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST invoke `suggest(input)` on Tab and show a single-line inline suggestion appended in dim color (same behavior as legacy).

### Requirement: Prepend the current working directory to the prompt (e.g
MUST prepend the current working directory to the prompt (e.g. `user@commit.fund:/blog >`), matching legacy `formatPrompt()`.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST prepend the current working directory to the prompt (e.g. `user@commit.fund:/blog >`), matching legacy `formatPrompt()`.

### Requirement: Remain disabled while `disabled` prop is true (boot animation running)
MUST remain disabled while `disabled` prop is true (boot animation running).

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST remain disabled while `disabled` prop is true (boot animation running).

### Requirement: Capture Tab while the input is unfocused — focus trap only when
MUST NOT capture Tab while the input is unfocused — focus trap only when the input is focused.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST NOT capture Tab while the input is unfocused — focus trap only when the input is focused.

### Requirement: Disable the cursor blink under `prefers-reduced-motion
The migration SHALL ensure: SHOULD disable the cursor blink under `prefers-reduced-motion: reduce` (render a steady underscore).

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** SHOULD disable the cursor blink under `prefers-reduced-motion: reduce` (render a steady underscore).

## Non-goals
- Multi-line input. Terminal is single-line per submission.
