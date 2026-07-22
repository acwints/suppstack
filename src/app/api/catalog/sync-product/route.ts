import { NextResponse } from 'next/server';
import { findCatalogProductById } from '@/lib/catalog/supplement-catalog';
import { resolveDatabaseProductIdWithClient } from '@/lib/catalog/catalog-db-sync';
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

  const body = (await request.json().catch(() => null)) as { productId?: unknown } | null;
  const productId = typeof body?.productId === 'string' ? body.productId : '';
  const product = findCatalogProductById(productId);

  if (!product) return jsonError('Unknown catalog product.', 400);

  try {
    const databaseProductId = await resolveDatabaseProductIdWithClient(supabase, product);

    return NextResponse.json(
      { productId: databaseProductId },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Catalog product sync failed:', error);
    return jsonError('Unable to sync catalog product.', 500);
  }
}
