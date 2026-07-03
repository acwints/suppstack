/**
 * Sources verified Shopify products for catalog supplements that lack
 * hand-curated merchant listings. Queries public Shopify storefront endpoints
 * (/search/suggest.json + /products/{handle}.js) on established supplement
 * merchants, validates availability live, and emits
 * src/lib/catalog/shopify-sourced-products.ts.
 *
 * Selection rules (tuned after adversarial review):
 * - Candidates are collected across ALL stores and ranked globally, penalizing
 *   combo products ("+", "with", "&") and bulk powders (unless the search term
 *   asks for a powder).
 * - The variant is chosen by token overlap between variant title and the
 *   product handle/title, so a "50 Billion CFU / 60 Capsules" listing does not
 *   silently resolve to the 1-Billion variant.
 * - The emitted product_name includes the variant title so the page describes
 *   exactly what lands in the merchant cart.
 * - servings_per_container is parsed with boundary-safe regexes from the
 *   variant title, then the description ("N Servings"), then the title;
 *   digits embedded in names (B12, CoQ10) never match.
 *
 * Usage: node src/scripts/sourceShopifyProducts.mjs
 * Validate with: npm run verify:shopify-catalog
 */

import { writeFile } from 'node:fs/promises';

const OUTPUT_PATH = new URL('../lib/catalog/shopify-sourced-products.ts', import.meta.url);

const STORES = [
  { domain: 'nutricost.com', brandId: 'nutricost', brandName: 'Nutricost' },
  { domain: 'doublewoodsupplements.com', brandId: 'double-wood', brandName: 'Double Wood Supplements' },
  { domain: 'microingredients.com', brandId: 'micro-ingredients', brandName: 'Micro Ingredients' },
  { domain: 'bulksupplements.com', brandId: 'bulksupplements', brandName: 'BulkSupplements' },
  { domain: 'horbaach.com', brandId: 'horbaach', brandName: 'Horbaach' },
  { domain: 'www.pipingrock.com', brandId: 'piping-rock', brandName: 'Piping Rock' },
];

/** Catalog supplements without hand-curated seeds in supplement-catalog.ts. */
const SUPPLEMENTS = [
  { name: 'Vitamin D3', searchTerms: ['vitamin d3 5000', 'vitamin d3'] },
  { name: 'Vitamin K2', searchTerms: ['vitamin k2 mk7 capsules', 'vitamin k2 softgels', 'vitamin k2 mk7', 'vitamin k2'] },
  { name: 'Vitamin C', searchTerms: ['vitamin c 1000', 'vitamin c'] },
  { name: 'Vitamin B12', searchTerms: ['vitamin b12', 'methylcobalamin'] },
  { name: 'B-Complex', searchTerms: ['vitamin b complex', 'b complex'] },
  { name: 'Folate', searchTerms: ['folate', 'folic acid'] },
  { name: 'Biotin', searchTerms: ['biotin'] },
  { name: 'Magnesium Glycinate', searchTerms: ['magnesium glycinate'] },
  { name: 'Magnesium Citrate', searchTerms: ['magnesium citrate'] },
  { name: 'Zinc', searchTerms: ['zinc picolinate', 'zinc'] },
  { name: 'Iron', searchTerms: ['iron bisglycinate', 'iron'] },
  { name: 'Calcium', searchTerms: ['calcium citrate', 'calcium'] },
  { name: 'Selenium', searchTerms: ['selenium'] },
  { name: 'Iodine', searchTerms: ['iodine', 'kelp'] },
  { name: 'Omega-3 Fish Oil', searchTerms: ['fish oil softgels', 'omega 3 softgels', 'fish oil'] },
  { name: 'Krill Oil', searchTerms: ['krill oil'] },
  { name: 'Algal Oil', searchTerms: ['algae omega 3', 'vegan omega 3', 'algal oil'] },
  { name: 'Cod Liver Oil', searchTerms: ['cod liver oil'] },
  { name: 'Collagen Peptides', searchTerms: ['collagen peptides', 'collagen powder'] },
  { name: 'Beetroot', searchTerms: ['beet root powder', 'beet root'] },
  { name: 'Ashwagandha', searchTerms: ['ashwagandha'] },
  { name: 'Rhodiola Rosea', searchTerms: ['rhodiola rosea', 'rhodiola'] },
  { name: 'Panax Ginseng', searchTerms: ['panax ginseng', 'korean ginseng', 'ginseng'] },
  { name: 'Maca Root', searchTerms: ['maca root', 'maca'] },
  { name: 'Turmeric Curcumin', searchTerms: ['turmeric curcumin', 'turmeric'] },
  { name: 'Ginger', searchTerms: ['ginger root', 'ginger'] },
  { name: 'Garlic Extract', searchTerms: ['garlic extract', 'garlic'] },
  { name: 'Milk Thistle', searchTerms: ['milk thistle'] },
  { name: 'Holy Basil', searchTerms: ['holy basil', 'tulsi'] },
  { name: 'Bacopa Monnieri', searchTerms: ['bacopa monnieri', 'bacopa'] },
  { name: 'Ginkgo Biloba', searchTerms: ['ginkgo biloba', 'ginkgo'] },
  { name: "Lion's Mane Mushroom", searchTerms: ['lions mane mushroom', 'lions mane'] },
  { name: 'Alpha-GPC', searchTerms: ['alpha gpc'] },
  { name: 'CDP-Choline', searchTerms: ['citicoline', 'cdp choline'] },
  { name: 'Phosphatidylserine', searchTerms: ['phosphatidylserine'] },
  { name: 'L-Theanine', searchTerms: ['l theanine', 'theanine'] },
  { name: 'Glycine', searchTerms: ['glycine'] },
  { name: 'L-Tyrosine', searchTerms: ['l tyrosine', 'tyrosine'] },
  { name: 'NAC', searchTerms: ['nac', 'n acetyl cysteine'] },
  { name: 'L-Carnitine', searchTerms: ['l carnitine', 'acetyl l carnitine'] },
  { name: 'GABA', searchTerms: ['gaba'] },
  { name: 'Melatonin', searchTerms: ['melatonin'] },
  { name: 'Apigenin', searchTerms: ['apigenin'] },
  { name: 'Valerian Root', searchTerms: ['valerian root', 'valerian'] },
  { name: 'Passionflower', searchTerms: ['passion flower', 'passionflower'] },
  { name: 'Lemon Balm', searchTerms: ['lemon balm'] },
  { name: 'Probiotics', searchTerms: ['probiotic complex', 'probiotic capsules', 'probiotic'] },
  { name: 'Prebiotic Fiber', searchTerms: ['inulin powder', 'prebiotic fiber', 'prebiotic'] },
  { name: 'Psyllium Husk', searchTerms: ['psyllium husk'] },
  { name: 'Digestive Enzymes', searchTerms: ['digestive enzymes'] },
  { name: 'Apple Cider Vinegar', searchTerms: ['apple cider vinegar'] },
  { name: 'Berberine', searchTerms: ['berberine'] },
  { name: 'Chromium', searchTerms: ['chromium picolinate', 'chromium'] },
  { name: 'Cinnamon Extract', searchTerms: ['ceylon cinnamon capsules', 'cinnamon capsules', 'ceylon cinnamon'] },
  { name: 'Myo-Inositol', searchTerms: ['inositol powder', 'myo inositol', 'inositol'] },
  { name: 'CoQ10', searchTerms: ['coq10'] },
  { name: 'Nattokinase', searchTerms: ['nattokinase'] },
  { name: 'Resveratrol', searchTerms: ['resveratrol'] },
  { name: 'NMN', searchTerms: ['nmn'] },
  { name: 'NR', searchTerms: ['nicotinamide riboside'] },
  { name: 'Spermidine', searchTerms: ['spermidine'] },
  { name: 'PQQ', searchTerms: ['pqq'] },
  { name: 'Glucosamine', searchTerms: ['glucosamine capsules', 'glucosamine sulfate', 'glucosamine'] },
  { name: 'Chondroitin', searchTerms: ['chondroitin sulfate', 'chondroitin'] },
  { name: 'MSM', searchTerms: ['msm'] },
  { name: 'Hyaluronic Acid', searchTerms: ['hyaluronic acid'] },
  { name: 'Silica', searchTerms: ['silica horsetail', 'bamboo silica', 'silica capsules'] },
  { name: 'Keratin', searchTerms: ['keratin'] },
  { name: 'Hemp Seed Oil', searchTerms: ['hemp seed oil softgels', 'hemp seed oil'] },
  { name: 'MCT Oil', searchTerms: ['mct oil'] },
  { name: 'Green Tea Extract', searchTerms: ['green tea extract', 'egcg'] },
  { name: 'Quercetin', searchTerms: ['quercetin'] },
  { name: 'Elderberry', searchTerms: ['elderberry'] },
  { name: 'Echinacea', searchTerms: ['echinacea'] },
  { name: 'Reishi Mushroom', searchTerms: ['reishi mushroom', 'reishi'] },
  { name: 'Cordyceps', searchTerms: ['cordyceps'] },
  { name: 'Chaga Mushroom', searchTerms: ['chaga mushroom', 'chaga'] },
];

const HEADERS = {
  accept: 'application/json',
  'user-agent': 'SuppStackCatalogSourcer/1.0',
};

async function fetchJson(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let response = await fetch(url, { headers: HEADERS, signal: controller.signal, redirect: 'follow' });
    if (response.status === 429) {
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 2500));
      response = await fetch(url, { headers: HEADERS, redirect: 'follow' });
    }
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
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean);
}

function titleMatches(title, searchTerm) {
  const titleTokens = new Set(tokenize(title));
  return tokenize(searchTerm).every((token) => titleTokens.has(token));
}

function comboPenalty(title, searchTerm) {
  let penalty = 0;
  if (/[+]/.test(title)) penalty += 4;
  if (/\bwith\b/i.test(title)) penalty += 2;
  if (/&/.test(title)) penalty += 2;
  if (/\bcomplex\b/i.test(title) && !/complex/i.test(searchTerm)) penalty += 1;
  if (/\bgumm/i.test(title)) penalty += 1;
  if (/\bpowder\b/i.test(title) && !/powder/i.test(searchTerm)) penalty += 3;
  if (/\bfor dogs?\b|\bfor cats?\b|\bpets?\b/i.test(title)) penalty += 20;
  penalty += Math.max(0, tokenize(title).length - 6) * 0.25;
  return penalty;
}

/**
 * Unit counts like "120 Capsules" with a non-alphanumeric boundary before the
 * digits, so "Vitamin B12 Capsules" or "CoQ10" never match.
 */
const UNIT_PATTERN =
  /(?:^|[^0-9a-z])(\d{2,4})\s*-?\s*(?:(?!mg\b|mcg\b|iu\b|g\b|oz\b|ml\b|billion\b|million\b|cfu\b)[a-z]+\s+){0,2}(?:veggie capsules|veggie caps|veg capsules|veg caps|capsules|caps|softgels|soft gels|gels|caplets|tablets|gummies|chewables|vcaps|lozenges|sticks?|packets?|count|ct)\b/i;

const SERVINGS_PATTERN = /(?:^|[^0-9a-z])(\d{2,4})\s*-?\s*servings\b/i;

function matchNumber(text, pattern) {
  const match = String(text || '').match(pattern);
  return match ? Number(match[1]) : null;
}

function defaultServings(title) {
  if (/\bsoftgels?\b|\bcapsules?\b|\btablets?\b|\bcaps\b|\bcaplets?\b/i.test(title)) return 60;
  if (/\bpowder\b/i.test(title)) return 30;
  if (/\bliquid\b|\bfl oz\b|\boil\b/i.test(title)) return 32;
  return 60;
}

/**
 * A serving can be multiple units (e.g. 120 capsules at 2 per serving = 60
 * servings), and the description's "N Servings" can describe a different
 * bottle size than the chosen variant — so when both signals exist, the
 * smaller one is the safe estimate (servings never exceed units).
 */
function parseServings(productJson, variant) {
  const description = String(productJson.description || '').replace(/<[^>]+>/g, ' ');
  const unitCount =
    matchNumber(variant?.title, UNIT_PATTERN) ?? matchNumber(productJson.title, UNIT_PATTERN);
  const statedServings =
    matchNumber(description, SERVINGS_PATTERN) ?? matchNumber(productJson.title, SERVINGS_PATTERN);

  if (unitCount && statedServings) return Math.min(unitCount, statedServings);
  return statedServings ?? unitCount ?? defaultServings(productJson.title);
}

/**
 * Picks the available variant whose title best matches the product handle and
 * title (e.g. handle "...-50-billion-cfu-60-capsules" selects the
 * "50 Billion CFU" variant instead of the first/cheapest one).
 */
function pickVariant(productJson) {
  const available = (productJson.variants || []).filter((item) => item.available !== false);
  if (available.length === 0) return null;
  if (available.length === 1) return available[0];

  const haystack = ` ${tokenize(`${productJson.handle} ${productJson.title}`).join(' ')} `;
  let best = available[0];
  let bestScore = -1;

  for (const variant of available) {
    if (!variant.title || variant.title === 'Default Title') continue;
    const score = tokenize(variant.title).filter((token) => haystack.includes(` ${token} `)).length;
    if (score > bestScore) {
      best = variant;
      bestScore = score;
    }
  }

  return best;
}

async function searchStore(store, searchTerm) {
  const url = `https://${store.domain}/search/suggest.json?q=${encodeURIComponent(searchTerm)}&resources[type]=product&resources[limit]=10`;
  const payload = await fetchJson(url);
  const products = payload?.resources?.results?.products ?? [];

  return products
    .filter((product) => product.available !== false && product.handle)
    .filter((product) => titleMatches(product.title, searchTerm))
    .map((product, index) => ({
      store,
      handle: product.handle,
      title: product.title,
      score: comboPenalty(product.title, searchTerm) + index * 0.05,
    }));
}

async function resolveProduct(store, handle) {
  const productJson = await fetchJson(`https://${store.domain}/products/${handle}.js`);
  if (!productJson) return null;

  const variant = pickVariant(productJson);
  if (!variant) return null;

  const image = productJson.images?.[0] || productJson.featured_image || '';
  const hasVariantTitle = Boolean(variant.title && variant.title !== 'Default Title');

  return {
    handle,
    title: productJson.title,
    variantTitle: hasVariantTitle ? variant.title : null,
    displayName: hasVariantTitle ? `${productJson.title}, ${variant.title}` : productJson.title,
    productId: String(productJson.id),
    variantId: String(variant.id),
    price: Math.round(Number(variant.price)) / 100,
    image: image.startsWith('//') ? `https:${image}` : image,
    servings: parseServings(productJson, variant),
    url: `https://${store.domain}/products/${handle}`,
  };
}

async function sourceSupplement(entry) {
  for (const searchTerm of entry.searchTerms) {
    const candidateGroups = await Promise.all(STORES.map((store) => searchStore(store, searchTerm)));
    const candidates = candidateGroups
      .flatMap((group, storeIndex) => group.map((candidate) => ({ ...candidate, score: candidate.score + storeIndex * 0.1 })))
      .sort((a, b) => a.score - b.score);

    for (const candidate of candidates.slice(0, 4)) {
      const resolved = await resolveProduct(candidate.store, candidate.handle);
      if (!resolved || !resolved.variantId || !resolved.price) continue;

      return {
        supplementName: entry.name,
        store: candidate.store.domain,
        brandId: candidate.store.brandId,
        brandName: candidate.store.brandName,
        ...resolved,
      };
    }
  }

  return { supplementName: entry.name, error: 'no match found' };
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function esc(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function badgeFor(title) {
  if (/powder/i.test(title)) return 'Bulk powder';
  if (/gumm/i.test(title)) return 'Gummies';
  if (/softgel/i.test(title)) return 'Softgels';
  if (/tablet/i.test(title)) return 'Tablets';
  if (/liquid|drops|oil\b|fl oz/i.test(title)) return 'Liquid';
  return 'Capsules';
}

function emitSeed(entry) {
  const slug = slugify(entry.supplementName);
  const cleanName = entry.displayName.replace(/\s+\|.*$/, '').trim();
  const description = `${entry.brandName} ${entry.supplementName.toLowerCase()} pick with a verified Shopify variant, so shoppers can move straight from the supplement page into merchant cart checkout.`;
  const servings = Math.max(1, Number(entry.servings) || 30);

  return `  {
    product_id: 'real-${entry.brandId}-${slug}',
    product_name: '${esc(cleanName)}',
    product_description:
      '${esc(description)}',
    product_price: ${entry.price},
    product_url: '${esc(entry.url)}',
    amazon_url: '',
    product_image: '${esc(entry.image)}',
    servings_per_container: ${servings},
    servings_per_day: 1,
    brand_id: '${entry.brandId}',
    brands: { brand_name: '${esc(entry.brandName)}' },
    supplement_name: '${esc(entry.supplementName)}',
    shopify_product_gid: 'gid://shopify/Product/${entry.productId}',
    shopify_variant_gid: 'gid://shopify/ProductVariant/${entry.variantId}',
    shopify_store_domain: '${entry.store}',
    commerce_channel: 'shopify',
    ucp_enabled: true,
    inventory_status: 'in_stock',
    quality_badges: ['Shopify UCP', 'Verified variant', '${badgeFor(entry.title)}'],
    subscriptions_available: false,
    data_source: 'shopify_ucp',
  },`;
}

async function main() {
  const results = [];

  for (const entry of SUPPLEMENTS) {
    const result = await sourceSupplement(entry);
    results.push(result);
    console.log(
      result.error
        ? `MISS  ${entry.name}: ${result.error}`
        : `OK    ${entry.name} -> [${result.store}] ${result.displayName} ($${result.price}, ${result.servings} servings, variant ${result.variantId})`
    );
  }

  const misses = results.filter((result) => result.error);
  if (misses.length) {
    console.error(`\n${misses.length} supplements unmatched: ${misses.map((miss) => miss.supplementName).join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const file = `import type { CuratedProductSeed } from './supplement-catalog';

/**
 * Shopify-sourced product seeds covering every catalog supplement that does
 * not have a hand-curated merchant listing. Each entry carries a live Shopify
 * product + variant ID verified against the merchant storefront, so every
 * supplement page can offer a working cart-permalink checkout. The product
 * name includes the exact variant that lands in the merchant cart.
 *
 * Regenerate with: node src/scripts/sourceShopifyProducts.mjs
 * Validate with:   npm run verify:shopify-catalog
 */
export const sourcedProductSeeds: CuratedProductSeed[] = [
${results.map(emitSeed).join('\n')}
];
`;

  await writeFile(OUTPUT_PATH, file);
  console.log(`\nWrote ${results.length} sourced product seeds to shopify-sourced-products.ts`);
}

main();
