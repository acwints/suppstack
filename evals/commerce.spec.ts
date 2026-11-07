import { expect, test, type Page } from '@playwright/test';

const productPath = '/product/real-naked-creatine-monohydrate';

type SdkOutcome = 'completed' | 'dismissed' | 'failed' | 'unknown' | 'pending';

async function prepareNativeBuyer(page: Page, unavailable = false, bridgeFails = false, sdkOutcome?: SdkOutcome) {
  const hydrationErrors: string[] = [];
  page.on('pageerror', (error) => {
    if (error.message.includes('Hydration failed')) hydrationErrors.push(error.message);
  });
  const origin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  const storageKey = `sb-${origin.hostname.split('.')[0]}-auth-token`;
  await page.route((url) => url.origin === origin.origin, (route) =>
    route.fulfill({
      json: route.request().url().includes('get_or_create_own_account_profile')
        ? { display_name: 'Commerce QA' }
        : route.request().headers().accept?.includes('application/vnd.pgrst.object+json')
          ? null
          : [],
    })
  );
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
  await page.goto(productPath);
  await page.getByRole('button', { name: 'Buy Now', exact: true }).first().click();
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
