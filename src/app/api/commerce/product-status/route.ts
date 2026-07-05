import { NextRequest, NextResponse } from 'next/server';
import { fetchShopifyProductJson } from '@/lib/catalog/shopify-catalog-verifier';
import { getShopifyVariantNumericId } from '@/lib/commerce/shopify-ucp';
import { allCuratedProductSeeds } from '@/lib/catalog/supplement-catalog';

function normalizeHost(host: string) {
  return host.toLowerCase().replace(/^www\./, '');
}

/**
 * Only merchant domains present in the catalog may be fetched; this endpoint
 * is unauthenticated and must not act as an open proxy (SSRF).
 */
const ALLOWED_MERCHANT_HOSTS = new Set(
  allCuratedProductSeeds
    .map((seed) => seed.shopify_store_domain)
    .filter((domain): domain is string => Boolean(domain))
    .map(normalizeHost)
);

/** product.js variant prices are integer cents on most stores, but some themes return dollar strings. */
function normalizePrice(value: number | string | undefined) {
  if (typeof value === 'number') return Math.round(value) / 100;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

/**
 * Resolves the live state of a Shopify variant at view time (availability,
 * price, variant title) from the merchant's public product JSON, so the
 * checkout panel reflects the merchant's current data instead of the baked
 * catalog snapshot.
 */
export async function POST(request: NextRequest) {
  let productUrl = '';
  let variantGid = '';

  try {
    const body = await request.json();
    productUrl = String(body.productUrl || '');
    variantGid = String(body.variantGid || '');
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const variantId = getShopifyVariantNumericId(variantGid);
  if (!productUrl || !variantId) {
    return NextResponse.json({ error: 'productUrl and variantGid are required.' }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(productUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid productUrl.' }, { status: 400 });
  }

  if (parsedUrl.protocol !== 'https:' || !ALLOWED_MERCHANT_HOSTS.has(normalizeHost(parsedUrl.hostname))) {
    return NextResponse.json({ error: 'Merchant domain is not allowed.' }, { status: 400 });
  }

  try {
    const { product } = await fetchShopifyProductJson(productUrl, 6000);

    if (!product) {
      return NextResponse.json({ status: 'unknown' });
    }

    const variant = product.variants?.find((item) => String(item.id) === variantId);

    if (!variant) {
      return NextResponse.json({ status: 'unavailable' });
    }

    return NextResponse.json({
      status: product.available === false || variant.available === false ? 'unavailable' : 'available',
      price: normalizePrice(variant.price),
      variantTitle: variant.title && variant.title !== 'Default Title' ? variant.title : null,
      productTitle: product.title ?? null,
    });
  } catch {
    return NextResponse.json({ status: 'unknown' });
  }
}
