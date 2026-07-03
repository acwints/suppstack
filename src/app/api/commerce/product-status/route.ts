import { NextRequest, NextResponse } from 'next/server';
import { getShopifyProductJsonUrl } from '@/lib/catalog/shopify-catalog-verifier';
import { getShopifyVariantNumericId } from '@/lib/commerce/shopify-ucp';

interface ShopifyVariantJson {
  id: number;
  title?: string;
  price?: number | string;
  available?: boolean;
}

/** product.js variant prices are integer cents on most stores, but some themes return dollar strings. */
function normalizePrice(value: number | string | undefined) {
  if (typeof value === 'number') return Math.round(value) / 100;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

interface ShopifyProductJson {
  id: number;
  title?: string;
  available?: boolean;
  variants?: ShopifyVariantJson[];
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

  try {
    const jsonUrl = getShopifyProductJsonUrl(productUrl);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    let response: Response;
    try {
      response = await fetch(jsonUrl, {
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          accept: 'application/json,text/javascript,*/*;q=0.8',
          'user-agent': 'SuppStackLiveStatus/1.0',
        },
        next: { revalidate: 300 },
      });
    } finally {
      clearTimeout(timeout);
    }

    const body = await response.text();
    if (!response.ok || body.trim().startsWith('<')) {
      return NextResponse.json({ status: 'unknown' });
    }

    const product = JSON.parse(body) as ShopifyProductJson;
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
