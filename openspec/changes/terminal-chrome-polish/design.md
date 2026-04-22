## Context

Single-file vanilla HTML/CSS/JS site (`index.html`). Two adjacent visual regressions in the terminal's chrome: the top-of-page "highlights" box looks dated, and the prompt lost its host prefix. Both touch the same file, both concern the neofetch metaphor, and together they're a small, self-contained polish pass.

Relevant current state:

- `index.html:44-72` — three `<pre class="ascii-box *">` variants renders the `+-----+` box around Activity / Focus / Stage / Github. Mobile breakpoint already drops the box and uses horizontal rules only.
- `index.html:897-899` — `formatPrompt(path)` returns a bare `>` or `<path> >`, no host prefix.
- `index.html:1085` — hardcoded `>neofetch` echo for the boot sequence; bypasses `formatPrompt`.
- `index.html:1930-1936` — `.neofetch-rule` is a `<span>` wrapping a long literal dash string, clipped by `white-space: nowrap; overflow: hidden`. Used in six places: the mobile highlights (×2), profile cards (×2), portfolio profile cards (×2).
- `openspec/specs/prompt-format/spec.md` — current spec explicitly says the host prefix is removed. This proposal reverts that decision.

## Goals / Non-Goals

**Goals:**
- One unified highlights layout across all breakpoints — no responsive variants for the box itself
- Rules that fit their container at any width, edge-to-edge, without hand-counted dash strings
- Red `user@commit.fund ` host prefix on every prompt (live input, history echoes, boot echo), space separator, no colon
- A single place (`formatPrompt`) owns the prompt format

**Non-Goals:**
- Side-by-side "real neofetch" layout (logo LEFT, highlights RIGHT) — rejected for this pass; would be a separate, larger change
- Unicode rounded box (`╭─╮ │ ╰─╯`) — rejected, we're leaning into the rules-only direction rather than a softer box
- Per-tab prompt colors or per-path prompts (`$` for regular user, `#` for root, etc.)
- Changing the figlet logo or the Activity/Focus/Stage/Github copy itself

## Decisions

**1. Rules-only, not a box**

The ASCII `+---+` rectangle fights the figlet logo above it for visual weight. Promoting the mobile treatment (two horizontal rules, no verticals, no corners) to all breakpoints gives the figlet room to breathe and deletes two hand-maintained responsive variants.

Alternatives considered:
- **Unicode rounded box** (`╭─╮ │ ╰─╯`) — lighter than ASCII `+---+` but still a box; still demands three responsive variants to keep right-side verticals aligned. Same class of problem.
- **Neofetch two-column** (figlet LEFT, data RIGHT) — most authentic to the metaphor, highest identity payoff, but a significantly larger layout change with its own mobile stacking story. Punted to a potential future change.

**2. CSS-bordered rule, not a literal dash string**

The current `.neofetch-rule` pads a `-` string to ~160 characters and relies on `overflow: hidden` to clip it. This works but is fragile (the dash count has to out-scale the widest viewport) and it doesn't extend edge-to-edge within containers narrower than the overfill. Replacing with:

```css
.neofetch-rule {
  display: block;
  border-top: 1px dashed rgba(200, 208, 242, 0.4);
  margin: 6px 0;
}
```

…and emptying the `<span>` content gives us a true edge-to-edge rule at any width. Same visual character (dashed, same color, same spacing) — just reliable.

Alternatives:
- **Solid border** (`border-top: 1px solid`) — crisper but diverges from the dashed ASCII look the rest of the site uses.
- **Keep literal dashes** — matches the "pure ASCII" aesthetic but perpetuates the alignment fragility that triggered this change.

**3. `user@commit.fund ` in red, no colon, space separator**

Previous version used `user@commit.fund:` (colon, no space). Reading it back, the colon adjacent to `>` reads like an emoji (`:>`). A space separator reads more clearly and the red color carries the boundary visually.

Alternatives:
- **`user@commit.fund:>`** — the literal old format; rejected for the emoji reading.
- **`user@commit.fund:~ >`** — bash-style with `~` for root; changes more than we need.
- **Keep the bare `>`** — the current state; this change exists specifically to walk that back.

**4. Host prefix lives in `formatPrompt`**

Four of the five prompt-rendering sites already call `formatPrompt`. Folding the prefix into the helper means three sites update for free and we only touch the one bypassing callsite (`index.html:1085`). Alternative: define a `HOST_PREFIX` constant and concatenate at each callsite. Rejected — strictly more code and more places to forget.

**5. This change reverts a prior spec decision**

The existing `prompt-format` spec explicitly said the host prefix is removed and reserves red for the tab bar's active `>`. The tab bar rule still holds (the active `>` remains red-coded for tabs). The new red host prefix is a different element — same color, different role. Worth noting in the spec's MODIFIED block so the reversal is intentional and legible.
