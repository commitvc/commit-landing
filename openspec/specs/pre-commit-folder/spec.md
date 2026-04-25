# pre-commit-folder Specification

## Purpose
Defines how the virtual filesystem represents the historical pre-commit portfolio: the folder name (`pre-commit/` not `roots/`), the per-company `.txt` files, and the rendering rule that a story blurb appears above the standard portfolio card.

## Requirements
### Requirement: `pre-commit/` replaces `roots/` in the virtual filesystem
The virtual filesystem SHALL contain `pre-commit/` under `portfolio/` in place of `roots/`. The `about.txt` folder-level description file SHALL be removed. Each company SHALL have its own `.txt` file.

#### Scenario: `ls portfolio/` lists `pre-commit/`
- **WHEN** user runs `ls portfolio`
- **THEN** `pre-commit/` appears in the listing and `roots/` does not

#### Scenario: `ls portfolio/pre-commit/` lists all company files
- **WHEN** user runs `ls portfolio/pre-commit`
- **THEN** all ten company `.txt` files are listed: `twenty.txt`, `sourcebot.txt`, `pyannote.txt`, `pangolin.txt`, `whitecircle.txt`, `keep.txt`, `pandasai.txt`, `mastra.txt`, `better-auth.txt`, `graphcore.txt`

#### Scenario: `about.txt` no longer exists in the folder
- **WHEN** user runs `cat portfolio/pre-commit/about.txt`
- **THEN** the terminal returns a not-found error

### Requirement: Each `pre-commit/` company file renders a story blurb above the portfolio card
Clicking a company file in the portfolio tab or running `cat portfolio/pre-commit/<name>.txt` SHALL render the story blurb (two paragraphs) above the standard portfolio card fields.

#### Scenario: Story blurb renders above card
- **WHEN** user views a `pre-commit/` company file
- **THEN** the two-paragraph story is displayed first, followed by the portfolio card (Company, One-Liner, Website, Github)

#### Scenario: Two paragraphs are visually separated
- **WHEN** the story blurb renders
- **THEN** the intro sentence ("Before >commit...") and the custom sentence are separated by a visible line break

### Requirement: Physical directory `portfolio/roots/` is renamed to `portfolio/pre-commit/`
The physical directory on disk SHALL be renamed. All company logo PNGs SHALL move to `portfolio/pre-commit/`. All `Avatar:` fields in company `.txt` files SHALL reference `portfolio/pre-commit/<name>.png`.

#### Scenario: Logo images load correctly after rename
- **WHEN** a company card renders in the terminal
- **THEN** the company logo image loads without a 404 error

## Company content (source of truth)

### twenty.txt
```
Story: Before >commit, the team spent years backing open-source founders and companies.

Twenty showed us how open source could redefine entire business application categories through community momentum and bottom-up distribution.
Company: Twenty
One-Liner: Open source CRM
Website: https://twenty.com
Github: https://github.com/twentyhq/twenty
Avatar: portfolio/pre-commit/twenty.png
```

### sourcebot.txt
```
Story: Before >commit, the team spent years backing open-source founders and companies.

Sourcebot showed us that code search and intelligence, built openly, can become essential infrastructure for the next generation of developer platforms.
Company: Sourcebot
One-Liner: Open source code search and intelligence
Website: https://sourcebot.dev
Github: https://github.com/sourcebot-dev/sourcebot
Avatar: portfolio/pre-commit/sourcebot.png
```

### pyannote.txt
```
Story: Before >commit, the team spent years backing open-source founders and companies.

pyannote showed us that the most impactful open-source projects are often invisible to the end user, quietly powering entire ecosystems of voice and audio intelligence.
Company: pyannote
One-Liner: Open source speaker diarization
Website: https://pyannote.ai
Github: https://github.com/pyannote/pyannote-audio
Avatar: portfolio/pre-commit/pyannote.png
```

### pangolin.txt
```
Story: Before >commit, the team spent years backing open-source founders and companies.

Pangolin showed us the remarkable scale of demand for open, self-hosted networking infrastructure that is privacy-first by design and not by marketing.
Company: Pangolin
One-Liner: Open source self-hosted tunneling
Website: https://pangolin.network
Github: https://github.com/fosrl/pangolin
Avatar: portfolio/pre-commit/pangolin.png
```

### whitecircle.txt
```
Story: Before >commit, the team spent years backing open-source founders and companies.

White Circle showed us how critical it is to observe and guardrail AI systems in the age of LLMs, and that community-driven benchmarks can define standards beyond the boundaries of pure open source.
Company: White Circle
One-Liner: AI observability and guardrails
Website: https://whitecircle.ai
Github: $github
Avatar: portfolio/pre-commit/whitecircle.png
```

### keep.txt
```
Story: Before >commit, the team spent years backing open-source founders and companies.

Keep showed us that even in a commoditized space, an MIT licensed and community rooted platform can monetize by solving real developer problems, and become a powerful path to acquisition.
Company: Keep
One-Liner: Open source alerting and observability
Website: $website
Github: $github
Avatar: portfolio/pre-commit/keep.png
```

### pandasai.txt
```
Story: Before >commit, the team spent years backing open-source founders and companies.

PandasAI showed us the compounding power of bringing AI capabilities to the libraries developers already live inside, turning existing ecosystems into launchpads for entirely new workflows.
Company: PandasAI
One-Liner: AI-powered data analysis on pandas
Website: https://pandas-ai.com
Github: https://github.com/Sinaptik-AI/pandas-ai
Avatar: portfolio/pre-commit/pandasAI.png
```

### mastra.txt
```
Story: Before >commit, the team spent years backing open-source founders and companies.

Mastra showed us how an opinionated open-source framework can define an entire category before it fully exists, and revealed the remarkable power of building community conviction through education and writing at scale.
Company: Mastra
One-Liner: TypeScript AI agent framework
Website: https://mastra.ai
Github: https://github.com/mastra-ai/mastra
Avatar: portfolio/pre-commit/mastra.png
```

### better-auth.txt
```
Story: Before >commit, the team spent years backing open-source founders and companies.

Better Auth showed us how to reimagine a crowded category in a way that puts full ownership back in developers' hands. It also reminded us that open source knows no borders.
Company: Better Auth
One-Liner: TypeScript authentication library
Website: https://better-auth.com
Github: https://github.com/better-auth/better-auth
Avatar: portfolio/pre-commit/better-auth.png
```

### graphcore.txt
```
Story: Before >commit, the team spent years backing open-source founders and companies.

Graphcore showed us that in AI infrastructure, the openness of the toolchain and the strength of the developer community matter as much as the hardware itself.
Company: Graphcore
One-Liner: AI hardware and open toolchain
Website: https://graphcore.ai
Github: https://github.com/graphcore
Avatar: portfolio/pre-commit/graphcore.png
```

*Note: `$website` and `$github` are stealth placeholders (renders grayed out with `cursor: not-allowed` per existing portfolio convention). Fill in Keep and White Circle URLs when available.*
