import { expect, test } from '@playwright/test';

const TABS = [
  { path: '/', label: 'CLI' },
  { path: '/companies/', label: 'Companies' },
  { path: '/blog/', label: 'Blog' },
  { path: '/team/', label: 'Team' },
  { path: '/about/', label: 'About' },
];

for (const { path, label } of TABS) {
  test(`${label} tab renders with the correct active nav item`, async ({ page }) => {
    await page.goto(path);
    const active = page.locator('nav a[aria-current="page"]');
    await expect(active).toHaveText(label);
  });
}

test('blog index lists all 8 posts', async ({ page }) => {
  await page.goto('/blog/');
  const cards = page.locator('a:has(h2)');
  await expect(cards).toHaveCount(8);
});

test('individual blog post renders with headings and article JSON-LD', async ({ page }) => {
  await page.goto('/blog/browser-redefined/');
  await expect(page.locator('article h1')).toBeVisible();
  const jsonLd = await page.locator('script[type="application/ld+json"]').nth(1).textContent();
  expect(jsonLd).toContain('"@type":"Article"');
});

test('terminal accepts help command and lists commands', async ({ page }) => {
  await page.goto('/');
  const input = page.locator('input[aria-label="Terminal command input"]');
  // Wait for boot animation to finish + prompt to enable
  await expect(input).toBeEnabled({ timeout: 5000 });
  await input.fill('help');
  await input.press('Enter');
  await expect(page.getByText(/Here are the available commands/i)).toBeVisible();
});

test('terminal ls lists top-level directories', async ({ page }) => {
  await page.goto('/');
  const input = page.locator('input[aria-label="Terminal command input"]');
  await expect(input).toBeEnabled({ timeout: 5000 });
  await input.fill('ls');
  await input.press('Enter');
  const output = page.locator('[role="log"]');
  await expect(output).toContainText('about');
  await expect(output).toContainText('team');
  await expect(output).toContainText('portfolio');
  await expect(output).toContainText('blog');
});

test('/about/legal serves a redirect page with a visible fallback link', async ({ page }) => {
  await page.goto('/about/legal/', { waitUntil: 'domcontentloaded' });
  const link = page.locator('a[href="https://www.redriverwest.com/legal"]');
  await expect(link).toBeVisible();
});
