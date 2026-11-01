import { NextRequest } from 'next/server';
import { publicSignupCountResponse } from '@/lib/server/public-signup-count';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export function GET(request: NextRequest) {
  return publicSignupCountResponse(request);
}
