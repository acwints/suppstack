import { expect, test, type Page } from '@playwright/test';

const USER_ID = 'f9a03efd-849f-4a92-8321-2e09f55ec508';

const stackRow = {
  product_id: 123,
  products: {
    product_name: 'Fixture stack product',
    product_description: '',
    product_price: 20,
    servings_per_container: 30,
    servings_per_day: 1,
    product_url: 'https://example.invalid/fixture',
    brands: { brand_name: 'Fixture Brand' },
    supplements: { supplement_name: 'Magnesium Glycinate' },
    product_ingredients: [],
  },
};

const settingsRow = {
  product_id: 123,
  servings_per_day: 1,
  schedule_days: [1, 2, 3, 4, 5, 6, 7],
  status: 'active',
  custom_dosage: null,
};

async function prepareStack(page: Page, alreadyInStack: boolean) {
  const origin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  const storageKey = `sb-${origin.hostname.split('.')[0]}-auth-token`;
  let saved = alreadyInStack;
  const funnelCalls: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/commerce/checkout-funnel')) funnelCalls.push(request.url());
  });

  await page.route('**/api/catalog/**', (route) => route.fulfill({ json: { productId: 123 } }));
  await page.route('**/api/referral/priority', (route) =>
    route.fulfill({
      json: {
        placement: 'standard',
        eligible_referrals: 0,
        required_referrals: 1,
        ahead_in_priority_group: null,
        priority_group_size: 0,
      },
    })
  );
  await page.route('**/api/commerce/checkout-funnel', (route) =>
    route.fulfill({ json: { ok: true, recorded: true } })
  );
  await page.route(
    (url) => url.origin === origin.origin,
    (route) => {
      const url = route.request().url();
      const method = route.request().method();
      if (url.includes('/auth/v1/user')) {
        return route.fulfill({
          json: {
            id: USER_ID,
            email: 'qa@example.invalid',
            created_at: '2020-01-01T00:00:00.000Z',
            user_metadata: { onboarded_at: '2020-01-02T00:00:00.000Z' },
          },
        });
      }
      if (url.includes('get_or_create_own_account_profile')) {
        return route.fulfill({ json: { display_name: 'Stack QA', profile_id: USER_ID } });
      }
      if (url.includes('/users_products')) {
        if (method === 'POST') saved = true;
        return route.fulfill({ json: saved ? [stackRow] : [] });
      }
      if (url.includes('/user_supplement_settings')) {
        return route.fulfill({ json: saved ? [settingsRow] : [] });
      }
      if (url.includes('/products') && url.includes('product_url=')) {
        return route.fulfill({ json: [{ product_id: 123 }] });
      }
      if (route.request().headers().accept?.includes('application/vnd.pgrst.object+json')) {
        return route.fulfill({ json: null });
      }
      return route.fulfill({ json: [] });
    }
  );

  await page.addInitScript(
    ({ storageKey, userId }) => {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          access_token: 'local-stack-fixture',
          refresh_token: 'local-stack-fixture',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          user: {
            id: userId,
            aud: 'authenticated',
            created_at: '2020-01-01T00:00:00.000Z',
            email: 'qa@example.invalid',
            user_metadata: { onboarded_at: '2020-01-02T00:00:00.000Z' },
          },
        })
      );
    },
    { storageKey, userId: USER_ID }
  );

  return {
    funnelCalls,
    saved: () => saved,
  };
}

test('empty stack add saves a product and shows the in-flow invite', async ({ page }) => {
  const session = await prepareStack(page, false);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/stack');

  const starter = page.getByRole('heading', { name: 'Add the first thing you take' });
  await expect(starter).toBeVisible();
  await expect(page.getByText('Priority early access')).toHaveCount(0);

  const addButtons = page.getByRole('button', { name: /^Add / });
  await expect(addButtons.first()).toBeVisible();
  const names = await addButtons.evaluateAll((buttons) =>
    buttons.map((button) => button.getAttribute('aria-label') ?? '')
  );
  expect(names.length).toBeGreaterThan(0);
  expect(names.join(' ').toLowerCase()).not.toMatch(/peptide|glp/);

  await addButtons.first().click();

  await expect(page.getByRole('heading', { name: 'Fixture stack product' }).first()).toBeVisible();
  await expect(starter).toHaveCount(0);
  expect(session.saved()).toBe(true);
  expect(session.funnelCalls).toEqual([]);

  const invite = page.getByText('Priority early access');
  await expect(invite).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const position = await invite.evaluate((element) => {
    let node: HTMLElement | null = element.parentElement;
    while (node) {
      if (getComputedStyle(node).position === 'fixed') return 'fixed';
      node = node.parentElement;
    }
    return 'in-flow';
  });
  expect(position).toBe('in-flow');
});

test('a stack that already has a product does not show the first-add list', async ({ page }) => {
  const session = await prepareStack(page, true);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/stack');

  await expect(page.getByRole('heading', { name: 'Fixture stack product' }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Add the first thing you take' })).toHaveCount(0);
  await expect(page.getByText('Priority early access')).toHaveCount(0);
  expect(session.funnelCalls).toEqual([]);
});

test('guest shop does not show the first-add list', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Shop by Goal' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Add the first thing you take' })).toHaveCount(0);
});

test('empty signed-in shop shows the first-add list and the existing invite', async ({ page }) => {
  const session = await prepareStack(page, false);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const starter = page.getByRole('heading', { name: 'Add the first thing you take' });
  await expect(starter).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Shop by Goal' })).toBeVisible();
  await page.getByRole('button', { name: /^Add / }).first().click();

  await expect(starter).toHaveCount(0);
  await expect(page.getByText('Priority early access')).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(session.saved()).toBe(true);
  expect(session.funnelCalls).toEqual([]);
});

test('a signed-in shop with a product does not show the first-add list', async ({ page }) => {
  await prepareStack(page, true);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Shop by Goal' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Add the first thing you take' })).toHaveCount(0);
  await expect(page.getByText('Priority early access')).toHaveCount(0);
});

test('empty welcome leads with one-tap adds and keeps a single invite card', async ({ page }) => {
  const session = await prepareStack(page, false);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/welcome');

  const starter = page.getByRole('heading', { name: 'Add the first thing you take' });
  await expect(starter).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What are you building a stack for?' })).toBeVisible();
  await expect(page.getByText('Priority early access')).toHaveCount(1);

  await page.getByRole('button', { name: /^Add / }).first().click();

  await expect(starter).toHaveCount(0);
  await expect(page.getByText('Priority early access')).toHaveCount(1);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(session.saved()).toBe(true);
  expect(session.funnelCalls).toEqual([]);
});

test('welcome with a product does not show the first-add list', async ({ page }) => {
  await prepareStack(page, true);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/welcome');

  await expect(page.getByRole('heading', { name: 'What are you building a stack for?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Add the first thing you take' })).toHaveCount(0);
});
