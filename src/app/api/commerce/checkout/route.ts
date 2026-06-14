import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Product } from '@/types';
import { createFallbackPurchaseSession } from '@/lib/commerce/purchase-session';
import { resolveShopifyPurchaseSession } from '@/lib/commerce/shopify-ucp-server';

function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {
      persistSession: false,
    },
  });
}

async function recordCheckoutEvent(product: Product, session: any, quantity: number) {
  const client = supabaseServer();
  if (!client) return;

  await client
    .from('commerce_checkout_events')
    .insert({
      product_id: String(product.product_id),
      supplement_id: product.supplement_id || product.supplements?.supplement_id || null,
      provider: session.provider,
      session_mode: session.mode,
      status: session.status,
      purchase_url: session.purchaseUrl,
      fallback_url: session.fallbackUrl || null,
      metadata: {
        quantity,
        label: session.label,
        product_name: product.product_name,
        brand_name: product.brands?.brand_name,
        capability_status: session.capabilityStatus,
        messages: session.messages,
      },
    });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const product = body.product as Product | undefined;
    const quantity = Math.max(1, Number(body.quantity || 1));

    if (!product?.product_id || !product.product_name) {
      return NextResponse.json({ error: 'A product payload is required.' }, { status: 400 });
    }

    const shouldAttemptUcp = Boolean(product.shopify_store_domain && product.shopify_variant_gid);
    const session = shouldAttemptUcp
      ? await resolveShopifyPurchaseSession(product, quantity)
      : createFallbackPurchaseSession(product);

    recordCheckoutEvent(product, session, quantity).catch(() => undefined);

    return NextResponse.json({ session });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unable to create purchase session.',
      },
      { status: 500 }
    );
  }
}
