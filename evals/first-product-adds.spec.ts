import { expect, test } from '@playwright/test';

const READ_TOKEN = 'eval-read-token';

test('first-product counts require the read token and return no account rows', async ({ request }) => {
  const missing = await request.get('/api/activation/first-product-adds');
  expect(missing.status()).toBe(401);
  const missingBody = await missing.json();
  expect(missingBody).toEqual({ error: 'Unauthorized.' });

  const wrong = await request.get('/api/activation/first-product-adds', {
    headers: { Authorization: 'Bearer not-the-token' },
  });
  expect(wrong.status()).toBe(401);
  expect(await wrong.json()).toEqual({ error: 'Unauthorized.' });

  const allowed = await request.get('/api/activation/first-product-adds', {
    headers: { Authorization: `Bearer ${READ_TOKEN}` },
  });
  expect(allowed.status()).toBe(503);
  const body = await allowed.json();
  expect(body).toEqual({ error: 'First-product counts are unavailable.' });
  expect(JSON.stringify(body)).not.toContain('@');
});
