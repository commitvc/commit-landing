# Spec — terminal

## Purpose
Composes the terminal experience: boot animation, neofetch intro, output log,
and `<PromptBar />`.

## Requirements

- MUST render in this vertical order: `<BootAnimation />` (if not complete),
  `<Neofetch />`, output log, `<PromptBar />`.
- MUST track command history and current working directory in component state.
- MUST dispatch commands via `lib/commands.ts`; command results are React
  nodes appended to the output log.
- MUST expose the following commands with parity to the legacy `index.html`:
  `ls`, `cat`, `cd`, `help`, `clear`, `decrypt`, `secret`, `whois`,
  `neofetch` (hidden), `email` (interactive), `profile` (hidden),
  `portfolioProfile` (hidden), `blogPost` (hidden), `legalNotice` (hidden).
- MUST produce byte-identical output strings to the legacy terminal for
  the non-interactive commands (verified by snapshot test).
- MUST NOT use `dangerouslySetInnerHTML` for command output; commands return
  React nodes directly.
- MUST apply `role="log" aria-live="polite"` to the output log.
- MUST disable `<PromptBar />` until the boot animation completes (or is
  skipped under `prefers-reduced-motion`).
- MUST focus the `<PromptBar />` input on mount and on any click within the
  terminal container.

## Non-goals
- Piping, redirects, or any shell syntax beyond whitespace-separated tokens.
