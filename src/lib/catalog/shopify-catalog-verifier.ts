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

interface ShopifyVariant {
  id: number;
  available?: boolean;
}

interface ShopifyProductJson {
  id: number;
  available?: boolean;
  variants?: ShopifyVariant[];
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

async function fetchWithTimeout(url: string, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        accept: 'application/json,text/javascript,*/*;q=0.8',
        'user-agent': 'SuppStackCatalogVerifier/1.0',
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function verifyCatalogShopifyEntry(
  entry: CatalogShopifyEntry,
  timeoutMs = 10000
): Promise<ShopifyCatalogVerificationResult> {
  const productJsonUrl = getShopifyProductJsonUrl(entry.productUrl);
  const response = await fetchWithTimeout(productJsonUrl, timeoutMs);
  const body = await response.text();

  if (!response.ok || body.trim().startsWith('<')) {
    return {
      ok: false,
      productId: entry.productId,
      productName: entry.productName,
      productJsonUrl,
      message: `${entry.productId}: ${response.status} from ${productJsonUrl}`,
    };
  }

  const product = JSON.parse(body) as ShopifyProductJson;
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
