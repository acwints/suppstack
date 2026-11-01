import { createHash, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { jsonError } from '@/lib/server/http';
import { getAuthenticatedUserFromRequest } from '@/lib/server/supabase';
import { listFeedback, saveFeedback } from '@/lib/feedback/store';
import {
  clipUserAgent,
  takeRateLimit,
  validateFeedback,
  type FeedbackInput,
} from '@/lib/feedback/validate';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const buckets = new Map<string, { windowStart: number; count: number }>();

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const first = forwarded?.split(',')[0]?.trim();
  return first || 'unknown';
}

function tokensMatch(provided: string, expected: string): boolean {
  const a = createHash('sha256').update(provided).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

function readToken(request: NextRequest): string {
  const header = request.headers.get('authorization') ?? '';
  const bearer = header.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  if (bearer) return bearer;
  return new URL(request.url).searchParams.get('token')?.trim() ?? '';
}

export async function POST(request: NextRequest) {
  const length = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(length) && length > 16_000) {
    return jsonError('That note is too large.', 413, 'payload_too_large');
  }

  let body: FeedbackInput;
  try {
    body = (await request.json()) as FeedbackInput;
  } catch {
    return jsonError('Send the note as JSON.', 400, 'invalid_json');
  }

  const parsed = validateFeedback({
    message: body.message,
    email: body.email,
    pagePath: body.pagePath,
    companyUrl: body.companyUrl,
  });

  if (!parsed.ok) {
    return jsonError(parsed.error, 400, 'invalid_feedback');
  }

  // Bots that fill the hidden field get the same response as a real send.
  if (parsed.honeypot) {
    return NextResponse.json({ ok: true });
  }

  const limit = takeRateLimit(buckets, clientIp(request), Date.now(), RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.allowed) {
    return jsonError('Too many notes from this network. Try again later.', 429, 'rate_limited');
  }

  const user = await getAuthenticatedUserFromRequest(request);
  const saved = await saveFeedback({
    message: parsed.message,
    email: parsed.email,
    pagePath: parsed.pagePath,
    userId: user?.id ?? null,
    userAgent: clipUserAgent(request.headers.get('user-agent')),
    createdAt: new Date().toISOString(),
  });

  if (!saved.ok) {
    return jsonError('Could not store that note.', 503, 'store_unavailable');
  }

  console.info('feedback stored', saved.store);
  return NextResponse.json({ ok: true });
}

export async function GET(request: NextRequest) {
  const expected = process.env.FEEDBACK_READ_TOKEN?.trim();
  if (!expected) {
    return jsonError('Not found', 404, 'not_found');
  }

  const provided = readToken(request);
  if (!provided || !tokensMatch(provided, expected)) {
    return jsonError('Not found', 404, 'not_found');
  }

  const listed = await listFeedback(100);
  if (!listed.ok) {
    return jsonError('Could not read notes.', 503, 'store_unavailable');
  }

  return NextResponse.json(
    { records: listed.records },
    { headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } }
  );
}
