## Why

The `prompt-format` capability in `openspec/specs/prompt-format/spec.md` describes a state the codebase never reached. The spec says: "When the current directory is `/`, the prompt is `>` alone. … The `user@commit.fund:` prefix is removed entirely." But the live code (`components/cli-terminal/PromptBar.tsx` and `PromptEcho.tsx`) renders:

- `user@commit.fund>` at root
- `user@commit.fund/companies>` in subdirectory (the `:` separator was just removed, but the host prefix stays)

Two readings of how to reconcile this drift exist:

1. **(i) Finish what the spec proposed**: drop `user@commit.fund` entirely from the prompt; have it render `>` alone at root and `/companies >` in subdirectories.
2. **(ii) Amend the spec to current reality**: the host prefix stays as the prompt's left side; the `:` separator is removed; format is `user@commit.fund>` and `user@commit.fund<path>>`.

This change ships **option (ii)**. The `user@commit.fund` host prefix is on every screenshot in marketing, on the OG card image, and in the existing CLI's visual identity. Removing it now would cost more than it gains. The `:` removal (just shipped) was the cleaner sub-edit to land instead.

## What Changes

- **MODIFIED**: the first requirement of `prompt-format` no longer claims the `user@commit.fund:` prefix is removed. Instead it states that the host prefix `user@commit.fund` is the canonical left side of the prompt, with the path appended directly (no colon, no space) when in a subdirectory.
- **MODIFIED**: the scenarios for "prompt at root" and "prompt in subdirectory" are rewritten to match.
- **MODIFIED**: the "Command history echoes use the same format" scenario is rewritten to acknowledge the host prefix.
- **MODIFIED**: the "Neofetch boot echo uses the new format" scenario is rewritten so the echo includes the host prefix.

The remaining two requirements (`CLI command blocks have visual spacing`, `Terminal output area and prompt area are properly separated`) are unaffected and stay as-is.

## Capabilities

### Modified Capabilities

- `prompt-format`: rewriting the first requirement and its four scenarios to reflect the shipped reality (`user@commit.fund>` host prefix, no colon).
