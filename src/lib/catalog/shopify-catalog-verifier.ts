import type { Product } from '@/types';
import { getShopifyVariantNumericId } from '@/lib/commerce/shopify-ucp';

export interface CatalogShopifyEntry {
  productId: string;
  productName: string;
  productUrl: string;
  storeDomain: string;
  shopifyProductId: string;
  shopifyVariantId: string;
}

export interface ShopifyCatalogVerificationResult {
  ok: boolean;
  productId: string;
  productName: string;
  message: string;
  productJsonUrl?: string;
}

export interface ShopifyVariantJson {
  id: number;
  title?: string;
  price?: number | string;
  available?: boolean;
}

export interface ShopifyProductJson {
  id: number;
  title?: string;
  available?: boolean;
  variants?: ShopifyVariantJson[];
}

interface ShopifyCollectionProduct extends ShopifyProductJson {
  handle?: string;
}

function productGidNumericId(value?: string | null) {
  if (!value) return null;
  const match = value.split('?')[0].match(/(\d+)$/);
  return match?.[1] ?? null;
}

export function getCatalogShopifyEntries(products: Product[]): CatalogShopifyEntry[] {
  return products.flatMap((product) => {
    const shopifyProductId = productGidNumericId(product.shopify_product_gid);
    const shopifyVariantId = getShopifyVariantNumericId(product.shopify_variant_gid);

    if (
      !product.product_url ||
      !product.shopify_store_domain ||
      !shopifyProductId ||
      !shopifyVariantId
    ) {
      return [];
    }

    return [
      {
        productId: String(product.product_id),
        productName: product.product_name,
        productUrl: product.product_url,
        storeDomain: product.shopify_store_domain,
        shopifyProductId,
        shopifyVariantId,
      },
    ];
  });
}

export function getShopifyProductJsonUrl(productUrl: string) {
  const url = new URL(productUrl);
  url.search = '';
  url.hash = '';
  url.pathname = url.pathname.replace(/\/$/, '');
  if (!url.pathname.endsWith('.js')) {
    url.pathname = `${url.pathname}.js`;
  }
  return url.toString();
}

function getShopifyCollectionJsonUrl(productUrl: string) {
  const url = new URL(productUrl);
  return `${url.origin}/products.json?limit=250`;
}

function getShopifyProductHandle(productUrl: string) {
  const pathname = new URL(productUrl).pathname.replace(/\/$/, '');
  const match = pathname.match(/\/products\/([^/]+)$/);
  return match?.[1] ?? null;
}

async function fetchWithTimeout(url: string, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        accept: 'application/json,text/javascript,*/*;q=0.8',
        // Some storefront bot filters (e.g. nutricost.com) 503 non-browser
        // user agents on product endpoints.
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      },
      // Cached for 60s when running inside the Next.js server runtime;
      // ignored by plain Node fetch in CLI scripts.
      next: { revalidate: 60 },
    });
  } finally {
    clearTimeout(timeout);
  }
}

export interface ShopifyProductJsonFetchResult {
  product: ShopifyProductJson | null;
  sourceUrl: string;
  status: number;
}

/**
 * Fetches the public product JSON for a Shopify product URL. Tries the
 * per-product `{handle}.js` endpoint first; headless storefronts (e.g.
 * davidprotein.com) disable it, so we fall back to the store-wide
 * `/products.json` collection endpoint and match on handle.
 */
export async function fetchShopifyProductJson(
  productUrl: string,
  timeoutMs = 10000
): Promise<ShopifyProductJsonFetchResult> {
  const productJsonUrl = getShopifyProductJsonUrl(productUrl);
  const response = await fetchWithTimeout(productJsonUrl, timeoutMs);
  const body = await response.text();

  if (response.ok && !body.trim().startsWith('<')) {
    return {
      product: JSON.parse(body) as ShopifyProductJson,
      sourceUrl: productJsonUrl,
      status: response.status,
    };
  }

  const handle = getShopifyProductHandle(productUrl);
  if (!handle) {
    return { product: null, sourceUrl: productJsonUrl, status: response.status };
  }

  const collectionUrl = getShopifyCollectionJsonUrl(productUrl);
  const collectionResponse = await fetchWithTimeout(collectionUrl, timeoutMs);
  const collectionBody = await collectionResponse.text();

  if (!collectionResponse.ok || collectionBody.trim().startsWith('<')) {
    return { product: null, sourceUrl: collectionUrl, status: collectionResponse.status };
  }

  const collection = JSON.parse(collectionBody) as { products?: ShopifyCollectionProduct[] };
  const match = collection.products?.find((item) => item.handle === handle);

  if (!match) {
    return { product: null, sourceUrl: collectionUrl, status: 404 };
  }

  return { product: match, sourceUrl: collectionUrl, status: collectionResponse.status };
}

export async function verifyCatalogShopifyEntry(
  entry: CatalogShopifyEntry,
  timeoutMs = 10000
): Promise<ShopifyCatalogVerificationResult> {
  const { product, sourceUrl: productJsonUrl, status } = await fetchShopifyProductJson(
    entry.productUrl,
    timeoutMs
  );

  if (!product) {
    return {
      ok: false,
      productId: entry.productId,
      productName: entry.productName,
      productJsonUrl,
      message: `${entry.productId}: ${status} from ${productJsonUrl}`,
    };
  }

  const variant = product.variants?.find((item) => String(item.id) === entry.shopifyVariantId);

  if (String(product.id) !== entry.shopifyProductId) {
    return {
      ok: false,
      productId: entry.productId,
      productName: entry.productName,
      productJsonUrl,
      message: `${entry.productId}: product id mismatch catalog=${entry.shopifyProductId} live=${product.id}`,
    };
  }

  if (!variant) {
    return {
      ok: false,
      productId: entry.productId,
      productName: entry.productName,
      productJsonUrl,
      message: `${entry.productId}: variant ${entry.shopifyVariantId} not found`,
    };
  }

  if (product.available === false || variant.available === false) {
    return {
      ok: false,
      productId: entry.productId,
      productName: entry.productName,
      productJsonUrl,
      message: `${entry.productId}: live product or variant is unavailable`,
    };
  }

  return {
    ok: true,
    productId: entry.productId,
    productName: entry.productName,
    productJsonUrl,
    message: `${entry.productId}: ${entry.productName}`,
  };
}

export async function verifyCatalogShopifyEntries(
  entries: CatalogShopifyEntry[],
  timeoutMs = 10000
) {
  const results: ShopifyCatalogVerificationResult[] = [];

  for (const entry of entries) {
    try {
      results.push(await verifyCatalogShopifyEntry(entry, timeoutMs));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({
        ok: false,
        productId: entry.productId,
        productName: entry.productName,
        productJsonUrl: getShopifyProductJsonUrl(entry.productUrl),
        message: `${entry.productId}: ${message}`,
      });
    }
  }

  return results;
}
