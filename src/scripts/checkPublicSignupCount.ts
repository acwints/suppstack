/**
 * Pure checks for the public signup count. Run with:
 * npx ts-node -r tsconfig-paths/register src/scripts/checkPublicSignupCount.ts
 */
import assert from 'assert';
import { countFromUserPage, liveUserCount } from '../lib/public-signup-count';

assert.strictEqual(liveUserCount([{ deleted_at: null }, { deleted_at: '2026-01-01' }]), 1);

const fromHeader = countFromUserPage(12, [{ deleted_at: null }], 1);
assert.deepStrictEqual(fromHeader, { done: true, count: 12 });

const empty = countFromUserPage(0, [], 1000);
assert.deepStrictEqual(empty, { done: true, count: 0 });

const shortPage = countFromUserPage(0, [{ deleted_at: null }, { deleted_at: 'x' }], 1000);
assert.deepStrictEqual(shortPage, { done: true, count: 1 });

const fullPage = countFromUserPage(0, [{ deleted_at: null }, { deleted_at: null }], 2);
assert.deepStrictEqual(fullPage, { done: false });

console.log('public signup count ok');
