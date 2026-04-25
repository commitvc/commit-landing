## ADDED Requirements

### Requirement: Blog tab renders post list as file tree
The terminal SHALL render a `blog` tab that displays blog posts as `.txt` files inside a virtual `blog/` directory tree, consistent with the portfolio and team tab pattern.

#### Scenario: Blog tab shows post files
- **WHEN** user clicks the `blog` tab
- **THEN** the terminal renders a file tree rooted at `blog/` listing all post `.txt` files

#### Scenario: Blog tab is empty state
- **WHEN** the `blog/` virtual directory has no files
- **THEN** the terminal renders the tree with an empty directory (no error)

### Requirement: Clicking a blog post file renders it inline with an "Open in full page" button
When a user clicks a post file in the blog tab tree (or runs `cat blog/<slug>.txt`), the system SHALL render the post content inline inside the terminal. At the bottom of the rendered post, a styled "Open in full page" button SHALL link to the post's static URL (`URL:` field), opening it in a new tab.

#### Scenario: Post file click renders inline
- **WHEN** user clicks a `.txt` file in the blog tab tree
- **THEN** the terminal renders the post's title, date, and full body content inline as a `blogPost` card

#### Scenario: Inline post renders teaser only, not full body
- **WHEN** a blog post is rendered inline in the terminal
- **THEN** the card shows title, date, and excerpt — the full article body is NOT included (it lives only on the static page)

#### Scenario: "Open in full page" button is present at bottom of inline post
- **WHEN** a blog post is rendered inline in the terminal
- **THEN** an "Open in full page" button is visible at the bottom of the rendered card, linking to the `URL:` field value with `target="_blank"`

#### Scenario: Post file without URL field renders inline without the button
- **WHEN** user clicks a `.txt` file that has no `URL:` field
- **THEN** the terminal renders the file content inline with no "Open in full page" button

### Requirement: CLI `cat blog/<slug>.txt` shows teaser
The `cat` command SHALL render a teaser card for blog post files, showing title, date, excerpt, and a clickable link to the full article URL.

#### Scenario: cat on a blog post file
- **WHEN** user runs `cat blog/<slug>.txt` in the CLI
- **THEN** the terminal renders a styled teaser card with title, date, excerpt, and a `<a href>` link to the full post URL

#### Scenario: cat on a non-existent blog post file
- **WHEN** user runs `cat blog/<slug>.txt` for a file that does not exist
- **THEN** the terminal returns the standard not-found error: `cat: blog/<slug>.txt: No such file or directory`

### Requirement: Virtual filesystem contains `blog/` directory
The in-memory virtual filesystem in `index.html` SHALL include a `blog/` directory at the root, populated with one `.txt` entry per published post.

#### Scenario: `ls /blog` lists post files
- **WHEN** user runs `ls blog` or `ls /blog` in the CLI
- **THEN** all published post `.txt` filenames are listed

#### Scenario: `cd blog` navigates into blog directory
- **WHEN** user runs `cd blog`
- **THEN** the current directory becomes `/blog` and the prompt updates accordingly
