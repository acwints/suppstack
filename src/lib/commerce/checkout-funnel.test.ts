import assert from 'node:assert/strict';
import test from 'node:test';
import {
  aggregateCheckoutFunnel,
  funnelStatusForOutcome,
  isCheckoutAttemptId,
} from './checkout-funnel';

test('opened starts checkout and only completed counts as completed', () => {
  assert.equal(funnelStatusForOutcome('opened'), 'started');
  assert.equal(funnelStatusForOutcome('completed'), 'completed');
  assert.equal(funnelStatusForOutcome('dismissed'), 'dismissed');
  assert.equal(funnelStatusForOutcome('failed'), 'failed');
  assert.equal(funnelStatusForOutcome('unknown'), null);
  assert.equal(funnelStatusForOutcome('ready'), null);
});

test('completed and dismissed count as started, failed and unknown do not', () => {
  const totals = aggregateCheckoutFunnel([
    { attemptId: '11111111-1111-4111-8111-111111111111', status: 'started' },
    { attemptId: '22222222-2222-4222-8222-222222222222', status: 'completed' },
    { attemptId: '33333333-3333-4333-8333-333333333333', status: 'dismissed' },
    { attemptId: '44444444-4444-4444-8444-444444444444', status: 'failed' },
  ]);
  assert.deepEqual(totals, { started: 3, completed: 1, dismissed: 1, failed: 1 });
});

test('the same attempt id is not counted twice', () => {
  const id = '55555555-5555-4555-8555-555555555555';
  assert.equal(isCheckoutAttemptId(id), true);
  assert.equal(isCheckoutAttemptId('not-an-id'), false);
  const totals = aggregateCheckoutFunnel([
    { attemptId: id, status: 'completed' },
    { attemptId: id.toUpperCase(), status: 'completed' },
  ]);
  assert.deepEqual(totals, { started: 1, completed: 1, dismissed: 0, failed: 0 });
});
