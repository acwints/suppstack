import assert from 'node:assert/strict';
import test from 'node:test';
import { claimPostIntentInvite, finishPostIntentInvite, postIntentInviteRenderable } from './post-intent-invite';

function memory() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

test('the invite does not render over an open checkout dialog', () => {
  assert.equal(postIntentInviteRenderable(true, true), false);
  assert.equal(postIntentInviteRenderable(true, false), true);
  assert.equal(postIntentInviteRenderable(false, false), false);
});

test('the post-save invite shows once, then not on a later save or checkout', () => {
  const storage = memory();
  assert.equal(claimPostIntentInvite(storage), true);
  assert.equal(claimPostIntentInvite(storage), false);
  finishPostIntentInvite(storage);
  assert.equal(claimPostIntentInvite(storage), false);
});
