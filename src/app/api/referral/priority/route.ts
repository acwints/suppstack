import { createHash, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  buildPriorityCohort,
  priorityStatusFor,
  type PriorityStatus,
} from '@/lib/growth/referral-priority';
import { loadPriorityInputs } from '@/lib/growth/referral-priority-load';
import { testAccountPatterns } from '@/lib/public-signup-count';
import { getAuthenticatedUserFromRequest, getSupabaseServiceClient } from '@/lib/server/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function noStore(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
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

async function cohortForRequest() {
  const supabase = getSupabaseServiceClient();
  if (!supabase) throw new Error('missing_service_role');
  const { accounts, events } = await loadPriorityInputs(supabase);
  return buildPriorityCohort(accounts, events, testAccountPatterns(process.env.TEST_ACCOUNT_EMAILS));
}

export async function GET(request: NextRequest) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || !process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) {
    return noStore({ error: 'Referral priority is not configured.' }, 503);
  }

  try {
    if (request.nextUrl.searchParams.get('cohort') === '1') {
      const expected = process.env.FEEDBACK_READ_TOKEN?.trim();
      const provided = readToken(request);
      if (!expected || !provided || !tokensMatch(provided, expected)) {
        return noStore({ error: 'Not found.' }, 404);
      }
      const cohort = await cohortForRequest();
      return noStore({
        required_referrals: cohort.required_referrals,
        order: 'priority group by signup time, then standard group by signup time',
        priority: cohort.priority,
        standard: cohort.standard,
      });
    }

    const user = await getAuthenticatedUserFromRequest(request);
    if (!user) return noStore({ error: 'Sign in required.' }, 401);
    const cohort = await cohortForRequest();
    const status: PriorityStatus = priorityStatusFor(user.id, cohort);
    return noStore(status);
  } catch (error) {
    const missing = error instanceof Error && error.message === 'missing_service_role';
    console.error('referral priority failed', missing ? 'missing_service_role' : 'load_failed');
    return noStore({ error: 'Referral priority is unavailable.' }, 503);
  }
}
