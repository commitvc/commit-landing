import { expect, test } from '@playwright/test';

/**
 * The CLI tab highlights for both `/` (the landing/welcome page) and
 * `/cli/` (the dedicated terminal route) — see `activeTabFromPathname`
 * in `components/nav-bar/tabs.ts`.
 */
const TABS = [
  { path: '/', label: 'CLI' },
  { path: '/cli/', label: 'CLI' },
  { path: '/companies/', label: 'Companies' },
  { path: '/blog/', label: 'Blog' },
  { path: '/team/', label: 'Team' },
  { path: '/insights/', label: 'Insights' },
  { path: '/about/', label: 'About' },
];

for (const { path, label } of TABS) {
  test(`${path} renders with "${label}" as the active nav item`, async ({ page }) => {
    await page.goto(path);
    const active = page.locator('nav a[aria-current="page"]');
    // `/` runs the welcome boot animation before the NavBar mounts; bump
    // the auto-wait so that path doesn't flake on a slow static serve.
    await expect(active).toHaveText(label, { timeout: 15_000 });
  });
}

test('blog index lists all 8 posts', async ({ page }) => {
  await page.goto('/blog/');
  // The visible UI is a file-tree, but the page also renders an `sr-only`
  // index for AI/SEO crawlers — one `<li>` per post — which is the most
  // stable count selector regardless of how the visible tree is rendered.
  const items = page.locator('section[aria-label=">commit blog index"] li');
  await expect(items).toHaveCount(8);
});

test('individual blog post renders with headings and Article JSON-LD', async ({ page }) => {
  await page.goto('/blog/browser-redefined/');
  await expect(page.locator('article h1')).toBeVisible();
  // Multiple JSON-LD scripts now ship per page (Organization/WebSite from
  // the root layout, Article + BreadcrumbList from the post). Search the
  // collection rather than relying on a fixed index.
  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
  const hasArticle = scripts.some((s) => /"@type"\s*:\s*"Article"/.test(s));
  expect(hasArticle).toBe(true);
});

test('terminal accepts help command and lists commands', async ({ page }) => {
  // Use `/cli/` rather than `/` — the dedicated route mounts the terminal
  // immediately, with no boot animation gating the input.
  await page.goto('/cli/');
  const input = page.locator('input[aria-label="Terminal command input"]');
  await expect(input).toBeEnabled({ timeout: 10_000 });
  // The prompt input auto-sizes via `width: ${value.length}ch` for the
  // blinking-cursor look, so an empty input has zero width and trips
  // Playwright's "visible" check. Skip actionability and drive the input
  // straight via the keyboard.
  await input.focus();
  await page.keyboard.type('help');
  await page.keyboard.press('Enter');
  await expect(page.getByText(/Here are the available commands/i)).toBeVisible();
});

test('terminal ls lists top-level directories', async ({ page }) => {
  await page.goto('/cli/');
  const input = page.locator('input[aria-label="Terminal command input"]');
  await expect(input).toBeEnabled({ timeout: 10_000 });
  await input.focus();
  await page.keyboard.type('ls');
  await page.keyboard.press('Enter');
  const output = page.locator('[role="log"]');
  await expect(output).toContainText('about');
  await expect(output).toContainText('team');
  await expect(output).toContainText('companies');
  await expect(output).toContainText('blog');
});

test('theme command flips the theme and survives a reload', async ({ page }) => {
  await page.goto('/cli/');
  const root = page.locator('html');
  const input = page.locator('input[aria-label="Terminal command input"]');
  await expect(input).toBeEnabled({ timeout: 10_000 });

  // No explicit override until the user asks for one — the prefers-color-scheme
  // path in globals.css owns the initial look.
  await expect(root).not.toHaveAttribute('data-theme', /.+/);

  // Playwright's default colorScheme is light, so the effective starting theme
  // is light and the first flip must land on dark.
  await input.focus();
  await page.keyboard.type('theme');
  await page.keyboard.press('Enter');
  await expect(root).toHaveAttribute('data-theme', 'dark');

  // The choice is persisted, so a full reload must not flash back.
  await page.reload();
  await expect(root).toHaveAttribute('data-theme', 'dark');

  // And flipping again returns to light rather than sticking.
  await expect(input).toBeEnabled({ timeout: 10_000 });
  await input.focus();
  await page.keyboard.type('theme');
  await page.keyboard.press('Enter');
  await expect(root).toHaveAttribute('data-theme', 'light');
});

test('the theme is published to both localStorage and a cookie', async ({ page, context }) => {
  await page.goto('/cli/');
  const input = page.locator('input[aria-label="Terminal command input"]');
  await expect(input).toBeEnabled({ timeout: 10_000 });
  await input.focus();
  await page.keyboard.type('theme');
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  // localStorage is what our own reloads read; the cookie is what the sibling
  // subdomains (insights) read, since localStorage can't cross origins. Both
  // must carry the same value after a single flip.
  expect(await page.evaluate(() => localStorage.getItem('commit-theme'))).toBe('dark');
  const cookie = (await context.cookies()).find((c) => c.name === 'commit-theme');
  expect(cookie?.value).toBe('dark');

  // A cookie set by another *.commit.fund host is honoured on a cold load,
  // and mirrored into localStorage so the two don't drift.
  await page.evaluate(() => {
    localStorage.removeItem('commit-theme');
    // biome-ignore lint/suspicious/noDocumentCookie: stands in for the cookie another subdomain would have set.
    document.cookie = 'commit-theme=light; path=/';
  });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await page.evaluate(() => localStorage.getItem('commit-theme'))).toBe('light');
});

test('a choice made on insights wins over the one stored here', async ({ page }) => {
  // The case that actually happens: someone has used `theme` here, so they have
  // a localStorage value, and then switches on insights.commit.fund — which
  // writes only the shared cookie. Reading localStorage first would mask that
  // for exactly the returning visitors most likely to notice.
  await page.goto('/cli/');
  await page.evaluate(() => {
    localStorage.setItem('commit-theme', 'dark');
    // biome-ignore lint/suspicious/noDocumentCookie: stands in for what insights.commit.fund writes on the apex.
    document.cookie = 'commit-theme=light; path=/';
  });
  await page.reload();

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  // And the stale local copy is brought back into line rather than left to win
  // again the moment the cookie expires.
  expect(await page.evaluate(() => localStorage.getItem('commit-theme'))).toBe('light');
});

/** Resolve a custom property to a canonical `rgba()` string by letting the
 *  browser parse it as a real colour. Reading the property directly returns
 *  whatever serialization the engine chose (Chrome hands back `#2820386b`
 *  for an alpha rgba), which is not stable enough to assert on. */
async function resolveVar(page: import('@playwright/test').Page, name: string): Promise<string> {
  return page.evaluate((prop) => {
    const probe = document.createElement('div');
    probe.style.color = getComputedStyle(document.documentElement).getPropertyValue(prop);
    document.body.appendChild(probe);
    const out = getComputedStyle(probe).color;
    probe.remove();
    return out;
  }, name);
}

test('file-tree guide colours follow the theme', async ({ page }) => {
  // Regression guard for the RRW retheme: these four were hardcoded Tokyo
  // Night rgba() literals in FileTree.module.css. At the dark alphas they
  // resolve to near-invisible on the light ground, which would have left the
  // tree guides, expand arrows and stealth files unreadable on Companies,
  // Team, Blog and About — four of the six tabs.
  const VARS = ['--fg-faint', '--fg-dim', '--rule-faint', '--green-faded'];
  await page.goto('/companies/');

  await page.evaluate(() => {
    document.documentElement.dataset.theme = 'dark';
  });
  const dark = await Promise.all(VARS.map((v) => resolveVar(page, v)));

  await page.evaluate(() => {
    document.documentElement.dataset.theme = 'light';
  });
  const light = await Promise.all(VARS.map((v) => resolveVar(page, v)));

  // Every one must actually change between themes — a value left hardcoded
  // would report identical colours here.
  for (const [i, name] of VARS.entries()) {
    expect(light[i], `${name} must differ between themes`).not.toBe(dark[i]);
  }

  // And on light they must be built on the dark ink, not the pale dark-theme
  // ink that would wash out. DarkBlueRiver is rgb(40, 32, 56).
  expect(light[0]).toContain('40, 32, 56');
  expect(light[1]).toContain('40, 32, 56');
  expect(light[2]).toContain('40, 32, 56');
});

/** Name → computed colour for every `*.txt` entry in a listing. The CLI's `ls`
 *  and the file-tree sidebar both render one <span> per entry, so one helper
 *  reads either — `scope` picks which listing. */
async function txtEntryColours(
  page: import('@playwright/test').Page,
  scope: string,
): Promise<Record<string, string>> {
  const entries = await page
    .locator(`${scope} span`)
    .evaluateAll((els) =>
      els
        .map((el): [string, string] => [el.textContent ?? '', getComputedStyle(el).color])
        .filter(([name]) => name.endsWith('.txt')),
    );
  return Object.fromEntries(entries);
}

test('CLI ls and the file-tree paint stealth companies alike, in both themes', async ({ page }) => {
  // `ls companies` and the Companies tree list the same files, so they must
  // agree on which ones read as stealth: --green-faded for stealth, --green
  // for live. Both colours are theme-mapped, hence the loop — the CLI class
  // (`.green-faded` in globals.css) and the tree's (`.fileStealth`) are
  // separate declarations that could drift on either ground.
  for (const theme of ['dark', 'light'] as const) {
    const setTheme = (t: string) => {
      document.documentElement.dataset.theme = t;
    };

    await page.goto('/companies/');
    await page.evaluate(setTheme, theme);
    const green = await resolveVar(page, '--green');
    const greenFaded = await resolveVar(page, '--green-faded');
    expect(greenFaded, `--green-faded must differ from --green on ${theme}`).not.toBe(green);

    const tree = await txtEntryColours(page, 'button');
    expect(Object.keys(tree).length, `tree files on ${theme}`).toBeGreaterThan(0);

    await page.goto('/cli/');
    await page.evaluate(setTheme, theme);
    const input = page.locator('input[aria-label="Terminal command input"]');
    await expect(input).toBeEnabled({ timeout: 10_000 });
    await input.focus();
    await page.keyboard.type('ls companies');
    await page.keyboard.press('Enter');
    await expect(page.locator('.ls-output')).toBeVisible();
    const cli = await txtEntryColours(page, '.ls-output');

    // Same set of files in both listings, or the per-name comparison below
    // would silently skip whatever the CLI dropped.
    expect(Object.keys(cli).sort(), `listings must match on ${theme}`).toEqual(
      Object.keys(tree).sort(),
    );

    for (const [name, colour] of Object.entries(cli)) {
      expect(colour, `${name} must match the tree on ${theme}`).toBe(tree[name]);
      expect([green, greenFaded], `${name} must be a company green on ${theme}`).toContain(colour);
    }

    // Both states have to be represented, else the parity assertions pass
    // vacuously the day everything is one colour.
    expect(Object.values(cli), `some stealth entry on ${theme}`).toContain(greenFaded);
    expect(Object.values(cli), `some live entry on ${theme}`).toContain(green);
  }
});

test('portfolio stats are in the served HTML, not just fetched client-side', async ({
  request,
}) => {
  // The point of baking stats at build time (scripts/fetch-stats.mjs): these
  // numbers used to be fetched on mount, so the served markup carried the
  // STARS / CONTRIBUTORS labels with no values — invisible to Google, to AI
  // search, and to anyone without JS. Assert against the raw HTML rather than
  // the rendered page, so a regression to client-only fetching fails here.
  const res = await request.get('/companies/pre-commit/atuin/');
  expect(res.status()).toBe(200);
  const html = await res.text();

  // Labels alone are not enough — that was exactly the broken state.
  expect(html).toContain('STARS');
  expect(html).toContain('RELEASE DOWNLOADS');

  // A formatted stat value must be present. formatNumber renders e.g. "31k"
  // or "1.4M", so match the shape rather than a number that moves daily.
  expect(html).toMatch(/>\s*\d+(\.\d+)?[kM]\s*</);
});

test('acquired companies with frozen stats show no live numbers', async ({ request }) => {
  // keep has `acquiredBy` and no `keepLiveStats`, so the card is frozen: static
  // facts only, no stars/contributors. Worth guarding explicitly — baking stats
  // at build time made it newly possible to reintroduce live numbers here by
  // accident, since the values now exist in the bundle either way.
  const res = await request.get('/companies/pre-commit/keep/');
  expect(res.status()).toBe(200);
  const html = await res.text();

  // React splits `(acq. {company.acquiredBy})` across text nodes, so the
  // rendered markup isn't the contiguous string "(acq. Elastic)".
  expect(html).toMatch(/\(acq\.\s*(<!--[^>]*-->)?\s*Elastic/);

  // The frozen card keeps its static facts but must expose no live metric.
  expect(html).toContain('LICENSE');
  expect(html).not.toContain('STARS');
  expect(html).not.toContain('CONTRIBUTORS');
});

test('/about/legal serves a redirect page with a visible fallback link', async ({ request }) => {
  // The page does an immediate `window.location.replace(...)` (with a
  // <noscript> meta-refresh fallback), so any browser visit redirects
  // before assertions can run. Fetch the HTML directly instead — the
  // fallback link must be present in the served markup so users with the
  // redirect blocked still have a path forward.
  const res = await request.get('/about/legal/');
  expect(res.status()).toBe(200);
  const html = await res.text();
  expect(html).toContain('href="https://www.redriverwest.com/legal"');
});
