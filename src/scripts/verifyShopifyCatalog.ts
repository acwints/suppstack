const { readFileSync } = require('node:fs') as typeof import('node:fs');
const { resolve } = require('node:path') as typeof import('node:path');

interface CatalogShopifyEntry {
  productId: string;
  productName: string;
  productUrl: string;
  shopifyProductId: string;
  shopifyVariantId: string;
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

function extractString(block: string, key: string) {
  const match = block.match(new RegExp(`${key}: '([^']+)'`));
  return match?.[1] ?? null;
}

function extractShopifyGid(block: string, key: 'shopify_product_gid' | 'shopify_variant_gid') {
  const helperMatch = block.match(
    new RegExp(`${key}: shopifyGid\\('(?:Product|ProductVariant)', '([^']+)'\\)`)
  );
  if (helperMatch) return helperMatch[1];

  const rawMatch = block.match(
    new RegExp(`${key}: 'gid://shopify/(?:Product|ProductVariant)/([^']+)'`)
  );
  return rawMatch?.[1] ?? null;
}

function catalogEntriesFromSource(source: string): CatalogShopifyEntry[] {
  const entries: CatalogShopifyEntry[] = [];
  const blocks = source.match(/\{\n\s+product_id: '[^']+'[\s\S]*?\n\s+\},/g) ?? [];

  blocks.forEach((block) => {
    const productId = extractString(block, 'product_id');
    const productName = extractString(block, 'product_name');
    const productUrl = extractString(block, 'product_url');
    const shopifyProductId = extractShopifyGid(block, 'shopify_product_gid');
    const shopifyVariantId = extractShopifyGid(block, 'shopify_variant_gid');

    if (!productId || !productName || !productUrl || !shopifyProductId || !shopifyVariantId) return;

    entries.push({ productId, productName, productUrl, shopifyProductId, shopifyVariantId });
  });

  return entries;
}

function productJsonUrl(productUrl: string) {
  const url = new URL(productUrl);
  url.search = '';
  url.hash = '';
  url.pathname = url.pathname.replace(/\/$/, '');
  if (!url.pathname.endsWith('.js')) url.pathname = `${url.pathname}.js`;
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

function sleep(ms: number) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

async function fetchWithRetry(url: string, attempts = 3) {
  let response = await fetchWithTimeout(url);

  for (let attempt = 1; attempt < attempts && response.status === 429; attempt += 1) {
    await sleep(2000 * attempt);
    response = await fetchWithTimeout(url);
  }

  return response;
}

async function verifyEntry(entry: CatalogShopifyEntry) {
  const url = productJsonUrl(entry.productUrl);
  const response = await fetchWithRetry(url);
  const body = await response.text();

  if (!response.ok || body.trim().startsWith('<')) {
    return { ok: false, message: `${entry.productId}: ${response.status} from ${url}` };
  }

  const product = JSON.parse(body) as ShopifyProductJson;
  const variant = product.variants?.find((item) => String(item.id) === entry.shopifyVariantId);

  if (String(product.id) !== entry.shopifyProductId) {
    return {
      ok: false,
      message: `${entry.productId}: product id mismatch catalog=${entry.shopifyProductId} live=${product.id}`,
    };
  }

  if (!variant) return { ok: false, message: `${entry.productId}: variant ${entry.shopifyVariantId} not found` };
  if (product.available === false || variant.available === false) {
    return { ok: false, message: `${entry.productId}: live product or variant is unavailable` };
  }

  return { ok: true, message: `${entry.productId}: ${entry.productName}` };
}

async function main() {
  const sourcePaths = [
    resolve(process.cwd(), 'src/lib/catalog/supplement-catalog.ts'),
    resolve(process.cwd(), 'src/lib/catalog/shopify-sourced-products.ts'),
  ];
  const entries = sourcePaths.flatMap((sourcePath) =>
    catalogEntriesFromSource(readFileSync(sourcePath, 'utf8'))
  );

  console.log(`Verifying ${entries.length} Shopify-backed catalog products...`);

  const failures: string[] = [];

  for (const entry of entries) {
    try {
      const result = await verifyEntry(entry);
      console.log(`${result.ok ? 'OK' : 'FAIL'} ${result.message}`);
      if (!result.ok) failures.push(result.message);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`FAIL ${entry.productId}: ${message}`);
      failures.push(`${entry.productId}: ${message}`);
    }
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} Shopify catalog checks failed.`);
    process.exitCode = 1;
    return;
  }

  console.log(`\nAll ${entries.length} Shopify catalog checks passed.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
