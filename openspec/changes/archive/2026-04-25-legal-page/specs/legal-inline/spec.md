## ADDED Requirements

### Requirement: `legal.txt` exists in the `about/` virtual filesystem
The virtual filesystem in `index.html` SHALL contain a `legal.txt` file inside the `about/` directory, with the full English legal notice as its content.

#### Scenario: `ls about/` lists legal.txt
- **WHEN** user runs `ls about` or `ls /about`
- **THEN** `legal.txt` is listed alongside other about directory entries

#### Scenario: `cd about` then `ls` lists legal.txt
- **WHEN** user navigates to `/about` and runs `ls`
- **THEN** `legal.txt` appears in the directory listing

### Requirement: `cat about/legal.txt` renders the full legal notice inline
Running `cat about/legal.txt` SHALL render the complete legal notice inline in the terminal — no truncation, no teaser. The full document is displayed.

#### Scenario: Full content renders via cat
- **WHEN** user runs `cat about/legal.txt`
- **THEN** the terminal renders the complete legal notice content via the `legalNotice` renderer

#### Scenario: Partial path returns not-found error
- **WHEN** user runs `cat legal.txt` from the root directory `/`
- **THEN** the terminal returns `cat: legal.txt: No such file or directory`

### Requirement: Clicking `legal.txt` in the about tab renders the full legal notice inline
Clicking `legal.txt` in the about tab file tree SHALL render the full legal notice inline using the `legalNotice` renderer.

#### Scenario: File click renders full content
- **WHEN** user clicks `legal.txt` in the about tab
- **THEN** the terminal renders the complete legal notice inline

### Requirement: Inline legal notice includes an "Open in full page" button
The inline-rendered legal notice SHALL include an "Open in full page" button at the bottom, linking to `legal.html` with `target="_blank"`.

#### Scenario: "Open in full page" button links to static page
- **WHEN** the legal notice is rendered inline in the terminal
- **THEN** an "Open in full page" button is visible at the bottom, and clicking it opens `commit.fund/legal.html` in a new tab

### Requirement: `legalNotice` renderer formats sections with headings
The `legalNotice` renderer SHALL parse the legal text into sections and render them with styled headings (consistent with the terminal's existing yellow/red accent pattern) and paragraph body text, rather than raw `<pre>` output.

#### Scenario: Section headings are visually distinct
- **WHEN** the legal notice is rendered inline
- **THEN** section titles (e.g. "Site Ownership", "Complaints Procedure") are rendered as styled headings, distinguishable from body text
