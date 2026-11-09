/**
 * Local fixtures for the first-product aggregate. No network and no accounts.
 *
 * Run:
 * TS_NODE_COMPILER_OPTIONS='{"module":"commonjs","moduleResolution":"node","esModuleInterop":true}' npx ts-node -r tsconfig-paths/register src/scripts/checkFirstProductAdds.ts
 */
import assert from 'node:assert/strict';
import { countFirstProductAdds, FIRST_PRODUCT_WINDOW_START } from '../lib/activation/first-product-adds';
import type { ListedUser } from '../lib/public-signup-count';

const WINDOW = FIRST_PRODUCT_WINDOW_START;
const AFTER = '2026-11-09T21:00:00.000Z';
const BEFORE = '2026-11-01T00:00:00.000Z';

const REAL = '11111111-1111-4111-8111-111111111111';
const EARLY = '22222222-2222-4222-8222-222222222222';
const STAFF = '33333333-3333-4333-8333-333333333333';
const BOT = '44444444-4444-4444-8444-444444444444';
const FLAGGED = '55555555-5555-4555-8555-555555555555';
const GONE = '66666666-6666-4666-8666-666666666666';
const UNDATED = '77777777-7777-4777-8777-777777777777';

function user(id: string, email: string, extra: Partial<ListedUser> = {}): ListedUser {
  return { id, email, ...extra };
}

const users: ListedUser[] = [
  user(REAL, 'person@example.com'),
  user(EARLY, 'early@example.com'),
  user(STAFF, 'review@suppstack.app'),
  user(BOT, 'bot@mail.grokbot.com'),
  user(FLAGGED, 'flagged@example.com', { app_metadata: { is_test: true } }),
  user(GONE, 'gone@example.com', { deleted_at: '2026-11-09T00:00:00.000Z' }),
  user(UNDATED, 'undated@example.com'),
];

const totals = countFirstProductAdds(
  users,
  [
    { user_id: REAL, created_at: AFTER },
    { user_id: REAL, created_at: '2026-11-09T22:00:00.000Z' },
    { user_id: EARLY, created_at: BEFORE },
    { user_id: EARLY, created_at: AFTER },
    { user_id: STAFF, created_at: AFTER },
    { user_id: BOT, created_at: AFTER },
    { user_id: FLAGGED, created_at: AFTER },
    { user_id: GONE, created_at: AFTER },
    { user_id: UNDATED, created_at: null },
    { user_id: UNDATED, created_at: 'not-a-time' },
  ],
  ['*@suppstack.app', '*@mail.grokbot.com'],
  WINDOW
);

assert.equal(totals.window_start, WINDOW);
assert.equal(totals.first_product_adds, 1);
assert.equal(totals.first_product_adds_before_window, 1);
assert.equal(totals.unknown_first_add_time, 1);

const exact = countFirstProductAdds(
  [user(REAL, 'person@example.com')],
  [{ user_id: REAL, created_at: WINDOW }],
  [],
  WINDOW
);
assert.equal(exact.first_product_adds, 1);

console.log('first-product add fixtures passed');
