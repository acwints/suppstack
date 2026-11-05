import assert from 'node:assert/strict';
import test from 'node:test';
import { isReferralCode, referralUrl } from './referral';
import type { ReferralCountEvent } from '@/lib/public-signup-count';
import {
  PRIORITY_TERMS,
  buildPriorityCohort,
  eligibleReferredIds,
  priorityStatusFor,
  rewardSummary,
  type PriorityAccount,
} from './referral-priority';

const EARLY = '11111111-1111-4111-8111-111111111111';
const LATER = '22222222-2222-4222-8222-222222222222';
const FRIEND = '33333333-3333-4333-8333-333333333333';
const OTHER = '44444444-4444-4444-8444-444444444444';
const REVIEW = '55555555-5555-4555-8555-555555555555';
const BOT = '66666666-6666-4666-8666-666666666666';
const FLAGGED = '77777777-7777-4777-8777-777777777777';

function account(id: string, email: string, createdAt: string, extra: Partial<PriorityAccount> = {}): PriorityAccount {
  return { id, email, createdAt, deleted_at: null, ...extra };
}

function referred(referrer: string, friend: string): ReferralCountEvent {
  return {
    user_id: friend,
    metadata: { kind: 'referral', referrer, referred_user_id: friend },
  };
}

const accounts: PriorityAccount[] = [
  account(EARLY, 'early@example.com', '2026-01-01T00:00:00.000Z'),
  account(LATER, 'later@example.com', '2026-02-01T00:00:00.000Z'),
  account(FRIEND, 'friend@example.com', '2026-03-01T00:00:00.000Z'),
  account(OTHER, 'other@example.com', '2026-01-15T00:00:00.000Z'),
  account(REVIEW, 'appreview@suppstack.app', '2025-12-01T00:00:00.000Z'),
  account(BOT, 'agent@mail.grokbot.com', '2025-12-15T00:00:00.000Z'),
  account(FLAGGED, 'flagged@gmail.com', '2025-11-01T00:00:00.000Z', { is_test: true }),
];

test('the invite link is the user id, not a short code', () => {
  const url = referralUrl(EARLY);
  assert.equal(url, `https://www.suppstack.app/?ref=${EARLY}`);
  assert.equal(new URL(url).searchParams.get('ref'), EARLY);
  assert.equal(isReferralCode(EARLY), true);
  assert.equal(url.includes('get_or_create_referral_code'), false);
});

test('a click without a stored referral does not earn priority', () => {
  const cohort = buildPriorityCohort(accounts, []);
  assert.equal(priorityStatusFor(EARLY, cohort).placement, 'standard');
  assert.equal(priorityStatusFor(EARLY, cohort).eligible_referrals, 0);
  assert.equal(cohort.priority.length, 0);
});

test('self, duplicate, short-code, and test referrals do not earn the reward', () => {
  const events: ReferralCountEvent[] = [
    referred(EARLY, EARLY),
    referred(EARLY, FRIEND),
    referred(EARLY, FRIEND),
    referred(EARLY, REVIEW),
    referred(EARLY, BOT),
    referred(EARLY, FLAGGED),
    { user_id: OTHER, metadata: { referrer: 'abc123def', referred_user_id: OTHER } },
    referred(REVIEW, FRIEND),
  ];

  assert.deepEqual(eligibleReferredIds(EARLY, events, accounts), [FRIEND]);
  const cohort = buildPriorityCohort(accounts, events);
  const early = priorityStatusFor(EARLY, cohort);
  assert.equal(early.placement, 'priority');
  assert.equal(early.eligible_referrals, 1);
  assert.equal(priorityStatusFor(REVIEW, cohort).placement, 'excluded');
  assert.equal(cohort.priority.some((member) => member.user_id === REVIEW), false);
  assert.equal(cohort.priority.some((member) => member.user_id === BOT), false);
  assert.equal(cohort.standard.some((member) => member.user_id === REVIEW), false);
});

test('priority group keeps signup order, not referral time', () => {
  const events = [
    referred(LATER, FRIEND),
    referred(EARLY, OTHER),
  ];
  const cohort = buildPriorityCohort(accounts, events);
  assert.deepEqual(
    cohort.priority.map((member) => member.user_id),
    [EARLY, LATER]
  );
  assert.equal(priorityStatusFor(EARLY, cohort).ahead_in_priority_group, 0);
  assert.equal(priorityStatusFor(LATER, cohort).ahead_in_priority_group, 1);
  assert.equal(priorityStatusFor(FRIEND, cohort).placement, 'standard');
  assert.ok(cohort.priority.every((member, index) => index === 0 || member.created_at! >= cohort.priority[index - 1]!.created_at!));
});

test('reward copy does not promise money, a date, or a count from a click', () => {
  const earned = rewardSummary(
    priorityStatusFor(EARLY, buildPriorityCohort(accounts, [referred(EARLY, FRIEND)]))
  );
  const waiting = rewardSummary(priorityStatusFor(LATER, buildPriorityCohort(accounts, [])));
  for (const copy of [earned, waiting]) {
    const text = `${copy.title} ${copy.detail} ${copy.terms}`;
    assert.equal(text.includes('$'), false);
    assert.match(text, /not a free month, a credit, or a promised date/i);
    assert.equal(text.toLowerCase().includes('launch'), false);
    assert.equal(copy.terms, PRIORITY_TERMS);
  }
  assert.match(earned.detail, /priority group/);
  assert.match(waiting.detail, /One eligible friend signup/);
  assert.match(PRIORITY_TERMS, /Copying the link does not count/);
  assert.match(PRIORITY_TERMS, /cannot refer yourself/i);
});
