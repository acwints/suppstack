import { expect, test, type Page } from '@playwright/test';
import type { Product } from '../src/types';

const productPath = '/product/real-naked-creatine-monohydrate';

type SdkOutcome = 'completed' | 'dismissed' | 'failed' | 'unknown' | 'pending';

async function prepareNativeBuyer(page: Page, unavailable = false, bridgeFails = false, sdkOutcome?: SdkOutcome, stack = false, directProduct?: Partial<Product>, sticky = false) {
  const hydrationErrors: string[] = [];
  page.on('pageerror', (error) => {
    if (error.message.includes('Hydration failed')) hydrationErrors.push(error.message);
  });
  const origin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  const storageKey = `sb-${origin.hostname.split('.')[0]}-auth-token`;
  await page.route((url) => url.origin === origin.origin, (route) => {
    const url = new URL(route.request().url());
    const fixtureProducts = ['Alpha', 'Beta', 'Sold Out'].map((name, index) => ({
      product_id: `fixture-${index}`,
      product_name: `${name} supplement`, product_description: '',
      product_price: 20, servings_per_container: 30, servings_per_day: 1,
      supplement_id: 800001 + index,
      product_url: `https://${name.replaceAll(' ', '').toLowerCase()}.example/products/fixture`,
      shopify_store_domain: `${name.replaceAll(' ', '').toLowerCase()}.example`,
      shopify_variant_gid: `gid://shopify/ProductVariant/${101 + index}`,
      brands: { brand_name: name },
      inventory_status: index === 2 ? 'out_of_stock' : 'in_stock',
    }));
    const json = stack && url.pathname.endsWith('/stacks') ? {
      stack_id: 'checkout-eval', stack_name: 'Checkout evaluation', profile: null,
      stack_supplements: fixtureProducts.map((product, index) => ({
        supplement_id: product.supplement_id, is_core: true, order_index: index,
        supplements: { supplement_name: product.product_name },
      })),
    } : directProduct && url.pathname.endsWith('/products') ? {
      ...fixtureProducts[0], product_id: 'checkout-direct', product_image: '', amazon_url: '',
      shopify_store_domain: undefined, shopify_variant_gid: undefined,
      ...directProduct,
    } : stack && url.pathname.endsWith('/products') ? fixtureProducts
      : url.pathname.includes('get_or_create_own_account_profile') ? { display_name: 'Commerce QA' }
      : route.request().headers().accept?.includes('application/vnd.pgrst.object+json') ? null : [];
    return route.fulfill({ json });
  });
  await page.route('**/api/commerce/product-status', (route) =>
    route.fulfill({ json: { status: unavailable ? 'unavailable' : 'available', price: 35.99 } })
  );
  await page.route('**/api/commerce/checkout', (route) =>
    route.fulfill({
      json: { session: { status: 'ready', purchaseUrl: 'https://nakednutrition.com/cart/1248822167:2' } },
    })
  );
  await page.route('**/api/catalog/**', (route) => route.fulfill({ json: {} }));
  await page.addInitScript(({ storageKey, bridgeFails, sdkOutcome }) => {
    localStorage.setItem(storageKey, JSON.stringify({
      access_token: 'local-commerce-fixture',
      refresh_token: 'local-commerce-fixture',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: {
        id: 'f9a03efd-849f-4a92-8321-2e09f55ec508',
        created_at: new Date().toISOString(),
        email: 'qa@example.invalid',
        user_metadata: { onboarded_at: new Date().toISOString() },
      },
    }));
    window.Capacitor = {
      isNativePlatform: () => true,
      Plugins: { Browser: {
        open: async ({ url }) => {
          if (bridgeFails) throw new Error('Bridge fixture failed');
          sessionStorage.setItem('eval-checkout-url', url);
        },
        close: async () => undefined,
      } },
    };
    if (sdkOutcome) {
      const plugins = window.Capacitor!.Plugins as Record<string, unknown>;
      plugins.SuppStackCheckout = {
        present: async ({ url }: { url: string }) => {
          sessionStorage.setItem('eval-sdk-url', url);
          sessionStorage.setItem('eval-sdk-count', String(Number(sessionStorage.getItem('eval-sdk-count') || 0) + 1));
          if (sdkOutcome === 'pending') {
            return new Promise((resolve) => {
              (window as Window & { finishCheckout?: (status: string) => void }).finishCheckout =
                (status) => resolve({ status });
            });
          }
          return { status: sdkOutcome };
        },
      };
    }
  }, { storageKey, bridgeFails, sdkOutcome });
  await page.goto(stack ? '/stacks/checkout-eval' : directProduct ? '/product/checkout-direct' : productPath);
  if (!stack) await page.getByRole('button', { name: sticky ? 'Buy' : directProduct && !directProduct.shopify_checkout_url ? 'Brand Store' : 'Buy Now', exact: true }).first().click();
  expect(hydrationErrors).toEqual([]);
}

test('COM-UI-01 native Buy preserves variant and quantity', async ({ page }) => {
  await prepareNativeBuyer(page);
  await page.getByRole('button', { name: 'Increase quantity' }).click();
  await page.getByRole('button', { name: 'Complete secure checkout' }).click();
  await expect(page.getByText('Merchant checkout opened', { exact: true })).toBeVisible();
  const opened = await page.evaluate(() => sessionStorage.getItem('eval-checkout-url'));
  expect(new URL(opened!).pathname).toBe('/cart/1248822167:2');
  await expect(page.getByText(/Order confirmed|Order placed/)).toHaveCount(0);
});

test('COM-UI-02 sold-out merchant response prevents checkout', async ({ page }) => {
  await prepareNativeBuyer(page, true);
  await expect(page.getByText('This variant is currently unavailable', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Complete secure checkout' })).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem('eval-checkout-url'))).toBeNull();
});

test('COM-UI-03 native bridge failure has a recovery state', async ({ page }) => {
  await prepareNativeBuyer(page, false, true);
  await page.getByRole('button', { name: 'Complete secure checkout' }).click();
  await expect(page.getByText('Checkout could not open', { exact: true })).toBeVisible();
  await expect(page.getByText('Merchant checkout opened', { exact: true })).toHaveCount(0);
});

test('UX-01 sign-in keeps feedback and updates out of the form', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByText('Send feedback', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'What’s New', exact: true })).toHaveCount(0);
});


test('COM-UI-04 Checkout Kit completion is distinct from browser handoff', async ({ page }) => {
  await prepareNativeBuyer(page, false, false, 'completed');
  await page.getByRole('button', { name: 'Increase quantity' }).click();
  await page.getByRole('button', { name: 'Complete secure checkout' }).click();
  await expect(page.getByText('Checkout completed', { exact: true })).toBeVisible();
  const openedUrl = await page.evaluate(() => sessionStorage.getItem('eval-sdk-url'));
  expect(new URL(openedUrl!).pathname).toBe('/cart/1248822167:2');
  expect(await page.evaluate(() => sessionStorage.getItem('eval-checkout-url'))).toBeNull();
});

test('COM-UI-05 dismissal permits retry without claiming completion', async ({ page }) => {
  await prepareNativeBuyer(page, false, false, 'dismissed');
  await page.getByRole('button', { name: 'Complete secure checkout' }).click();
  await expect(page.getByRole('button', { name: 'Complete secure checkout' })).toBeVisible();
  await expect(page.getByText('Checkout completed', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Complete secure checkout' }).click();
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('eval-sdk-count'))).toBe('2');
});

for (const outcome of ['failed', 'unknown'] as const) {
  test('COM-UI-06 SDK ' + outcome + ' does not complete or automatically reopen checkout', async ({ page }) => {
    await prepareNativeBuyer(page, false, false, outcome);
    await page.getByRole('button', { name: 'Complete secure checkout' }).click();
    await expect(page.getByText('Checkout could not open', { exact: true })).toBeVisible();
    await expect(page.getByText('Checkout completed', { exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => sessionStorage.getItem('eval-checkout-url'))).toBeNull();
  });
}

test('COM-UI-07 pending checkout cannot open a duplicate sheet', async ({ page }) => {
  await prepareNativeBuyer(page, false, false, 'pending');
  const button = page.getByRole('button', { name: 'Complete secure checkout' });
  await expect(button).toBeVisible();
  await button.evaluate((element) => {
    (element as HTMLButtonElement).click();
    (element as HTMLButtonElement).click();
  });
  await expect(page.getByRole('status').filter({ hasText: 'Checkout is open' })).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem('eval-sdk-count'))).toBe('1');
  await page.evaluate(() => {
    (window as Window & { finishCheckout?: (status: string) => void }).finishCheckout?.('completed');
  });
  await expect(page.getByText('Checkout completed', { exact: true })).toBeVisible();
});

async function prepareStackBuyer(page: Page, outcome: SdkOutcome = 'pending') {
  await prepareNativeBuyer(page, false, false, outcome, true);
  await page.getByRole('button', { name: /Buy This Stack/ }).click();
  await page.getByRole('button', { name: 'Review checkout · 2 merchants' }).click();
  return page.getByRole('dialog', { name: 'Checkout your stack' });
}

async function finishStackCheckout(page: Page, status: string) {
  await page.evaluate(status => {
    (window as Window & { finishCheckout?: (status: string) => void }).finishCheckout?.(status);
  }, status);
}

test('COM-STACK-01 review does not open merchants and excludes sold-out products', async ({ page }, testInfo) => {
  const dialog = await prepareStackBuyer(page);
  await expect(dialog.getByRole('button', { name: /Checkout with/ })).toHaveCount(2);
  await expect(dialog.getByText('Sold Out supplement')).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('stack-checkout.png'), animations: 'disabled' });
  expect(await page.evaluate(() => sessionStorage.getItem('eval-sdk-count'))).toBeNull();
  expect(await page.evaluate(() => sessionStorage.getItem('eval-checkout-url'))).toBeNull();
});

test('COM-STACK-02 partial completion survives sibling failure and explicit retry', async ({ page }) => {
  const dialog = await prepareStackBuyer(page);
  const alpha = dialog.getByRole('button', { name: 'Checkout with Alpha', exact: true });
  await alpha.evaluate(element => {
    (element as HTMLButtonElement).click();
    (element as HTMLButtonElement).click();
  });
  await expect(dialog.getByRole('button', { name: 'Checkout with Beta' })).toBeDisabled();
  expect(await page.evaluate(() => sessionStorage.getItem('eval-sdk-count'))).toBe('1');
  expect(new URL((await page.evaluate(() => sessionStorage.getItem('eval-sdk-url')))! ).pathname).toBe('/cart/101:1');
  await finishStackCheckout(page, 'completed');
  await expect(dialog.getByText('1 of 2 checkouts completed')).toBeVisible();
  await dialog.getByRole('button', { name: 'Checkout with Beta' }).click();
  await finishStackCheckout(page, 'failed');
  await expect(dialog.getByRole('button', { name: 'Retry Beta' })).toBeEnabled();
  await expect(dialog.getByRole('button', { name: 'Completed', exact: true })).toBeDisabled();
  expect(await page.evaluate(() => sessionStorage.getItem('eval-sdk-count'))).toBe('2');
  await dialog.getByRole('button', { name: 'Retry Beta' }).click();
  await finishStackCheckout(page, 'completed');
  await expect(dialog.getByText('2 of 2 checkouts completed')).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem('eval-sdk-count'))).toBe('3');
});

test('COM-STACK-03 dismissal is retryable and close/reopen keeps completed merchants', async ({ page }) => {
  const dialog = await prepareStackBuyer(page);
  await dialog.getByRole('button', { name: 'Checkout with Alpha' }).click();
  await finishStackCheckout(page, 'completed');
  await dialog.getByRole('button', { name: 'Checkout with Beta' }).click();
  await finishStackCheckout(page, 'dismissed');
  await expect(dialog.getByRole('button', { name: 'Retry Beta' })).toBeEnabled();
  await dialog.getByRole('button', { name: 'Close modal' }).click();
  await page.getByRole('button', { name: /Buy This Stack/ }).click();
  await page.getByRole('button', { name: /Buy This Stack/ }).click();
  await page.getByRole('button', { name: 'Review checkout · 2 merchants' }).click();
  await expect(dialog.getByText('1 of 2 checkouts completed')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Completed', exact: true })).toBeDisabled();
  expect(await page.evaluate(() => sessionStorage.getItem('eval-sdk-count'))).toBe('2');
});

test('COM-STACK-04 old binary handoff never counts as completion', async ({ page }) => {
  await prepareNativeBuyer(page, false, false, undefined, true);
  await page.getByRole('button', { name: /Buy This Stack/ }).click();
  await page.getByRole('button', { name: 'Review checkout · 2 merchants' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Checkout with Alpha' }).click();
  await expect(dialog.getByText('0 of 2 checkouts completed')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Reopen Alpha' })).toBeEnabled();
  expect(await page.evaluate(() => sessionStorage.getItem('eval-sdk-count'))).toBeNull();
  expect(new URL((await page.evaluate(() => sessionStorage.getItem('eval-checkout-url')))! ).hostname).toBe('alpha.example');
});

test('COM-STACK-05 unknown SDK outcome never falls back or completes', async ({ page }) => {
  const dialog = await prepareStackBuyer(page, 'unknown');
  await dialog.getByRole('button', { name: 'Checkout with Alpha' }).click();
  await expect(dialog.getByRole('button', { name: 'Retry Alpha' })).toBeEnabled();
  await expect(dialog.getByText('0 of 2 checkouts completed')).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem('eval-checkout-url'))).toBeNull();
});

test('COM-STACK-06 blocked web popup leaves an explicit retry and no sibling launch', async ({ page }) => {
  const dialog = await prepareStackBuyer(page);
  await page.evaluate(() => {
    window.Capacitor = { isNativePlatform: () => false };
    window.open = () => {
      sessionStorage.setItem('eval-web-count', String(Number(sessionStorage.getItem('eval-web-count') || 0) + 1));
      return null;
    };
  });
  await dialog.getByRole('button', { name: 'Checkout with Alpha' }).click();
  await expect(dialog.getByRole('button', { name: 'Retry Alpha' })).toBeEnabled();
  await expect(dialog.getByRole('button', { name: 'Checkout with Beta' })).toBeEnabled();
  await expect(dialog.getByText('0 of 2 checkouts completed')).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem('eval-web-count'))).toBe('1');
  expect(await page.evaluate(() => sessionStorage.getItem('eval-sdk-count'))).toBeNull();
});

test('COM-STACK-07 keyboard focus stays in review and returns to its trigger', async ({ page }) => {
  const dialog = await prepareStackBuyer(page);
  await expect(dialog.getByRole('button', { name: 'Close modal' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Checkout with Beta' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Close modal' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Review checkout · 2 merchants' })).toBeFocused();
});

test('COM-STACK-08 changing a sibling selection preserves an unchanged completed cart', async ({ page }) => {
  const dialog = await prepareStackBuyer(page);
  await dialog.getByRole('button', { name: 'Checkout with Alpha' }).click();
  await finishStackCheckout(page, 'completed');
  await dialog.getByRole('button', { name: 'Close modal' }).click();
  await page.getByRole('button', { name: 'Remove Beta supplement in checkout' }).click();
  await page.getByRole('button', { name: 'Review checkout · 1 merchant' }).click();
  await expect(dialog.getByText('1 of 1 checkouts completed')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Completed', exact: true })).toBeDisabled();
  expect(await page.evaluate(() => sessionStorage.getItem('eval-sdk-count'))).toBe('1');
});

test('COM-PARITY-01 direct Shopify checkout without variant uses native checkout', async ({ page }) => {
  await prepareNativeBuyer(page, false, false, 'completed', false, {
    shopify_checkout_url: 'https://alpha.example/checkouts/fixture',
  });
  await expect(page.getByRole('button', { name: 'Increase quantity' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Complete secure checkout' }).click();
  await expect(page.getByText('Checkout completed', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem('eval-sdk-url'))).toBe('https://alpha.example/checkouts/fixture');
  expect(await page.evaluate(() => sessionStorage.getItem('eval-checkout-url'))).toBeNull();
});

test('COM-PARITY-02 official merchant page uses browser and never claims completion', async ({ page }) => {
  await prepareNativeBuyer(page, false, false, 'completed', false, {
    product_url: 'https://official.example/products/fixture',
  });
  await page.getByRole('button', { name: 'Complete secure checkout' }).click();
  await expect(page.getByText('Merchant checkout opened', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem('eval-sdk-count'))).toBeNull();
  expect(await page.evaluate(() => sessionStorage.getItem('eval-checkout-url'))).toBe('https://official.example/products/fixture');
});

test('COM-PARITY-03 direct cart opens without an unused checkout-session request', async ({ page }) => {
  let requests = 0;
  page.on('request', request => { if (new URL(request.url()).pathname === '/api/commerce/checkout') requests += 1; });
  await prepareNativeBuyer(page, false, false, 'completed');
  await page.getByRole('button', { name: 'Complete secure checkout' }).click();
  await expect(page.getByText('Checkout completed', { exact: true })).toBeVisible();
  expect(requests).toBe(0);
});

test('COM-PARITY-04 a pending native sheet cannot lose its review through Escape', async ({ page }) => {
  await prepareNativeBuyer(page, false, false, 'pending');
  await page.getByRole('button', { name: 'Complete secure checkout' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Checkout', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close modal' })).toHaveCount(0);
  await finishStackCheckout(page, 'dismissed');
  await expect(page.getByRole('button', { name: 'Complete secure checkout' })).toBeVisible();
});

test('COM-PARITY-05 sticky mobile Buy keeps checkout inside the viewport', async ({ page }, testInfo) => {
  await prepareNativeBuyer(page, false, false, 'completed', false, undefined, true);
  const dialog = page.getByRole('dialog', { name: 'Checkout', exact: true });
  await expect(dialog).toBeVisible();
  const bounds = await dialog.boundingBox();
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await page.screenshot({ path: testInfo.outputPath('sticky-buy-checkout.png'), animations: 'disabled' });
  await page.getByRole('button', { name: 'Increase quantity' }).click();
  await page.getByRole('button', { name: 'Complete secure checkout' }).click();
  await expect(page.getByText('Checkout completed', { exact: true })).toBeVisible();
  expect(new URL((await page.evaluate(() => sessionStorage.getItem('eval-sdk-url')))! ).pathname).toBe('/cart/1248822167:2');
});

test('COM-PARITY-06 slow availability never leaves checkout stuck loading', async ({ page }) => {
  await prepareNativeBuyer(page, false, false, 'completed');
  await page.getByRole('button', { name: 'Close modal' }).click();
  await page.route('**/api/commerce/product-status', async route => {
    await new Promise(resolve => setTimeout(resolve, 9500));
    await route.fulfill({ json: { status: 'available', price: 35.99 } }).catch(() => undefined);
  });
  await page.getByRole('button', { name: 'Buy Now', exact: true }).first().click();
  await expect(page.getByRole('button', { name: 'Complete secure checkout' })).toBeEnabled({ timeout: 12000 });
  await page.getByRole('button', { name: 'Complete secure checkout' }).click();
  await expect(page.getByText('Checkout completed', { exact: true })).toBeVisible();
});

test('COM-PARITY-07 insecure merchant URLs cannot bypass checkout validation', async ({ page }) => {
  await prepareNativeBuyer(page, false, false, 'completed', false, {
    product_url: 'http://official.example/products/fixture',
  });
  await expect(page.getByRole('button', { name: 'Complete secure checkout' })).toBeDisabled();
  await expect(page.getByText('A secure merchant link is currently unavailable.')).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem('eval-sdk-count'))).toBeNull();
  expect(await page.evaluate(() => sessionStorage.getItem('eval-checkout-url'))).toBeNull();
});
