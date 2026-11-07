import { expect, test, type Page } from '@playwright/test';
import { readdirSync } from 'node:fs';
import path from 'node:path';

async function prepareAccount(page: Page, onboarded = true) {
  const origin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  const storageKey = `sb-${origin.hostname.split('.')[0]}-auth-token`;
  await page.route('**/api/catalog/**', (route) => route.fulfill({ json: { productId: 123 } }));
  await page.route((url) => url.origin === origin.origin, (route) => route.fulfill({
    json: route.request().url().includes('get_or_create_own_account_profile') ? { display_name: 'Control QA' } : route.request().url().includes('select=product_id&') ? [{ product_id: 123 }] : route.request().headers().accept?.includes('application/vnd.pgrst.object+json') ? null : [],
  }));
  await page.addInitScript(({ storageKey, onboarded }) => {
    localStorage.setItem(storageKey, JSON.stringify({
      access_token: 'local-control-fixture', refresh_token: 'local-control-fixture',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: { id: 'f9a03efd-849f-4a92-8321-2e09f55ec508', email: 'qa@example.invalid',
        created_at: new Date().toISOString(), user_metadata: onboarded ? { onboarded_at: new Date().toISOString() } : {} },
    }));
    window.Capacitor = { isNativePlatform: () => true };
  }, { storageKey, onboarded });
}

async function expectUsableControls(page: Page) {
  await expect(page.locator('a button, button a')).toHaveCount(0);
  await expect.poll(() => page.locator('button, select, input:not([type]), input:is([type="text"], [type="email"], [type="password"], [type="search"], [type="number"], [type="url"], [type="date"], [type="time"]), a.inline-flex, a.flex').evaluateAll((controls) => controls.flatMap((control) => {
    const root = control.getRootNode();
    if (root instanceof ShadowRoot && root.host.tagName === 'NEXTJS-PORTAL') return [];
    const rect = control.getBoundingClientRect();
    if (!rect.width || !rect.height || getComputedStyle(control).visibility === 'hidden') return [];
    return rect.height < 43.9 || (control.tagName === 'BUTTON' && rect.width < 43.9)
      ? [`${control.tagName} ${control.getAttribute('aria-label') || control.textContent?.trim().slice(0, 60)}: ${rect.width}×${rect.height}`] : [];
  }))).toEqual([]);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth ? [] : Array.from(document.querySelectorAll('button, input, select, h1, h2, form')).filter((node) => node.getBoundingClientRect().right > innerWidth + 1).map((node) => `${node.tagName} ${node.getAttribute('aria-label') || node.textContent?.trim().slice(0, 50)}: right=${node.getBoundingClientRect().right}`));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), overflow.join('\n')).toBe(true);
}

const staticRoutes = readdirSync(path.join(process.cwd(), 'src/app'), { recursive: true })
  .map(String).filter((file) => /(^|\/)page\.tsx$/.test(file) && !file.includes('['))
  .map((file) => `/${file.replace(/(^|\/)page\.tsx$/, '')}`);

for (const route of staticRoutes) {
  test(`controls fit ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    if (route !== '/login') await prepareAccount(page, route !== '/welcome');
    await page.goto(route);
    await expect(page.locator('body')).not.toBeEmpty();
    await expect.poll(async () => page.locator('button, h1, h2').count()).toBeGreaterThan(0);
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      await expectUsableControls(page);
    }
  });
}

test('catalog image recovers from a failed merchant photo', async ({ page }) => {
  await page.route('**/media/product/b107*', (route) => route.abort());
  await page.goto('/');
  const card = page.locator('a[href="/supplement/9004"]').first();
  await card.scrollIntoViewIfNeeded();
  const image = card.locator('img');
  await expect(image).toHaveAttribute('src', /icon-512/);
  await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
});

test('real B-Complex image loads', async ({ page }) => {
  await page.goto('/');
  const image = page.locator('a[href="/supplement/9004"]').first().locator('img');
  await image.scrollIntoViewIfNeeded();
  await expect(image).toHaveAttribute('src', /b107__vf4cde66/);
  await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await page.screenshot({ path: '/tmp/suppstack-b-complex-fixed.png' });
});

for (const route of ['/product/real-naked-creatine-monohydrate', '/supplement/9004', '/health/sleep-recovery', '/brands/naked-nutrition', '/search?q=creatine']) {
  test(`detail controls fit ${route}`, async ({ page }) => {
    await prepareAccount(page);
    await page.goto(route);
    await expect(page.locator('h1, h2').first()).toBeVisible();
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      await expectUsableControls(page);
    }
  });
}

test('review ratings and stack builder controls fit narrow screens', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await prepareAccount(page);
  await page.goto('/product/real-naked-creatine-monohydrate');
  await page.getByRole('button', { name: 'Write a Review', exact: true }).first().click();
  await page.getByRole('button', { name: 'Rate 5 stars', exact: true }).first().click();
  await page.screenshot({ path: '/tmp/suppstack-review-controls.png' });
  await expectUsableControls(page);
  await page.goto('/stacks/create');
  await page.getByPlaceholder('Search supplements to add...').fill('creatine');
  await page.getByRole('button', { name: /Creatine Monohydrate/ }).first().click();
  await expectUsableControls(page);
});


test('stack settings retain usable day and footer controls', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await prepareAccount(page);
  await page.route('**/rest/v1/users_products?**', (route) => route.fulfill({ json: [{
    product_id: 123, products: { product_name: 'QA Creatine', product_price: 30,
      servings_per_container: 30, servings_per_day: 1,
      brands: { brand_name: 'QA Brand' }, supplements: { supplement_name: 'Creatine' } },
  }] }));
  await page.goto('/stack');
  await page.getByRole('button', { name: 'Settings for QA Creatine' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Monday', exact: true }).click();
  await expectUsableControls(page);
  await page.screenshot({ path: '/tmp/suppstack-settings-controls.png' });
});

test('navigation CTAs use one focus target and readable hover text', async ({ page }) => {
  await prepareAccount(page);
  await page.goto('/profile');
  await page.getByRole('tab', { name: 'Shared stacks', exact: true }).click();
  await expectUsableControls(page);
  const create = page.getByRole('link', { name: 'Create Stack', exact: true });
  await expect(create).toBeVisible();
  await expect(create.locator('button')).toHaveCount(0);
  await create.hover();
  expect(await create.evaluate((link) => getComputedStyle(link).color)).toBe('rgb(255, 255, 255)');
  await create.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/stacks\/create$/);
  await expectUsableControls(page);
});
