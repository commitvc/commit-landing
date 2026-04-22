# Spec — prompt-bar

## Purpose
The `user@commit.fund > _` input line at the bottom of the terminal.

## Requirements

- MUST render three parts in a single row: `<red>user@commit.fund</red>`,
  `<auto-resizing input>`, `<blinking cursor>`.
- MUST auto-resize the input's width to fit its current value (no hard-coded width).
- MUST position the blinking cursor immediately after the input's text cursor;
  updates on `input`, `click`, `keyup`, window resize.
- MUST maintain a command history; Up arrow steps back, Down steps forward.
  New submissions reset the history cursor to the tail.
- MUST invoke `onSubmit(line)` on Enter; clears input afterward.
- MUST invoke `suggest(input)` on Tab and show a single-line inline suggestion
  appended in dim color (same behavior as legacy).
- MUST prepend the current working directory to the prompt (e.g.
  `user@commit.fund:/blog >`), matching legacy `formatPrompt()`.
- MUST remain disabled while `disabled` prop is true (boot animation running).
- MUST NOT capture Tab while the input is unfocused — focus trap only when
  the input is focused.
- SHOULD disable the cursor blink under `prefers-reduced-motion: reduce`
  (render a steady underscore).

## Non-goals
- Multi-line input. Terminal is single-line per submission.
