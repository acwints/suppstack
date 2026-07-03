/**
 * Sources verified Shopify products for catalog supplements that lack curated
 * merchant listings. Queries public Shopify storefront endpoints
 * (/search/suggest.json + /products/{handle}.js) on established supplement
 * merchants, validates availability, and emits seed data for
 * src/lib/catalog/shopify-sourced-products.ts.
 *
 * Usage: node src/scripts/sourceShopifyProducts.mjs <supplements.json> <out.json>
 * where supplements.json is [{ name, searchTerms: string[] }].
 */

const STORES = [
  { domain: 'nutricost.com', brandId: 'nutricost', brandName: 'Nutricost' },
  { domain: 'doublewoodsupplements.com', brandId: 'double-wood', brandName: 'Double Wood Supplements' },
  { domain: 'microingredients.com', brandId: 'micro-ingredients', brandName: 'Micro Ingredients' },
  { domain: 'bulksupplements.com', brandId: 'bulksupplements', brandName: 'BulkSupplements' },
  { domain: 'horbaach.com', brandId: 'horbaach', brandName: 'Horbaach' },
  { domain: 'pipingrock.com', brandId: 'piping-rock', brandName: 'Piping Rock' },
];

const HEADERS = {
  accept: 'application/json',
  'user-agent': 'SuppStackCatalogSourcer/1.0',
};

async function fetchJson(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { headers: HEADERS, signal: controller.signal, redirect: 'follow' });
    if (!response.ok) return null;
    const text = await response.text();
    if (text.trim().startsWith('<')) return null;
    return JSON.parse(text);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function tokenize(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean);
}

function titleMatches(title, searchTerm) {
  const titleTokens = new Set(tokenize(title));
  return tokenize(searchTerm).every((token) => titleTokens.has(token));
}

function comboPenalty(title) {
  let penalty = 0;
  if (/[+]/.test(title)) penalty += 4;
  if (/\bwith\b/i.test(title)) penalty += 2;
  if (/\bcomplex\b/i.test(title)) penalty += 1;
  if (/&/.test(title)) penalty += 2;
  if (/\bgumm/i.test(title)) penalty += 1;
  penalty += Math.max(0, tokenize(title).length - 6) * 0.25;
  return penalty;
}

async function searchStore(store, searchTerm) {
  const url = `https://${store.domain}/search/suggest.json?q=${encodeURIComponent(searchTerm)}&resources[type]=product&resources[limit]=10`;
  const payload = await fetchJson(url);
  const products = payload?.resources?.results?.products ?? [];

  const candidates = products
    .filter((product) => product.available !== false && product.handle)
    .filter((product) => titleMatches(product.title, searchTerm))
    .map((product) => ({ ...product, score: comboPenalty(product.title) }))
    .sort((a, b) => a.score - b.score);

  return candidates;
}

function parseServings(productJson) {
  const body = String(productJson.description || '');
  const servingMatch = body.match(/(\d{1,4})\s*Servings/i);
  if (servingMatch) return Number(servingMatch[1]);

  const unitsSource = `${productJson.title} ${(productJson.variants?.[0]?.title) || ''}`;
  const unitMatch = unitsSource.match(/(\d{2,4})\s*(?:capsules|softgels|tablets|gummies|veggie caps|count|ct)\b/i);
  if (unitMatch) return Number(unitMatch[1]);

  return 30;
}

async function resolveProduct(store, handle) {
  const productJson = await fetchJson(`https://${store.domain}/products/${handle}.js`);
  if (!productJson) return null;

  const variant = (productJson.variants || []).find((item) => item.available !== false);
  if (!variant) return null;

  const image = productJson.images?.[0] || productJson.featured_image || '';

  return {
    handle,
    title: productJson.title,
    productId: String(productJson.id),
    variantId: String(variant.id),
    price: Math.round(Number(variant.price)) / 100,
    image: image.startsWith('//') ? `https:${image}` : image,
    servings: parseServings(productJson),
    url: `https://${store.domain}/products/${handle}`,
  };
}

async function sourceSupplement(entry) {
  for (const searchTerm of entry.searchTerms) {
    for (const store of STORES) {
      const candidates = await searchStore(store, searchTerm);

      for (const candidate of candidates.slice(0, 3)) {
        const resolved = await resolveProduct(store, candidate.handle);
        if (!resolved || !resolved.variantId || !resolved.price) continue;

        return {
          supplementName: entry.name,
          store: store.domain,
          brandId: store.brandId,
          brandName: store.brandName,
          ...resolved,
        };
      }
    }
  }

  return { supplementName: entry.name, error: 'no match found' };
}

async function main() {
  const [inputPath, outputPath] = process.argv.slice(2);
  if (!inputPath || !outputPath) {
    console.error('Usage: node sourceShopifyProducts.mjs <supplements.json> <out.json>');
    process.exit(1);
  }

  const { readFile, writeFile } = await import('node:fs/promises');
  const entries = JSON.parse(await readFile(inputPath, 'utf8'));
  const results = [];

  for (const entry of entries) {
    const result = await sourceSupplement(entry);
    results.push(result);
    console.log(
      result.error
        ? `MISS  ${entry.name}: ${result.error}`
        : `OK    ${entry.name} -> [${result.store}] ${result.title} ($${result.price}, variant ${result.variantId})`
    );
  }

  await writeFile(outputPath, JSON.stringify(results, null, 2));
  const misses = results.filter((result) => result.error);
  console.log(`\nDone: ${results.length - misses.length}/${results.length} matched.`);
  if (misses.length) {
    console.log(`Unmatched: ${misses.map((miss) => miss.supplementName).join(', ')}`);
  }
}

main();
