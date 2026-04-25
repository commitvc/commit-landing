## 1. Reconcile the spec with shipped reality

- [x] 1.1 Rewrite the first requirement of `prompt-format` to declare `user@commit.fund` as the canonical host prefix
- [x] 1.2 Rewrite the four scenarios under it: prompt at root, prompt in subdirectory, command echo, neofetch echo
- [x] 1.3 Confirm the remaining two requirements (`CLI command blocks have visual spacing`, `Terminal output area …`) are unchanged
- [x] 1.4 Verify the live code matches the amended spec by inspection of `PromptBar.tsx` + `PromptEcho.tsx`

## 2. Verification

- [x] 2.1 Visit `/cli/`, run `cd companies`, run `ls` — observe `user@commit.fund/companies>ls` and matching echo
- [x] 2.2 Confirm root prompt renders as `user@commit.fund>` with no `:` and no space before `>`
