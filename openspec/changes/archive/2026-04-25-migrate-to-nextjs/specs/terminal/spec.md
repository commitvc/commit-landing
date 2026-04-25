# Spec — terminal

## Purpose
Composes the terminal experience: boot animation, neofetch intro, output log,
and `<PromptBar />`.

## ADDED Requirements

### Requirement: Render in this vertical order
MUST render in this vertical order: `<BootAnimation />` (if not complete), `<Neofetch />`, output log, `<PromptBar />`.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST render in this vertical order: `<BootAnimation />` (if not complete), `<Neofetch />`, output log, `<PromptBar />`.

### Requirement: Track command history and current working directory in component state
MUST track command history and current working directory in component state.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST track command history and current working directory in component state.

### Requirement: Dispatch commands via `lib/commands.ts`; command results are React nodes appended to the
MUST dispatch commands via `lib/commands.ts`; command results are React nodes appended to the output log.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST dispatch commands via `lib/commands.ts`; command results are React nodes appended to the output log.

### Requirement: Expose the following commands with parity to the legacy `index.html`
MUST expose the following commands with parity to the legacy `index.html`: `ls`, `cat`, `cd`, `help`, `clear`, `decrypt`, `secret`, `whois`, `neofetch` (hidden), `email` (interactive), `profile` (hidden), `portfolioProfile` (hidden), `blogPost` (hidden), `legalNotice` (hidden).

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST expose the following commands with parity to the legacy `index.html`: `ls`, `cat`, `cd`, `help`, `clear`, `decrypt`, `secret`, `whois`, `neofetch` (hidden), `email` (interactive), `profile` (hidden), `portfolioProfile` (hidden), `blogPost` (hidden), `legalNotice` (hidden).

### Requirement: Produce byte-identical output strings to the legacy terminal for the non-interactive commands
MUST produce byte-identical output strings to the legacy terminal for the non-interactive commands (verified by snapshot test).

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST produce byte-identical output strings to the legacy terminal for the non-interactive commands (verified by snapshot test).

### Requirement: Use `dangerouslySetInnerHTML` for command output; commands return React nodes directly
MUST NOT use `dangerouslySetInnerHTML` for command output; commands return React nodes directly.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST NOT use `dangerouslySetInnerHTML` for command output; commands return React nodes directly.

### Requirement: Apply `role="log" aria-live="polite"` to the output log
MUST apply `role="log" aria-live="polite"` to the output log.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST apply `role="log" aria-live="polite"` to the output log.

### Requirement: Disable `<PromptBar />` until the boot animation completes (or is skipped under
MUST disable `<PromptBar />` until the boot animation completes (or is skipped under `prefers-reduced-motion`).

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST disable `<PromptBar />` until the boot animation completes (or is skipped under `prefers-reduced-motion`).

### Requirement: Focus the `<PromptBar />` input on mount and on any click within
MUST focus the `<PromptBar />` input on mount and on any click within the terminal container.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST focus the `<PromptBar />` input on mount and on any click within the terminal container.

## Non-goals
- Piping, redirects, or any shell syntax beyond whitespace-separated tokens.
