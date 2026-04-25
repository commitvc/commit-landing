## Why

Several pieces of feedback converged on the same underlying issue: the terminal's identity signals are inconsistent or incomplete. The prompt character sends the wrong cultural signal, the relationship to Red River West is invisible, the pre-history that shaped commit's thesis has no narrative, and a key easter egg opportunity is missing. This change tightens all of it.

## What Changes

- **Prompt** — Replace `user@commit.fund:/ >` with `>` only. The `>` is commit's brand prefix and the cleanest possible terminal prompt. Path context is preserved when navigating subdirectories.
- **`pre-commit/` folder** — Rename `portfolio/roots/` to `portfolio/pre-commit/` in both the physical directory and the virtual filesystem. Replace the `about.txt` folder description with individual story entries per company — each combining a narrative blurb with the existing portfolio card format.
- **`whois` command** — Add a `whois` easter egg command. Running `whois commit.fund` returns RDAP-style output disclosing commit's relationship to Red River West. Discoverable only by developers who think to type it.
- **RRW mention in `about/readme.txt`** — Add one sentence at the end of the about readme: ">commit is part of the Red River West family and is the early-stage investment vehicle focused on commercial open source startups."
- **LinkedIn on team profiles** — Add a `LinkedIn` field to each team member `.txt` file (URLs to be provided separately).

## Capabilities

### New Capabilities

- `whois-command`: Terminal easter egg command returning commit.fund registration metadata including the Red River West management company relationship

### Modified Capabilities

- `tab-navigation`: Prompt format changes from `user@commit.fund:/ >` to `>` (affects prompt rendering everywhere in the terminal)
- `pre-commit-folder`: Rename of `roots/` to `pre-commit/` with narrative content per company; replaces the folder-level `about.txt`

## Impact

- `index.html`: prompt render logic, virtual filesystem (`roots/` → `pre-commit/`), new `whois` command, `about/readme.txt` content, team profile fields
- Physical directory: `portfolio/roots/` → `portfolio/pre-commit/` rename
- LinkedIn URLs pending — spec includes the field; content filled in once URLs are provided
