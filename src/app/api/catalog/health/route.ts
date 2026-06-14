import { NextResponse } from 'next/server';
import { getCatalogHealthReport } from '@/lib/catalog/catalog-health';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getCatalogHealthReport());
}
