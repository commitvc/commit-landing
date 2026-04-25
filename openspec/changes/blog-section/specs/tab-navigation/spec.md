## MODIFIED Requirements

### Requirement: Tab bar displays five tabs
The terminal tab bar SHALL display five tabs: `cli`, `portfolio`, `team`, `about`, and `blog`. The `currentTab` variable SHALL accept `"blog"` as a valid value.

#### Scenario: Tab bar renders five tabs on welcome screen
- **WHEN** the terminal renders the welcome/tab bar
- **THEN** five tab items are displayed: `cli`, `portfolio`, `team`, `about`, `blog`

#### Scenario: Blog tab is selectable
- **WHEN** user clicks the `blog` tab
- **THEN** `switchTab("blog")` is called, the blog tab becomes active (red `>` prefix), and all other tabs become inactive (30% opacity)

#### Scenario: Non-blog tabs are unaffected
- **WHEN** user clicks any tab other than `blog`
- **THEN** behavior is identical to pre-change (cli, portfolio, team, about function as before)

## ADDED Requirements

### Requirement: SPA reads `?tab=` query param on load to activate a specific tab
On `DOMContentLoaded`, after the boot sequence completes, the SPA SHALL read the `tab` query parameter from the URL. If the value matches a valid tab name (`cli`, `portfolio`, `team`, `about`, `blog`), `switchTab()` SHALL be called with that value.

#### Scenario: Valid `?tab=portfolio` opens portfolio tab
- **WHEN** user navigates to `https://commit.fund/?tab=portfolio`
- **THEN** the SPA boots normally and then activates the portfolio tab automatically

#### Scenario: `?tab=` param is read after tab bar is rendered
- **WHEN** user navigates to `https://commit.fund/?tab=portfolio`
- **THEN** `switchTab()` is called inside the final boot `setTimeout` callback (after `renderWelcome()` has run), not at the top of `DOMContentLoaded`

#### Scenario: Valid `?tab=cli` opens CLI tab (default behavior, no visible change)
- **WHEN** user navigates to `https://commit.fund/?tab=cli`
- **THEN** the SPA boots and the CLI tab is active (same as default)

#### Scenario: Invalid or missing `?tab=` param is ignored
- **WHEN** user navigates to `https://commit.fund/` with no `tab` param, or `?tab=unknown`
- **THEN** the SPA boots normally with the CLI tab active and no error occurs
