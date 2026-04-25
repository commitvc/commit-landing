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
