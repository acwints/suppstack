/**
 * Pure checks for the public signup count. Run with:
 * TS_NODE_COMPILER_OPTIONS='{"module":"commonjs","moduleResolution":"node","esModuleInterop":true}' npx ts-node -r tsconfig-paths/register src/scripts/checkPublicSignupCount.ts
 */
import assert from 'assert';
import {
  countFromUserPage,
  liveUserCount,
  publicCountFromUsers,
  publicReferralCount,
  testAccountPatterns,
} from '../lib/public-signup-count';

assert.strictEqual(liveUserCount([{ deleted_at: null }, { deleted_at: '2026-01-01' }]), 1);

const fromHeader = countFromUserPage(12, [{ deleted_at: null }], 1);
assert.deepStrictEqual(fromHeader, { done: false });

const empty = countFromUserPage(0, [], 1000);
assert.deepStrictEqual(empty, { done: true, count: 0 });

const shortPage = countFromUserPage(0, [{ deleted_at: null }, { deleted_at: 'x' }], 1000);
assert.deepStrictEqual(shortPage, { done: true, count: 1 });

const fullPage = countFromUserPage(0, [{ deleted_at: null }, { deleted_at: null }], 2);
assert.deepStrictEqual(fullPage, { done: false });

const patterns = testAccountPatterns('qa@example.com');
const real = { id: 'real-user', email: 'ada@example.com', deleted_at: null };
const testSignup = { id: 'app-review', email: 'appreview@suppstack.app', deleted_at: null };
const beforeUsers = [real];
const beforeEvents: [] = [];
assert.strictEqual(publicCountFromUsers(1, beforeUsers, patterns), 1);
assert.strictEqual(publicReferralCount(beforeEvents, beforeUsers, patterns), 0);

const afterUsers = [
  real,
  testSignup,
  { id: 'flagged', email: 'person@gmail.com', app_metadata: { is_test: true } },
];
const afterEvents = [
  {
    user_id: testSignup.id,
    metadata: { kind: 'referral', referrer: real.id, referred_user_id: testSignup.id },
  },
  { user_id: 'flagged', metadata: { referred_user_id: 'flagged' } },
];
assert.strictEqual(publicCountFromUsers(3, afterUsers, patterns), 1);
assert.strictEqual(publicReferralCount(afterEvents, afterUsers, patterns), 0);
assert.strictEqual(publicCountFromUsers(0, afterUsers, patterns), 1);
assert.strictEqual(
  publicReferralCount([{ user_id: real.id }, ...afterEvents], afterUsers, patterns),
  1
);

console.log('public signup count ok');
