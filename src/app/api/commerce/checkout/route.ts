import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Product } from '@/types';
import { createFallbackPurchaseSession } from '@/lib/commerce/purchase-session';
import { resolveShopifyPurchaseSession } from '@/lib/commerce/shopify-ucp-server';
import { isAllowedMerchantHost } from '@/lib/catalog/supplement-catalog';

/**
 * Extracts a bare hostname from a raw store-domain string that may include a
 * scheme or path (e.g. "https://cart.example.com/" -> "cart.example.com").
 */
function hostFromStoreDomain(storeDomain?: string | null): string | null {
  if (!storeDomain) return null;
  try {
    const withScheme = storeDomain.includes('://') ? storeDomain : `https://${storeDomain}`;
    return new URL(withScheme).hostname;
  } catch {
    return null;
  }
}

function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // commerce_checkout_events has RLS enabled with no client-facing policies, so
  // it can only be written with the service-role key. Fall back to the anon key
  // only for environments where the service role is not configured (writes will
  // then be denied by RLS, which is the safe failure mode).
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
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

    // UCP discovery makes outbound requests to the store domain. Since this
    // route is unauthenticated and the client controls the payload, only
    // attempt it for merchant hosts that are actually present in our catalog —
    // otherwise this endpoint could be used to probe arbitrary hosts (SSRF).
    const storeHost = hostFromStoreDomain(product.shopify_store_domain);
    const shouldAttemptUcp = Boolean(
      storeHost && product.shopify_variant_gid && isAllowedMerchantHost(storeHost)
    );
    const session = shouldAttemptUcp
      ? await resolveShopifyPurchaseSession(product, quantity)
      : createFallbackPurchaseSession(product, quantity);

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
