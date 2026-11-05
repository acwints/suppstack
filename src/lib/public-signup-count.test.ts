import assert from 'node:assert/strict';
import test from 'node:test';
import {
  publicCountFromUsers,
  publicReferralCount,
  testAccountPatterns,
  type ListedUser,
  type ReferralCountEvent,
} from './public-signup-count';

const patterns = testAccountPatterns('qa@example.com,*@example.test');

const real: ListedUser = { id: 'real-user', email: 'ada@example.com', deleted_at: null };

test('default allowlist excludes suppstack.app and mail.grokbot.com', () => {
  const defaults = testAccountPatterns(undefined);
  assert.equal(defaults.includes('*@suppstack.app'), true);
  assert.equal(defaults.includes('appreview@suppstack.app'), true);
  assert.equal(defaults.includes('*@mail.grokbot.com'), true);
  const users = [
    real,
    { id: 'review', email: 'appreview@suppstack.app' },
    { id: 'staff', email: 'hello@suppstack.app' },
    { id: 'bot', email: 'agent@mail.grokbot.com' },
    { id: 'qa', email: 'qa@example.com' },
    { id: 'domain', email: 'bot@example.test' },
    { id: 'other-domain', email: 'person@grokbot.com' },
  ];
  assert.equal(publicCountFromUsers(users.length, users, patterns), 2);
  assert.equal(publicCountFromUsers(0, users, patterns), 2);
});

test('a flagged test signup with a referral does not change count or referrals', () => {
  const beforeUsers = [real];
  const beforeEvents: ReferralCountEvent[] = [];
  const countBefore = publicCountFromUsers(beforeUsers.length, beforeUsers, patterns);
  const referralsBefore = publicReferralCount(beforeEvents, beforeUsers, patterns);

  const testSignup: ListedUser = {
    id: 'test-signup',
    email: 'agent@mail.grokbot.com',
    deleted_at: null,
  };
  const flagged: ListedUser = {
    id: 'flagged-signup',
    email: 'someone@gmail.com',
    user_metadata: { is_test: true },
  };
  const afterUsers = [...beforeUsers, testSignup, flagged];
  const afterEvents: ReferralCountEvent[] = [
    {
      user_id: testSignup.id,
      metadata: {
        kind: 'referral',
        referrer: real.id,
        referred_user_id: testSignup.id,
      },
    },
    {
      user_id: null,
      metadata: { kind: 'referral', referrer: 'abc123', referred_user_id: flagged.id },
    },
  ];

  assert.equal(publicCountFromUsers(afterUsers.length, afterUsers, patterns), countBefore);
  assert.equal(publicReferralCount(afterEvents, afterUsers, patterns), referralsBefore);
  assert.equal(countBefore, 1);
  assert.equal(referralsBefore, 0);
});

test('a real signup with a referral still counts', () => {
  const referred: ListedUser = { id: 'new-real', email: 'bea@example.com' };
  const users = [real, referred, { id: 'review', email: 'appreview@suppstack.app' }];
  const events: ReferralCountEvent[] = [
    { user_id: referred.id, metadata: { referrer: real.id, referred_user_id: referred.id } },
    { user_id: 'review', metadata: { referrer: real.id, referred_user_id: 'review' } },
  ];
  assert.equal(publicCountFromUsers(users.length, users, patterns), 2);
  assert.equal(publicReferralCount(events, users, patterns), 1);
});

test('is_test on the user object is enough without a matching email', () => {
  const flagged: ListedUser = { id: 'flag', email: 'not-a-test@gmail.com', is_test: true };
  assert.equal(publicCountFromUsers(2, [real, flagged], patterns), 1);
  assert.equal(publicReferralCount([{ user_id: 'FLAG' }], [real, flagged], patterns), 0);
});
