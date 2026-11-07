import { expect, test } from '@playwright/test';

test('native shop scan stays beside search and accepts a library photo', async ({ page }) => {
  const origin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  const storageKey = `sb-${origin.hostname.split('.')[0]}-auth-token`;
  await page.route((url) => url.origin === origin.origin, (route) => route.fulfill({ json: [] }));
  await page.addInitScript(({ storageKey }) => {
    localStorage.setItem(storageKey, JSON.stringify({
      access_token: 'local-scan-fixture', refresh_token: 'local-scan-fixture',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: { id: 'f9a03efd-849f-4a92-8321-2e09f55ec508', email: 'qa@example.invalid',
        created_at: new Date().toISOString(), user_metadata: { onboarded_at: new Date().toISOString() } },
    }));
    window.Capacitor = { isNativePlatform: () => true };
  }, { storageKey });
  await page.goto('/');
  const scan = page.getByRole('link', { name: 'Scan Your Stack', exact: true });
  await expect(scan).toBeVisible();
  const searchBox = await page.getByRole('combobox').first().boundingBox();
  const scanBox = await scan.boundingBox();
  expect(scanBox!.x).toBeGreaterThan(searchBox!.x + searchBox!.width);
  expect(Math.abs(scanBox!.y - searchBox!.y)).toBeLessThan(10);
  await page.screenshot({ path: '/tmp/suppstack-shop-scan.png' });
  await scan.click();
  const chooserEvent = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Choose Photo', exact: true }).click();
  const chooser = await chooserEvent;
  expect(await chooser.element().getAttribute('capture')).toBeNull();
  await chooser.setFiles({
    name: 'bottles.png', mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64'),
  });
  await expect(page.getByAltText('Selected supplement counter photo')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Take Photo', exact: true })).toBeVisible();
  await page.screenshot({ path: '/tmp/suppstack-photo-picker.png' });
});

test('health goal products use two columns on mobile', async ({ page }) => {
  await page.goto('/health');
  await page.locator('main a[href^="/health/"]').first().click();
  const section = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Products', exact: true }) }).last();
  const cards = section.locator('article');
  await expect(cards.first()).toBeVisible();
  const first = await cards.nth(0).boundingBox();
  const second = await cards.nth(1).boundingBox();
  expect(Math.abs(first!.y - second!.y)).toBeLessThan(1);
  expect(second!.x).toBeGreaterThan(first!.x + first!.width);
  await cards.first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: '/tmp/suppstack-goal-grid.png' });
});

test('product actions retain full mobile touch height', async ({ page }) => {
  await page.goto('/product/real-naked-creatine-monohydrate');
  for (const name of ['Add to Stack', 'Buy Now', 'Save']) {
    const button = page.getByRole('button', { name, exact: true }).first();
    await expect(button).toBeVisible();
    expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(48);
  }
  await page.getByRole('button', { name: 'Add to Stack', exact: true }).first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: '/tmp/suppstack-product-buttons.png' });
});
