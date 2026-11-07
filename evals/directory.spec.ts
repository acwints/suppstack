import { expect, test } from '@playwright/test';

test('DIR-01 search and the first product row are visible on arrival', async ({ page }) => {
  await page.goto('/products');
  const search = page.getByRole('searchbox', { name: 'Search products' });
  const firstCard = page.locator('main article').first();
  const secondCard = page.locator('main article').nth(1);
  await expect(firstCard).toBeVisible();
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    const searchBox = await search.boundingBox();
    const productBox = await firstCard.boundingBox();
    const secondBox = await secondCard.boundingBox();
    expect(searchBox!.width).toBeGreaterThanOrEqual(width - 32);
    expect(productBox!.y + productBox!.height).toBeLessThan(780);
    expect(Math.abs(productBox!.y - secondBox!.y)).toBeLessThan(2);
    expect(secondBox!.x).toBeGreaterThan(productBox!.x + productBox!.width);
    expect(secondBox!.x + secondBox!.width).toBeLessThanOrEqual(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});

test('DIR-02 dismissing draft filters preserves results, URL and keyboard focus', async ({ page }) => {
  await page.goto('/products?goal=body-composition&sort=price_asc');
  const cards = page.locator('main article');
  await expect(cards.first()).toBeVisible();
  const count = await cards.count();
  const firstProduct = await cards.first().getByRole('heading').textContent();
  const url = page.url();
  const filters = page.getByRole('button', { name: 'Filters (1)', exact: true });
  await filters.click();
  const sheet = page.getByRole('dialog', { name: 'Filters' });
  await sheet.getByRole('combobox', { name: 'Goal', exact: true }).selectOption('sleep-recovery');
  await sheet.getByRole('combobox', { name: 'Brand', exact: true }).selectOption('AG1');
  await expect(sheet.getByRole('button', { name: 'Show 0 products', exact: true })).toBeVisible();
  expect(page.url()).toBe(url);
  const search = page.getByRole('searchbox', { name: 'Search products', includeHidden: true });
  await search.evaluate((element) => (element as HTMLElement).focus());
  await expect(search).not.toBeFocused();
  await page.keyboard.press('Escape');
  await expect(sheet).not.toBeVisible();
  await expect(filters).toBeFocused();
  await expect(cards).toHaveCount(count);
  await expect(cards.first().getByRole('heading')).toHaveText(firstProduct!);
  expect(page.url()).toBe(url);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
});

test('DIR-03 apply combines search, facets and sort and survives reload', async ({ page }) => {
  await page.goto('/products');
  await page.getByRole('searchbox', { name: 'Search products' }).fill('creatine');
  await expect(page.getByRole('button', { name: 'Remove filter "creatine"', exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: 'Sort products' }).selectOption('price_desc');
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  const sheet = page.getByRole('dialog', { name: 'Filters' });
  await sheet.getByRole('combobox', { name: 'Goal', exact: true }).selectOption('body-composition');
  await sheet.getByRole('combobox', { name: 'Category', exact: true }).selectOption('Performance');
  await sheet.getByRole('combobox', { name: 'Brand', exact: true }).selectOption('Naked Nutrition');
  const apply = sheet.getByRole('button', { name: /^Show \d+ products?$/ });
  await expect(apply).not.toHaveText('Show 0 products');
  const previewCount = Number((await apply.textContent())!.match(/\d+/)![0]);
  await apply.click();
  await expect(sheet).not.toBeVisible();
  await expect(page.locator('main article')).toHaveCount(previewCount);
  await expect(page.getByRole('button', { name: 'Filters (3)', exact: true })).toBeVisible();
  const query = new URL(page.url()).searchParams;
  expect(Object.fromEntries(query)).toEqual({
    q: 'creatine', goal: 'body-composition', category: 'Performance',
    brand: 'Naked Nutrition', sort: 'price_desc',
  });
  await page.reload();
  await expect(page.locator('main article')).toHaveCount(previewCount);
  await expect(page.getByRole('searchbox', { name: 'Search products' })).toHaveValue('creatine');
  await expect(page.getByRole('combobox', { name: 'Sort products' })).toHaveValue('price_desc');
  await expect(page.getByRole('button', { name: 'Remove filter Naked Nutrition', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Remove filter Naked Nutrition', exact: true }).click();
  expect(new URL(page.url()).searchParams.has('brand')).toBe(false);
  expect(new URL(page.url()).searchParams.get('q')).toBe('creatine');
});

test('DIR-04 reset clears draft facets and keeps the search', async ({ page }) => {
  await page.goto('/products?q=creatine&goal=body-composition&brand=Naked+Nutrition');
  await page.getByRole('button', { name: 'Filters (2)', exact: true }).click();
  const sheet = page.getByRole('dialog', { name: 'Filters' });
  await sheet.getByRole('button', { name: 'Reset', exact: true }).click();
  for (const name of ['Goal', 'Category', 'Brand']) {
    await expect(sheet.getByRole('combobox', { name, exact: true })).toHaveValue('all');
  }
  await sheet.getByRole('button', { name: /^Show \d+ products?$/ }).click();
  await expect(page.getByRole('button', { name: 'Filters', exact: true })).toBeVisible();
  expect(new URL(page.url()).search).toBe('?q=creatine');
  await page.getByRole('button', { name: 'Clear all', exact: true }).click();
  await expect(page.getByRole('searchbox', { name: 'Search products' })).toHaveValue('');
  expect(new URL(page.url()).search).toBe('');
});

test('DIR-05 empty search has a working reset', async ({ page }) => {
  await page.goto('/products');
  await page.getByRole('searchbox', { name: 'Search products' }).fill('no-supplement-matches-this-query'.repeat(3));
  await expect(page.getByText('No products match those filters.', { exact: true })).toBeVisible();
  await expect(page.locator('main article')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole('button', { name: 'Reset directory', exact: true }).click();
  await expect(page.locator('main article').first()).toBeVisible();
  expect(new URL(page.url()).search).toBe('');
});

test('DIR-06 desktop keeps the direct filter controls', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/products');
  await expect(page.getByRole('button', { name: 'Filters', exact: true })).not.toBeVisible();
  await page.getByRole('combobox', { name: 'Goal', exact: true }).selectOption('body-composition');
  await expect(page.getByRole('button', { name: 'Remove filter Body Composition', exact: true })).toBeVisible();
  expect(new URL(page.url()).searchParams.get('goal')).toBe('body-composition');
  await page.setViewportSize({ width: 768, height: 1024 });
  const title = await page.getByRole('heading', { name: 'All Products', exact: true }).boundingBox();
  expect(title!.width).toBeGreaterThan(100);
  expect(title!.height).toBeGreaterThan(20);
});

test('DIR-07 slow hydration cannot silently discard a search', async ({ page }) => {
  let releaseScripts!: () => void;
  const scriptsReady = new Promise<void>((resolve) => { releaseScripts = resolve; });
  await page.route('**/_next/static/chunks/**', async (route) => {
    await scriptsReady;
    await route.continue();
  });
  await page.goto('/products', { waitUntil: 'commit' });
  const search = page.getByRole('searchbox', { name: 'Search products' });
  try {
    await expect(search).toBeVisible();
    await expect(search).toBeDisabled();
  } finally {
    releaseScripts();
  }
  await expect(search).toBeEnabled();
  await search.fill('creatine');
  await expect(page.getByRole('button', { name: 'Remove filter "creatine"', exact: true })).toBeVisible();
  expect(new URL(page.url()).searchParams.get('q')).toBe('creatine');
});
