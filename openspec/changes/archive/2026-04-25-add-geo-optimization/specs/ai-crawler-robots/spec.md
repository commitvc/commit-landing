## ADDED Requirements

### Requirement: `/robots.txt` lists explicit `Allow` blocks for major AI crawlers ahead of the catch-all

The robots.txt SHALL contain `User-Agent` blocks for each of the named AI crawlers, each with `Allow: /`, before the catch-all `User-Agent: *` `Allow: /` block.

#### Scenario: robots.txt is reachable

- **WHEN** an agent fetches `/robots.txt`
- **THEN** the response status is 200 and the body is plain text

#### Scenario: named AI bots appear before the wildcard

- **WHEN** the file is parsed top-to-bottom
- **THEN** the first `User-Agent: *` directive appears AFTER the last named-bot block

### Requirement: The named-bot list covers the canonical 17

The named blocks SHALL include (in any order, but each present): `GPTBot`, `ChatGPT-User`, `OAI-SearchBot`, `ClaudeBot`, `anthropic-ai`, `Claude-Web`, `PerplexityBot`, `Perplexity-User`, `Google-Extended`, `Applebot-Extended`, `CCBot`, `Bytespider`, `Amazonbot`, `DuckAssistBot`, `FacebookBot`, `meta-externalagent`, `Diffbot`.

#### Scenario: every named bot is present

- **WHEN** the file is grep'd for `User-Agent: <bot>`
- **THEN** each of the 17 names matches at least once

#### Scenario: each named block has Allow: /

- **WHEN** any named-bot block is parsed
- **THEN** it contains exactly `Allow: /` (no `Disallow` directives in the named blocks)

### Requirement: Catch-all block remains permissive

The wildcard `User-Agent: *` block SHALL declare `Allow: /` (no `Disallow` directives, no path restrictions). All non-named user agents are welcome to crawl the site by default.

#### Scenario: wildcard Allow

- **WHEN** the `User-Agent: *` block is parsed
- **THEN** it contains `Allow: /`

### Requirement: Sitemap directive is present

The robots.txt SHALL include a `Sitemap: https://commit.fund/sitemap.xml` directive so crawlers can discover the canonical sitemap URL.

#### Scenario: sitemap line at file end

- **WHEN** the file is read
- **THEN** it contains `Sitemap: https://commit.fund/sitemap.xml` (anywhere — Next.js puts it at the end)

### Requirement: robots.txt is generated from `app/robots.ts`, not hand-written

The file SHALL be produced by Next.js's `MetadataRoute.Robots` export so the canonical site URL and the AI-bot list stay in code rather than a hand-edited `public/robots.txt`. This means a single source of truth for both the bot list and the sitemap URL.

#### Scenario: app/robots.ts emits the named list

- **WHEN** `app/robots.ts` is read
- **THEN** it exports a `default` function returning `{ rules: [...AI_BOTS.map(...), { userAgent: '*', allow: '/' }], sitemap: '<URL>' }` where `AI_BOTS` is a constant array of the 17 names
