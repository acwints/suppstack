import assert from 'node:assert/strict';
import test from 'node:test';
import { REFERRAL_SIGNUP_PROMPT, showReferralSignupPrompt } from './referral-signup-prompt';
import {
  copyLinkResult,
  loginRedirectWithRef,
  refFromSearch,
  referralUrl,
} from './referral';
import { createReferralClaimer, shouldForgetStoredRef } from './referral-client-claim';
import { evaluateReferralClaim, referralEventId } from './referral-claim';

const REFERRER = '11111111-1111-4111-8111-111111111111';
const FRIEND = '22222222-2222-4222-8222-222222222222';
const NOW = Date.parse('2026-11-05T20:00:00.000Z');
const CREATED = '2026-11-05T19:00:00.000Z';

test('share URL is the authenticated user id', () => {
  assert.equal(referralUrl(REFERRER), `https://www.suppstack.app/?ref=${REFERRER}`);
  assert.equal(refFromSearch(`?ref=${REFERRER}`), REFERRER);
  assert.equal(refFromSearch(`?code=oauth&ref=${REFERRER.toUpperCase()}`), REFERRER);
  assert.equal(refFromSearch('?ref=nope'), null);
});

test('oauth return keeps the stored ref on /login', () => {
  const url = loginRedirectWithRef('https://www.suppstack.app', REFERRER);
  assert.equal(url, `https://www.suppstack.app/login?ref=${REFERRER}`);
  assert.equal(refFromSearch(new URL(url).search), REFERRER);
});

test('a fresh referred signup is claimed once', () => {
  const first = evaluateReferralClaim({
    ref: REFERRER,
    userId: FRIEND,
    createdAt: CREATED,
    now: NOW,
    alreadyRecorded: false,
  });
  const second = evaluateReferralClaim({
    ref: REFERRER,
    userId: FRIEND,
    createdAt: CREATED,
    now: NOW,
    alreadyRecorded: true,
  });
  assert.equal(first.record, true);
  if (!first.record) return;
  assert.equal(first.eventId, referralEventId(FRIEND));
  assert.equal(second.record, false);
  if (second.record) return;
  assert.equal(second.reason, 'duplicate');
  assert.equal(referralEventId(FRIEND), referralEventId(FRIEND.toUpperCase()));
});

test('self, stale, and invalid refs are not recorded', () => {
  assert.deepEqual(
    evaluateReferralClaim({
      ref: FRIEND,
      userId: FRIEND,
      createdAt: CREATED,
      now: NOW,
      alreadyRecorded: false,
    }),
    { record: false, reason: 'self' }
  );
  assert.deepEqual(
    evaluateReferralClaim({
      ref: REFERRER,
      userId: FRIEND,
      createdAt: '2026-11-01T00:00:00.000Z',
      now: NOW,
      alreadyRecorded: false,
    }),
    { record: false, reason: 'not_fresh' }
  );
  assert.deepEqual(
    evaluateReferralClaim({
      ref: 'not a code',
      userId: FRIEND,
      createdAt: CREATED,
      now: NOW,
      alreadyRecorded: false,
    }),
    { record: false, reason: 'invalid' }
  );
});

test('overlapping claims post once, and a failed post keeps the ref', async () => {
  let stored: string | null = REFERRER;
  let posts = 0;
  let release: (() => void) | undefined;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const claim = createReferralClaimer({
    readRef: () => stored,
    clearRef: () => {
      stored = null;
    },
    post: async () => {
      posts += 1;
      await gate;
      return { ok: false, body: null };
    },
  });

  const first = claim('token');
  const second = claim('token');
  release?.();
  await Promise.all([first, second]);
  assert.equal(posts, 1);
  assert.equal(stored, REFERRER);
  assert.equal(shouldForgetStoredRef(false, null), false);
  assert.equal(shouldForgetStoredRef(true, { recorded: true }), true);
  assert.equal(shouldForgetStoredRef(true, { recorded: false, reason: 'duplicate' }), true);
});

test('a denied clipboard keeps the link selectable', () => {
  assert.deepEqual(copyLinkResult(true), { button: 'Copied', note: null });
  assert.deepEqual(copyLinkResult(false), {
    button: 'Copy link',
    note: 'Couldn’t copy. Select the link above.',
  });
});

test('the homepage prompt is only for a stored web invite', () => {
  assert.equal(showReferralSignupPrompt(REFERRER, false), true);
  assert.equal(showReferralSignupPrompt(null, false), false);
  assert.equal(showReferralSignupPrompt(REFERRER, true), false);
  const text = REFERRAL_SIGNUP_PROMPT;
  assert.equal(text.includes('$'), false);
  assert.equal(text.toLowerCase().includes('priority'), false);
  assert.equal(text.toLowerCase().includes('free'), false);
});
