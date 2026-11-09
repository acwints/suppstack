import assert from 'node:assert/strict';
import test from 'node:test';
import { claimPostIntentInvite, finishPostIntentInvite } from './post-intent-invite';

function memory() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

test('the post-save invite shows once, then not on a later save or checkout', () => {
  const storage = memory();
  assert.equal(claimPostIntentInvite(storage), true);
  assert.equal(claimPostIntentInvite(storage), false);
  finishPostIntentInvite(storage);
  assert.equal(claimPostIntentInvite(storage), false);
});
