import { expect, test } from '@playwright/test';

/**
 * Regression guard for the font payload. The site once shipped the full Meslo
 * Nerd Font — 2.5 MB, ~13.8k glyphs — which loaded with `display: swap` and
 * caused a multi-second FOUT that reflowed and broke the hand-tuned ASCII
 * logo. We now ship a subset WOFF2 (~85 KB) that arrives before first paint.
 *
 * This test fails loudly if someone swaps the subset back for a full font (or
 * the subset balloons), since that silently reintroduces the flash. The 100 KB
 * ceiling leaves headroom over the current ~85 KB without tolerating a
 * regression to the megabyte range.
 */
const MAX_FONT_BYTES = 100 * 1024;

test('the preloaded webfont is a small subset, not the full Nerd Font', async ({
  page,
  request,
}) => {
  await page.goto('/');

  // next/font injects a <link rel="preload" as="font"> so the face starts
  // downloading before first paint — the mechanism that lets `display: block`
  // stay imperceptible. Assert exactly one, and that it's a WOFF2.
  const preloads = page.locator('link[rel="preload"][as="font"]');
  await expect(preloads).toHaveCount(1);

  const href = await preloads.getAttribute('href');
  expect(href, 'a font must be preloaded').toBeTruthy();
  expect(href).toMatch(/\.woff2$/);

  // Fetch the actual asset and measure it. `Content-Length` is the served
  // byte size; fall back to the body length if the static server omits it.
  const res = await request.get(href as string);
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('font/woff2');

  const declared = Number(res.headers()['content-length'] ?? '0');
  const actual = declared || (await res.body()).length;
  expect(
    actual,
    `webfont is ${(actual / 1024).toFixed(0)} KB; expected ≤ ${MAX_FONT_BYTES / 1024} KB ` +
      '(a subset WOFF2, not the full Nerd Font)',
  ).toBeLessThanOrEqual(MAX_FONT_BYTES);
});
