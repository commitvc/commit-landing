# llms.txt Generation Report: commit.fund

**Generated:** 2026-04-25
**Mode:** Generation (no existing `llms.txt` was found at `http://localhost:8000/llms.txt` — returned 404)
**File written to:** `public/llms.txt` → will be served at `https://commit.fund/llms.txt`

---

## What was generated

A 7-section, ~70-line `llms.txt` covering 30 pages — exactly at the upper bound of the spec's 10–30-entry recommendation. The file is built from the live `<title>` and `<meta name="description">` of every page in `app/sitemap.ts`, plus partner descriptions extracted from the `Person` JSON-LD schemas already present on `/team/<slug>/` pages.

### Sections

| Section          | Entries | Purpose |
|------------------|---------|---------|
| About            | 5       | Top-level orientation pages — the front door for any AI looking up the fund |
| Team             | 4       | Each partner / tech lead with one-sentence credentialing |
| Portfolio (Fund I) | 1     | UMA — the only company at `/companies/<slug>/` rather than `/companies/pre-commit/<slug>/` |
| Pre-commit         | 10    | Companies the team backed before the fund — everything under `/companies/pre-commit/` |
| Essays           | 8       | All long-form blog posts, ordered by inferred importance (next-decade and browser-redefined first — those have the deepest content) |
| Key Facts        | —       | Disambiguation block: name aliases, parent firm, stage, geography, team, notable IPOs |
| Contact          | 6 links | Website + every `sameAs` from the Org/Person schemas |

### How pages were prioritized

- **Always-include kicked in for:** homepage section equivalent (covered by /about), team, blog, companies, contact-equivalent (covered by Key Facts + Contact).
- **High-quality include kicked in for:** every blog post (8/8 included — they're all long-form and substantive), every portfolio company (11/11 included), every team member (4/4).
- **Skipped:** `/cli/` is included but with a note that it's a presentation surface, not unique content. The homepage `/` itself is intentionally not its own entry — its content is mirrored across About + Companies + Team and the homepage adds no static text (only ~8 words; see the GEO audit).
- **Borderline / not included:** none. The site is small enough that the 30-entry budget covers everything.

---

## Three deliberate choices worth flagging

### 1. The brand is rendered as `>commit` in the title

The schema on every page uses `Organization.name = "commit"`, but the people in `Person.worksFor.name` use `">commit"`, and partner job titles say `Partner at >commit`. Title tags use plain `commit`. The brand is genuinely ambiguous in the source data.

I chose `# >commit` as the H1 of the file because (a) it preserves the brand identity, (b) the description's `Also known as: commit fund, commit VC` immediately disambiguates from the verb "commit" / `git commit`, and (c) AI tokenizers can keep the `>` even if some normalize it away — there's no downside to having both forms.

If you'd rather flip this, change the first line to `# commit` and adjust the description's alias list. Decide by which form you want AI-generated answers about the fund to use as the primary reference.

### 2. The portfolio split follows the URL convention literally

`/companies/pre-commit/<slug>/` = companies the team backed *before* >commit Fund I (10 entries: Mastra, Twenty, Better Auth, Sourcebot, pyannote, Pangolin, White Circle, Keep, PandasAI, Graphcore). `/companies/<slug>/` = current Fund I (UMA only, at the moment). This was confirmed with the user after the first draft.

The Pre-commit section header reads "Pre-commit (companies the team backed before the fund)" so AI doesn't mistake "Mastra" for a current >commit position when answering portfolio questions.

---

## Validation

I checked each rule from the spec against the generated file:

| Element | Status | Notes |
|---|---|---|
| H1 title | ✅ | `# >commit` |
| Description blockquote | ✅ | 169 chars, includes alias list |
| ≥1 H2 section | ✅ | 7 sections |
| Page entries | ✅ | 28 page entries + Key Facts + Contact |
| Absolute URLs | ✅ | All `https://commit.fund/...` |
| Descriptions on every entry | ✅ | All 10–35 words |
| Key Facts | ✅ | Present |
| Contact | ✅ | Present |
| Length | ✅ | ~70 lines, well under the 150-line concise cap |
| Markdown | ✅ | Single `#`, `##`, `>`, `- [text](url): desc` throughout |

URL reachability was *not* tested against `https://commit.fund` (only against the local dev mirror). Run `curl -I https://commit.fund/<path>` against each URL once the file is deployed to confirm 200s on production.

---

## Recommended cadence

- **Add to llms.txt every time you publish:** a new blog post, a new portfolio company, a new team member, or change partner roles.
- **Audit quarterly:** run `/geo-llmstxt https://commit.fund` (analysis mode) once a quarter to verify nothing has gone stale.
- **No `llms-full.txt` needed yet.** The current file already contains every public page on the site — there's nothing left to put in a "full" version. Revisit once the company count or essay count crosses ~50.

---

## Deployment

The file is at `public/llms.txt`. Next.js serves files in `public/` at the URL root with no further config — `https://commit.fund/llms.txt` will work as soon as you redeploy.

After deploy, verify with:

```
curl -sSI https://commit.fund/llms.txt
# expect: HTTP/2 200, content-type: text/plain (or text/markdown)
```

If your CDN strips `.txt` MIME or adds aggressive caching, set explicit headers in `next.config.mjs`:

```js
async headers() {
  return [{
    source: '/llms.txt',
    headers: [
      { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
      { key: 'Cache-Control', value: 'public, max-age=3600' },
    ],
  }];
}
```

---

## What this fixes from the GEO audit

This addresses **Issue #3 (High Priority)** from `GEO-AUDIT-REPORT.md`. Estimated GEO score lift: **+4 points** (from 56 to ~60). The audit listed it as a Week-1 task in the 30-day plan; consider that step done after deploy.
