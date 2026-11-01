/**
 * Contract checks for feedback validation. Run with:
 * npx ts-node -r tsconfig-paths/register src/scripts/checkFeedbackContract.ts
 */
import assert from 'assert';
import {
  FEEDBACK_MAX_MESSAGE,
  isMissingRelation,
  normalizePagePath,
  takeRateLimit,
  validateFeedback,
} from '../lib/feedback/validate';

function rejects(message: string, email?: string) {
  const result = validateFeedback({ message, email, pagePath: '/stack' });
  assert.strictEqual(result.ok, false, `expected reject for ${JSON.stringify({ message, email })}`);
}

const empty = validateFeedback({ message: '   ', pagePath: '/stack' });
assert.strictEqual(empty.ok, false);

rejects('');
rejects('x'.repeat(FEEDBACK_MAX_MESSAGE + 1));
rejects('hello', 'not-an-email');

const ok = validateFeedback({
  message: '  The stack screen should remember the last filter.  ',
  email: 'person@example.com',
  pagePath: '/stack',
  companyUrl: '   ',
});
assert.strictEqual(ok.ok, true);
if (ok.ok && !ok.honeypot) {
  assert.strictEqual(ok.message, 'The stack screen should remember the last filter.');
  assert.strictEqual(ok.email, 'person@example.com');
  assert.strictEqual(ok.pagePath, '/stack');
}

const max = validateFeedback({ message: 'x'.repeat(FEEDBACK_MAX_MESSAGE), pagePath: '/' });
assert.strictEqual(max.ok, true);

const bot = validateFeedback({ message: 'buy followers', pagePath: '/', companyUrl: 'https://spam.test' });
assert.strictEqual(bot.ok, true);
if (bot.ok) assert.strictEqual(bot.honeypot, true);

assert.strictEqual(normalizePagePath('https://evil.test'), null);
assert.strictEqual(normalizePagePath('//evil.test'), null);
assert.strictEqual(normalizePagePath('/stack?q=<script>'), null);
assert.strictEqual(normalizePagePath(''), '');

const buckets = new Map<string, { windowStart: number; count: number }>();
for (let i = 0; i < 5; i += 1) {
  assert.strictEqual(takeRateLimit(buckets, '1.1.1.1', 1_000, 5, 60_000).allowed, true);
}
const blocked = takeRateLimit(buckets, '1.1.1.1', 1_000, 5, 60_000);
assert.strictEqual(blocked.allowed, false);
assert.ok(blocked.retryAfterSeconds > 0);
assert.strictEqual(takeRateLimit(buckets, '1.1.1.1', 61_000, 5, 60_000).allowed, true);

assert.strictEqual(isMissingRelation({ code: 'PGRST205', message: 'schema cache' }), true);
assert.strictEqual(isMissingRelation({ code: '23514', message: 'check constraint' }), false);

console.log('feedback contract ok');
