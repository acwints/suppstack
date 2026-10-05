interface ShopifyVariantJson {
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

function getShopifyProductJsonUrl(productUrl: string) {
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
