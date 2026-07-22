import { NextResponse } from 'next/server';
import { findCatalogSupplementById } from '@/lib/catalog/supplement-catalog';
import { resolveDatabaseSupplementIdWithClient } from '@/lib/catalog/catalog-db-sync';
import {
  getAuthenticatedUserFromRequest,
  getSupabaseServiceClient,
} from '@/lib/server/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function jsonError(error: string, status: number) {
  return NextResponse.json(
    { error },
    {
      status,
      headers: { 'Cache-Control': 'no-store' },
    }
  );
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUserFromRequest(request);
  if (!user) return jsonError('A signed-in session is required.', 401);

  const supabase = getSupabaseServiceClient();
  if (!supabase) return jsonError('Catalog sync is not configured.', 503);

  const body = (await request.json().catch(() => null)) as { supplementId?: unknown } | null;
  const supplementId = Number(body?.supplementId);

  if (!Number.isInteger(supplementId) || !findCatalogSupplementById(supplementId)) {
    return jsonError('Unknown catalog supplement.', 400);
  }

  try {
    const databaseSupplementId = await resolveDatabaseSupplementIdWithClient(
      supabase,
      supplementId
    );

    return NextResponse.json(
      { supplementId: databaseSupplementId },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Catalog supplement sync failed:', error);
    return jsonError('Unable to sync catalog supplement.', 500);
  }
}
