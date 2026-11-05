import { createHash } from 'crypto';
import { isReferralCode } from '@/lib/growth/referral';

const DAY_MS = 24 * 60 * 60 * 1000;

export type ClaimReason = 'invalid' | 'self' | 'not_fresh' | 'duplicate';

export type ClaimDecision =
  | { record: true; ref: string; eventId: string }
  | { record: false; reason: ClaimReason };

/** Stable primary key so two overlapping claims for one account cannot insert twice. */
export function referralEventId(userId: string): string {
  const hash = createHash('sha256').update(`suppstack-referral:${userId.toLowerCase()}`).digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x50;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function evaluateReferralClaim(input: {
  ref: string | null;
  userId: string;
  createdAt: string;
  now: number;
  alreadyRecorded: boolean;
}): ClaimDecision {
  const ref = input.ref?.trim().toLowerCase() ?? '';
  if (!isReferralCode(ref)) return { record: false, reason: 'invalid' };
  if (ref === input.userId.toLowerCase()) return { record: false, reason: 'self' };
  const created = Date.parse(input.createdAt);
  if (!Number.isFinite(created) || input.now - created >= DAY_MS) {
    return { record: false, reason: 'not_fresh' };
  }
  if (input.alreadyRecorded) return { record: false, reason: 'duplicate' };
  return { record: true, ref, eventId: referralEventId(input.userId) };
}
