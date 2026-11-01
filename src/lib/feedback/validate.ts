export const FEEDBACK_MAX_MESSAGE = 2000;
export const FEEDBACK_MAX_EMAIL = 320;
export const FEEDBACK_MAX_PATH = 300;
export const FEEDBACK_MAX_USER_AGENT = 400;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface FeedbackInput {
  message: string;
  email?: string | null;
  pagePath?: string | null;
  companyUrl?: string | null;
}

export type FeedbackValidation =
  | { ok: true; honeypot: true }
  | {
      ok: true;
      honeypot: false;
      message: string;
      email: string | null;
      pagePath: string;
    }
  | { ok: false; error: string };

export function validateFeedback(input: FeedbackInput): FeedbackValidation {
  if (typeof input.companyUrl === 'string' && input.companyUrl.trim() !== '') {
    return { ok: true, honeypot: true };
  }

  if (typeof input.message !== 'string') {
    return { ok: false, error: 'Write a short note before sending.' };
  }

  const message = input.message.replace(/\0/g, '').trim();
  if (!message) {
    return { ok: false, error: 'Write a short note before sending.' };
  }
  if (message.length > FEEDBACK_MAX_MESSAGE) {
    return { ok: false, error: `Keep the note under ${FEEDBACK_MAX_MESSAGE} characters.` };
  }

  let email: string | null = null;
  if (typeof input.email === 'string' && input.email.trim() !== '') {
    email = input.email.trim();
    if (email.length > FEEDBACK_MAX_EMAIL || !EMAIL.test(email)) {
      return { ok: false, error: 'That email does not look valid.' };
    }
  }

  const pagePath = normalizePagePath(input.pagePath);
  if (pagePath === null) {
    return { ok: false, error: 'That page path is not valid.' };
  }

  return { ok: true, honeypot: false, message, email, pagePath };
}

export function normalizePagePath(value: string | null | undefined): string | null {
  if (value == null || value === '') return '';
  if (typeof value !== 'string') return null;
  const path = value.trim();
  if (path.length > FEEDBACK_MAX_PATH) return null;
  if (!path.startsWith('/') || path.startsWith('//')) return null;
  if (/[\s<>]/.test(path)) return null;
  return path;
}

export function clipUserAgent(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.replace(/\0/g, '').trim();
  if (!trimmed) return null;
  return trimmed.slice(0, FEEDBACK_MAX_USER_AGENT);
}

export interface RateLimit {
  allowed: boolean;
  retryAfterSeconds: number;
}

/**
 * Fixed-window counter. `now` and `windowMs` are injected so tests do not sleep.
 * Callers keep one bucket map per process; serverless instances do not share it.
 */
export function takeRateLimit(
  buckets: Map<string, { windowStart: number; count: number }>,
  key: string,
  now: number,
  limit: number,
  windowMs: number
): RateLimit {
  const current = buckets.get(key);
  if (!current || now - current.windowStart >= windowMs) {
    buckets.set(key, { windowStart: now, count: 1 });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (current.count >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - current.windowStart)) / 1000));
    return { allowed: false, retryAfterSeconds };
  }
  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function isMissingRelation(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === '42P01' || error.code === 'PGRST205') return true;
  const message = (error.message ?? '').toLowerCase();
  return message.includes('does not exist') || message.includes('schema cache');
}
