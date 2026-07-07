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
 * - A per-brand reuse penalty spreads picks across merchants so the storefront
 *   never over-indexes on a single house brand.
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

import { mkdir, readFile, writeFile } from 'node:fs/promises';

const OUTPUT_PATH = new URL('../lib/catalog/shopify-sourced-products.ts', import.meta.url);
const FETCH_CACHE_PATH = new URL('../../.cache/shopify-sourcer-fetch-cache.json', import.meta.url);
const RESULT_CACHE_PATH = new URL('../../.cache/shopify-sourcer-results.json', import.meta.url);

const rawArgs = process.argv.slice(2);

function hasFlag(name) {
  return rawArgs.includes(name);
}

function optionValue(name) {
  const prefix = `${name}=`;
  const inline = rawArgs.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = rawArgs.indexOf(name);
  return index >= 0 ? rawArgs[index + 1] : null;
}

function optionNumber(name, fallback) {
  const raw = optionValue(name);
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function optionList(name) {
  const raw = optionValue(name);
  if (!raw) return [];
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

if (hasFlag('--help')) {
  console.log(`Usage: node src/scripts/sourceShopifyProducts.mjs [options]

Options:
  --fast                 Skip product-page HTML serving parsing (default)
  --deep-servings        Fetch product pages for richer serving counts
  --target=N             Verified products per supplement (default 2)
  --limit=N              Source only the first N selected supplements
  --only=A,B             Source only comma-separated supplement names
  --stores=A,B           Query only comma-separated store domains or brand IDs
  --store-timeout-ms=N   Per-store search timeout before skipping (default 12000)
  --no-write             Validate/source without overwriting generated seeds
  --force-write          Allow limited/targeted runs to overwrite generated seeds
  --merge-existing       Append new verified seeds into the current generated file
  --cache-only           Use local fetch cache only; never hit storefronts
  --refresh-cache        Ignore cached storefront responses
  --refresh-results      Ignore cached per-supplement source results
`);
  process.exit(0);
}

/**
 * Each store was verified live before inclusion: /search/suggest.json returns
 * product JSON, /products/{handle}.js resolves, and /cart/{variant}:1
 * permalinks redirect into a working checkout.
 */
const STORES = [
  { domain: 'nutricost.com', brandId: 'nutricost', brandName: 'Nutricost' },
  { domain: 'doublewoodsupplements.com', brandId: 'double-wood', brandName: 'Double Wood Supplements' },
  { domain: 'microingredients.com', brandId: 'micro-ingredients', brandName: 'Micro Ingredients' },
  { domain: 'bulksupplements.com', brandId: 'bulksupplements', brandName: 'BulkSupplements' },
  { domain: 'horbaach.com', brandId: 'horbaach', brandName: 'Horbaach' },
  { domain: 'www.pipingrock.com', brandId: 'piping-rock', brandName: 'Piping Rock' },
  { domain: 'carlsonlabs.com', brandId: 'carlson-labs', brandName: 'Carlson Labs' },
  { domain: 'jarrow.com', brandId: 'jarrow-formulas', brandName: 'Jarrow Formulas' },
  { domain: 'solaray.com', brandId: 'solaray', brandName: 'Solaray' },
  { domain: 'naturemade.com', brandId: 'nature-made', brandName: 'Nature Made' },
  { domain: 'naturesbounty.com', brandId: 'natures-bounty', brandName: "Nature's Bounty" },
  { domain: 'zhounutrition.com', brandId: 'zhou-nutrition', brandName: 'Zhou Nutrition' },
  { domain: 'naturewise.com', brandId: 'naturewise', brandName: 'NatureWise' },
  { domain: 'maryruthorganics.com', brandId: 'maryruth-organics', brandName: 'MaryRuth Organics' },
  { domain: 'codeage.com', brandId: 'codeage', brandName: 'Codeage' },
  { domain: 'globalhealing.com', brandId: 'global-healing', brandName: 'Global Healing' },
  { domain: 'toniiq.com', brandId: 'toniiq', brandName: 'Toniiq' },
  { domain: 'bronsonvitamins.com', brandId: 'bronson', brandName: 'Bronson' },
  { domain: 'nusapure.com', brandId: 'nusapure', brandName: 'NusaPure' },
  { domain: 'purebulk.com', brandId: 'purebulk', brandName: 'PureBulk' },
];

const STORES_BY_DOMAIN = new Map(STORES.map((store) => [store.domain, store]));

/**
 * Score penalty per prior pick from the same brand. Keeps the storefront from
 * over-indexing on any single house brand while still letting the cleanest
 * title match win when the alternatives are poor.
 */
const BRAND_REUSE_PENALTY = 1.5;
const PRODUCTS_PER_SUPPLEMENT = 2;
const MAX_PRODUCT_PRICE = 250;
const SOURCE_TARGET_COUNT = optionNumber('--target', PRODUCTS_PER_SUPPLEMENT);
const SOURCE_LIMIT = optionNumber('--limit', Number.POSITIVE_INFINITY);
const SOURCE_ONLY = new Set(optionList('--only').map((item) => item.toLowerCase()));
const SOURCE_STORES = new Set(optionList('--stores').map((item) => item.toLowerCase()));
const STORE_SEARCH_TIMEOUT_MS = optionNumber('--store-timeout-ms', 12000);
const WRITE_OUTPUT = !hasFlag('--no-write');
const FORCE_WRITE = hasFlag('--force-write');
const MERGE_EXISTING = hasFlag('--merge-existing');
const CACHE_ONLY = hasFlag('--cache-only');
const REFRESH_FETCH_CACHE = hasFlag('--refresh-cache');
const REFRESH_RESULT_CACHE = hasFlag('--refresh-results');
const DEEP_SERVINGS = hasFlag('--deep-servings') && !hasFlag('--fast');
const ACTIVE_STORES =
  SOURCE_STORES.size === 0
    ? STORES
    : STORES.filter(
        (store) =>
          SOURCE_STORES.has(store.domain.toLowerCase()) ||
          SOURCE_STORES.has(store.brandId.toLowerCase()) ||
          SOURCE_STORES.has(store.brandName.toLowerCase())
      );

if (SOURCE_STORES.size > 0 && ACTIVE_STORES.length === 0) {
  console.error(`No stores matched --stores=${Array.from(SOURCE_STORES).join(',')}`);
  process.exit(1);
}

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
  { name: 'Beta-Alanine', searchTerms: ['beta alanine powder', 'beta alanine capsules', 'beta alanine'] },
  { name: 'Citrulline Malate', searchTerms: ['citrulline malate', 'l citrulline malate', 'l citrulline'] },
  { name: 'BCAAs', searchTerms: ['bcaa powder', 'branched chain amino acids', 'bcaa capsules'] },
  { name: 'Creatine HCl', searchTerms: ['creatine hcl', 'creatine hydrochloride'] },
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
  { name: "Lion's Mane Mushroom", searchTerms: ['lions mane mushroom', 'lion mane', 'lion s mane', 'lions mane'] },
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
  {
    name: 'Psyllium Husk',
    searchTerms: ['psyllium husk', 'psyllium husks'],
    fallbackProducts: [{ domain: 'solaray.com', handle: 'psyllium-husk', searchTerm: 'psyllium husk' }],
  },
  {
    name: 'Digestive Enzymes',
    searchTerms: ['digestive enzymes', 'multiple digestive enzymes', 'fermented digestive enzymes', 'fermented enzymes'],
    fallbackProducts: [
      {
        domain: 'bronsonvitamins.com',
        handle: 'multiple-enzymes-amylase-protease-lipase-100-tablets',
        searchTerm: 'digestive enzymes',
      },
      { domain: 'codeage.com', handle: 'fermented-digestive-enzymes', searchTerm: 'digestive enzymes' },
    ],
  },
  { name: 'Apple Cider Vinegar', searchTerms: ['apple cider vinegar'] },
  { name: 'Berberine', searchTerms: ['berberine'] },
  { name: 'Chromium', searchTerms: ['chromium picolinate', 'chromium'] },
  { name: 'Cinnamon Extract', searchTerms: ['ceylon cinnamon capsules', 'cinnamon capsules', 'ceylon cinnamon'] },
  { name: 'Myo-Inositol', searchTerms: ['inositol powder', 'myo inositol', 'inositol'] },
  { name: 'CoQ10', searchTerms: ['coq10'] },
  { name: 'Nattokinase', searchTerms: ['nattokinase'] },
  { name: 'Resveratrol', searchTerms: ['resveratrol'] },
  { name: 'NMN', searchTerms: ['nmn'] },
  {
    name: 'NR',
    searchTerms: ['nicotinamide riboside chloride', 'nicotinamide ribose chloride', 'nicotinamide riboside', 'nrc'],
    fallbackProducts: [
      { domain: 'purebulk.com', handle: 'nicotinamide-ribose-chloride', searchTerm: 'nicotinamide riboside chloride' },
    ],
  },
  { name: 'Spermidine', searchTerms: ['spermidine'] },
  { name: 'PQQ', searchTerms: ['pqq'] },
  { name: 'Glucosamine', searchTerms: ['glucosamine capsules', 'glucosamine sulfate', 'glucosamine'] },
  { name: 'Chondroitin', searchTerms: ['chondroitin sulfate', 'chondroitin'] },
  {
    name: 'MSM',
    searchTerms: ['msm', 'msm sulfur', 'methylsulfonylmethane'],
    fallbackProducts: [
      {
        domain: 'www.pipingrock.com',
        handle: 'msm-1000-mg-150-quick-release-capsules-47',
        searchTerm: 'msm',
        allowMarketplaceVendor: true,
      },
      {
        domain: 'www.pipingrock.com',
        handle: 'msm-methylsulfonylmethane-powder-4000-mg-per-serving-21-oz-600-g-bottle-20830',
        searchTerm: 'methylsulfonylmethane',
        allowMarketplaceVendor: true,
      },
      { domain: 'carlsonlabs.com', handle: 'msm-sulfur', searchTerm: 'msm' },
    ],
  },
  { name: 'Hyaluronic Acid', searchTerms: ['hyaluronic acid'] },
  { name: 'Silica', searchTerms: ['silica horsetail', 'bamboo silica', 'silica capsules'] },
  {
    name: 'Keratin',
    searchTerms: ['keratin supplement', 'keratin'],
    fallbackProducts: [{ domain: 'doublewoodsupplements.com', handle: 'keratin', searchTerm: 'keratin' }],
  },
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
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36',
};

let fetchCache = { version: 1, entries: {} };
let resultCache = { version: 1, entries: {} };

async function readJsonFile(url, fallback) {
  try {
    return JSON.parse(await readFile(url, 'utf8'));
  } catch {
    return fallback;
  }
}

async function writeJsonFile(url, value) {
  await mkdir(new URL('.', url), { recursive: true });
  await writeFile(url, `${JSON.stringify(value, null, 2)}\n`);
}

async function loadCaches() {
  fetchCache = await readJsonFile(FETCH_CACHE_PATH, fetchCache);
  resultCache = await readJsonFile(RESULT_CACHE_PATH, resultCache);
}

async function saveFetchCache() {
  await writeJsonFile(FETCH_CACHE_PATH, fetchCache);
}

async function saveResultCache() {
  await writeJsonFile(RESULT_CACHE_PATH, resultCache);
}

function sleep(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

process.once('SIGINT', () => {
  Promise.all([saveFetchCache(), saveResultCache()])
    .catch(() => undefined)
    .finally(() => process.exit(130));
});

async function fetchJson(url, timeoutMs = 12000, maxAttempts = 3) {
  const cached = fetchCache.entries[url];
  if (cached?.type === 'json' && !REFRESH_FETCH_CACHE) return cached.value;
  if (CACHE_ONLY) return null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { headers: HEADERS, signal: controller.signal, redirect: 'follow' });
      if (response.status === 429 || response.status === 503) {
        clearTimeout(timer);
        await new Promise((resolvePromise) => setTimeout(resolvePromise, 3000 * (attempt + 1)));
        continue;
      }
      if (!response.ok) return null;
      const text = await response.text();
      if (text.trim().startsWith('<')) return null;
      const value = JSON.parse(text);
      fetchCache.entries[url] = { type: 'json', cachedAt: new Date().toISOString(), value };
      return value;
    } catch {
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 1000 * (attempt + 1)));
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

function tokenize(value) {
  return String(value)
    .toLowerCase()
    .replace(/['’]s\b/g, 's')
    .replace(/([a-z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-z])/g, '$1 $2')
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
  if (/\bplus\b/i.test(title) && !/plus/i.test(searchTerm)) penalty += 2;
  if (/&/.test(title)) penalty += 2;
  if (/\bcomplex\b/i.test(title) && !/complex/i.test(searchTerm)) penalty += 1;
  if (/\bsoothe\b|\bcalm\b|\bblend\b|\bformula\b/i.test(title) && !/soothe|calm|blend|formula/i.test(searchTerm)) penalty += 3;
  if (/\bgumm/i.test(title)) penalty += 1;
  if (/\bpowder\b/i.test(title) && !/powder/i.test(searchTerm)) penalty += 3;
  if (/\bfor dogs?\b|\bfor cats?\b|\bpets?\b/i.test(title)) penalty += 20;
  // Chemically different compounds that share a search token (e.g. inositol
  // hexanicotinate is a niacin form, not myo-inositol).
  if (/\bhexanicotinate\b|\bnicotinate\b/i.test(title)) penalty += 20;
  penalty += Math.max(0, tokenize(title).length - 6) * 0.25;
  return penalty;
}

const GENERIC_INGREDIENT_TOKENS = new Set([
  'oil', 'root', 'extract', 'seed', 'fiber', 'husk', 'acid', 'complex', 'mushroom',
  'peptides', 'fish', 'tea', 'balm', 'leaf', 'green', 'apple', 'cider', 'vinegar',
  'liver', 'monohydrate', 'glycinate', 'citrate', 'malate', 'vitamin',
]);

/** Tokens that identify a specific catalog ingredient (e.g. "ashwagandha"). */
const INGREDIENT_TOKENS = new Set([
  ...SUPPLEMENTS.flatMap((entry) => tokenize(entry.name.replace(/vitamin/gi, 'vitamin ')))
    .filter((token) => token.length > 2 && !GENERIC_INGREDIENT_TOKENS.has(token)),
  // Common pairing ingredients that signal a blend even though they are not
  // catalog supplements themselves (including frequent label misspellings
  // like "gingko"), plus trend-marketing terms that misrepresent a single
  // ingredient ("GLP-1 ...").
  'goldenseal', 'bioperine', 'ashwaghanda', 'chamomile', 'lavender', 'lutein',
  'gotu', 'kola', 'dmae', 'gingko', 'rosemary', 'serine', 'glp',
]);

/**
 * Penalizes listings whose title or handle names OTHER catalog ingredients
 * than the one being searched — those are multi-ingredient blends (e.g.
 * "Melatonin + Magnesium", handle "amen-magnesium-citrate-vitaminb6"), which
 * would misrepresent the supplement page they'd be attached to.
 */
function crossIngredientPenalty(text, searchTerm) {
  const searchTokens = new Set(tokenize(searchTerm));
  let penalty = 0;
  for (const token of new Set(tokenize(String(text).replace(/vitamin/gi, 'vitamin ')))) {
    if (INGREDIENT_TOKENS.has(token) && !searchTokens.has(token)) penalty += 3;
  }
  if (/vitamin\s*[a-k]?\d*/i.test(text) && !/vitamin/i.test(searchTerm)) penalty += 2;
  return penalty;
}

/**
 * Unit counts like "120 Capsules" with a non-alphanumeric boundary before the
 * digits, so "Vitamin B12 Capsules" or "CoQ10" never match.
 */
const UNIT_PATTERN =
  /(?:^|[^0-9a-z])(\d{2,4})\s*-?\s*(?:(?!mg\b|mcg\b|iu\b|g\b|oz\b|ml\b|billion\b|million\b|cfu\b)[a-z]+\s+){0,2}(?:veggie capsules|veggie caps|veg capsules|veg caps|capsules|caps|softgels|soft gels|gels|caplets|tablets|gummies|chewables|vcaps|lozenges|sticks?|packets?|count|ct)\b/i;

const SERVINGS_PATTERN = /(?:^|[^0-9a-z])(\d{2,4})\s*-?\s*servings\b/i;

/** "a 150-day supply" — labels equate a day's dose with a serving. */
const DAY_SUPPLY_PATTERN = /(?:^|[^0-9a-z])(\d{2,4})\s*-?\s*day supply\b/i;

/** Supplement-facts line: "Servings Per Container: 45" (page HTML). */
const SERVINGS_PER_CONTAINER_PATTERN = /servings? per container[^0-9]{0,12}(\d{1,4})/i;

/** "2-Pack" / "2 Bottles" bundles multiply the per-bottle unit count. */
const PACK_PATTERN = /(\d{1,2})\s*-?\s*(?:pack|bottles)\b/i;

const WORD_NUMBERS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };

function matchNumber(text, pattern) {
  const match = String(text || '').match(pattern);
  return match ? Number(match[1]) : null;
}

/**
 * Units per serving, e.g. "Serving Size: 2 Capsules" or "each serving
 * consists of three capsules" — needed because many bottles are 2-3 units
 * per serving, which halves/thirds the serving count.
 */
function parsePerServing(description) {
  const text = description.toLowerCase();
  // Up to two adjectives may sit between the number and the unit ("2 quick
  // release capsules", "3 veggie caps").
  const unitWords =
    '(?:[a-z]+\\s+){0,2}(?:capsules?|softgels?|soft gels?|tablets?|caplets?|caps|vegcaps?|vcaps?|gummies)';
  // Digit boundaries so the "5" inside "135 Capsules" can never match.
  const numberWord = '((?<![0-9])\\d(?![0-9])|one|two|three|four|five|six)';
  const match =
    text.match(new RegExp(`serving size(?:\\s+(?:is|of))?[^a-z0-9]{0,5}(?:consists of\\s*)?${numberWord}\\s*${unitWords}`)) ||
    text.match(new RegExp(`(?:each serving|per serving)[^.]{0,40}?${numberWord}\\s*${unitWords}`)) ||
    text.match(new RegExp(`${numberWord}\\s*${unitWords}\\s*per serving`)) ||
    text.match(new RegExp(`(?:take\\s+)?${numberWord}\\s*${unitWords}\\s*(?:daily|per day|a day|each day)`));
  if (!match) return null;
  const value = WORD_NUMBERS[match[1]] ?? Number(match[1]);
  return value >= 1 && value <= 6 ? value : null;
}

/** Fetches the rendered product page as tag-stripped text (for
 * supplement-facts prose that never appears in the .js description). */
async function fetchPageText(store, handle) {
  const url = `https://${store.domain}/products/${handle}`;
  const cached = fetchCache.entries[url];
  if (cached?.type === 'text' && !REFRESH_FETCH_CACHE) return cached.value;
  if (!DEEP_SERVINGS || CACHE_ONLY) return '';

  const init = {
    headers: {
      accept: 'text/html,application/xhtml+xml',
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36',
    },
    redirect: 'follow',
  };

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      if (response.status === 429 || response.status === 503) {
        await new Promise((resolvePromise) => setTimeout(resolvePromise, 5000 * (attempt + 1)));
        continue;
      }
      if (!response.ok) return '';
      const html = await response.text();
      const value = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ');
      fetchCache.entries[url] = { type: 'text', cachedAt: new Date().toISOString(), value };
      return value;
    } catch {
      return '';
    } finally {
      clearTimeout(timer);
    }
  }
  return '';
}

/**
 * Servings = units / units-per-serving. Unit counts come from the variant
 * title (including bare-number variants like "40"), product title, or handle
 * ("...-240-softgels"), multiplied for "2-Pack"/"2 Bottles" bundles.
 *
 * A unit count alone is NOT serving evidence — serving sizes of 2-3 units
 * are common and usually printed only in the page's supplement facts, so an
 * uncorroborated unit count would overstate servings (and understate
 * $/serving) by 2-3x. When the .js description carries no per-serving or
 * stated-servings signal, the rendered product page is fetched and scanned
 * for "Servings Per Container: N" / "Serving Size: N". Returns null — never
 * a made-up number — when no listing surface supports a figure.
 */
async function parseServings(productJson, variant, store) {
  const description = String(productJson.description || '').replace(/<[^>]+>/g, ' ');
  const titleAndVariant = `${variant?.title ?? ''} ${productJson.title}`;
  const packCount = matchNumber(titleAndVariant, PACK_PATTERN) ?? 1;
  const bareVariantCount = /^\d{1,4}$/.test(String(variant?.title ?? '').trim())
    ? Number(String(variant.title).trim())
    : null;
  const unitsPerBottle =
    matchNumber(variant?.title, UNIT_PATTERN) ??
    bareVariantCount ??
    matchNumber(productJson.title, UNIT_PATTERN) ??
    matchNumber(String(productJson.handle || '').replace(/-/g, ' '), UNIT_PATTERN) ??
    matchNumber(description, UNIT_PATTERN);
  const totalUnits = unitsPerBottle ? unitsPerBottle * packCount : null;

  let perServing = parsePerServing(description);
  let statedServings =
    matchNumber(description, SERVINGS_PATTERN) ??
    matchNumber(productJson.title, SERVINGS_PATTERN) ??
    matchNumber(description, DAY_SUPPLY_PATTERN);

  if (perServing == null && statedServings == null && totalUnits) {
    const pageText = await fetchPageText(store, productJson.handle);
    // Only the specific supplement-facts phrasing is trusted from page HTML;
    // a generic "N servings" match could come from cross-sell modules.
    const perContainer = matchNumber(pageText, SERVINGS_PER_CONTAINER_PATTERN);
    if (perContainer) {
      statedServings = perContainer * packCount;
    } else {
      perServing = parsePerServing(pageText);
    }
  }

  const derivedServings =
    totalUnits && perServing != null ? Math.max(1, Math.floor(totalUnits / perServing)) : null;

  if (statedServings && derivedServings) return Math.min(statedServings, derivedServings);
  if (statedServings) return Math.min(statedServings, totalUnits ?? statedServings);
  return derivedServings ?? null;
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
  let bestPrice = Number.POSITIVE_INFINITY;

  for (const variant of available) {
    if (!variant.title || variant.title === 'Default Title') continue;
    const score = tokenize(variant.title).filter((token) => haystack.includes(` ${token} `)).length;
    const price = Number(variant.price) || Number.POSITIVE_INFINITY;
    if (score > bestScore || (score === bestScore && price < bestPrice)) {
      best = variant;
      bestScore = score;
      bestPrice = price;
    }
  }

  return best;
}

async function searchStore(store, searchTerm) {
  const url = `https://${store.domain}/search/suggest.json?q=${encodeURIComponent(searchTerm)}&resources[type]=product&resources[limit]=10`;
  const payload = await fetchJson(url, 8000, 2);
  const products = payload?.resources?.results?.products ?? [];

  return products
    .filter((product) => product.available !== false && product.handle)
    .filter((product) => titleMatches(product.title, searchTerm))
    .map((product, index) => ({
      store,
      handle: product.handle,
      title: product.title,
      score:
        comboPenalty(product.title, searchTerm) +
        crossIngredientPenalty(`${product.title} ${product.handle}`, searchTerm) +
        index * 0.05,
    }));
}

async function searchStoreWithTimeout(store, searchTerm) {
  return Promise.race([
    searchStore(store, searchTerm),
    sleep(STORE_SEARCH_TIMEOUT_MS).then(() => []),
  ]);
}

/**
 * Some stores (e.g. Piping Rock) are marketplaces carrying third-party
 * brands. A pick whose live vendor is not the store's house brand would be
 * misattributed in brand filters, logos, and discovery — skip it.
 */
function vendorMatchesStore(vendor, store) {
  if (!vendor) return true;
  const vendorTokens = new Set(tokenize(vendor));
  return tokenize(store.brandName).some((token) => vendorTokens.has(token));
}

const VITAMIN_COMBO_MARKERS = [
  {
    id: 'd3',
    pattern: /\b(?:vitamin\s*)?d\s*-?\s*3\b|\bd3\b|\bcholecalciferol\b/i,
  },
  {
    id: 'k2',
    pattern: /\b(?:vitamin\s*)?k\s*-?\s*2\b|\bk2\b|\bmk\s*-?\s*7\b|\bmk7\b/i,
  },
  {
    id: 'b12',
    pattern: /\b(?:vitamin\s*)?b\s*-?\s*12\b|\bb12\b|\bmethylcobalamin\b|\bcyanocobalamin\b/i,
  },
  {
    id: 'c',
    pattern: /\bvitamin\s*c\b|\bascorbic\b/i,
  },
];

function hasUnsearchedVitaminInCombo(text, searchTerm) {
  const value = String(text || '');
  if (!/[\+&]|\bplus\b|\bwith\b/i.test(value)) return false;

  const mentioned = VITAMIN_COMBO_MARKERS.filter((marker) => marker.pattern.test(value));
  const searched = new Set(
    VITAMIN_COMBO_MARKERS.filter((marker) => marker.pattern.test(searchTerm)).map((marker) => marker.id)
  );

  return mentioned.some((marker) => !searched.has(marker.id) && (mentioned.length > 1 || searched.size === 0));
}

function listingDisqualificationReason(text, searchTerm, supplementName) {
  const value = String(text || '');
  if (/(^|[^a-z0-9])s\s*&\s*s([^a-z0-9]|$)|\bsubscribe\b|\bsubscription\b|\bautoship\b|\bauto ship\b|\bauto-delivery\b|\brecurring\b/i.test(value)) {
    return 'subscription mirror';
  }
  if (/\bfor dogs?\b|\bfor cats?\b|\bpets?\b/i.test(value)) return 'pet product';
  if (/\b(?:serum|cream|lotion|shampoo|conditioner|topical|pump bottle)\b/i.test(value)) return 'topical product';

  const isBComplexSearch = /b\s*complex/i.test(searchTerm) || /b-complex/i.test(supplementName);
  if (!isBComplexSearch && /\bb\s*[- ]?\s*complex\b/i.test(value)) return 'b-complex blend';
  if (/calcium/i.test(searchTerm) && /\b(?:edta|disodium)\b/i.test(value)) return 'calcium chelator';
  if (/prebiotic/i.test(searchTerm) && /\bprobiotic/i.test(value)) return 'prebiotic/probiotic blend';
  if (/coq10/i.test(searchTerm) && /\b(?:pqq|biopqq|shilajit)\b/i.test(value)) return 'coq10 blend';
  if (/resveratrol/i.test(searchTerm) && /\b(?:indole|carbinol|nad|collagen)\b/i.test(value)) return 'resveratrol blend';
  if (/mct oil/i.test(searchTerm) && /\bastaxanthin\b/i.test(value)) return 'mct blend';
  if (/keratin/i.test(searchTerm) && /\bbiotin\b/i.test(value)) return 'keratin blend';
  if (/elderberry/i.test(searchTerm) && /\bechinacea\b/i.test(value)) return 'elderberry blend';
  if (/echinacea/i.test(searchTerm) && /\belderberry\b/i.test(value)) return 'echinacea blend';
  if (/passion\s*flower|passionflower/i.test(searchTerm) && /\bchrysin\b/i.test(value)) return 'passionflower blend';
  if (/myo[\s-]*inositol/i.test(supplementName) && !/\bmyo\b/i.test(value)) return 'inositol blend';
  if (/citrulline malate/i.test(supplementName) && !/\bmalate\b/i.test(value)) return 'citrulline form mismatch';
  if (/citrulline malate/i.test(supplementName) && /\barginine\b/i.test(value)) return 'citrulline blend';
  if (/creatine hcl/i.test(supplementName) && !/\b(?:hcl|hydrochloride)\b/i.test(value)) return 'creatine form mismatch';
  if (/\b[a-z0-9][a-z0-9-]*\+(?:\s|$)/i.test(value) && !/\busda\b|\bcertified\b|\borganic\b/i.test(value)) {
    return 'branded blend';
  }

  if (hasUnsearchedVitaminInCombo(value, searchTerm)) return 'multi-vitamin blend';
  if (!/d3|vitamin\s*d/i.test(searchTerm) && /\b(?:plus|with)\s+(?:d3|vitamin\s*d3?|cholecalciferol)\b/i.test(value)) {
    return 'vitamin d blend';
  }
  if (!/k2|vitamin\s*k/i.test(searchTerm) && /\b(?:plus|with)\s+(?:k2|vitamin\s*k2?)\b/i.test(value)) {
    return 'vitamin k blend';
  }
  if (/[\+&]|\bplus\b|\bwith\b/i.test(value) && crossIngredientPenalty(value, searchTerm) >= 6) {
    return 'multi-ingredient blend';
  }

  return null;
}

const FAMILY_TOKEN_STOPWORDS = new Set([
  'mg', 'mcg', 'iu', 'g', 'oz', 'fl', 'ml', 'count', 'ct', 'capsule', 'capsules',
  'caps', 'caplet', 'caplets', 'softgel', 'softgels', 'tablet', 'tablets',
  'chewable', 'chewables', 'gummy', 'gummies', 'veggie', 'vegetarian', 'quick',
  'release', 'coated', 'bottle', 'bottles', 'bag', 'bags', 'pack', 'packs',
  'gram', 'grams', 'kg', 'kilogram', 'kilograms', 'kilo', 'kilos', 'lb', 'lbs',
  'pound', 'pounds', 'per', 'serving', 'servings', 'day', 'supply',
]);

function productFamilyKey(entry) {
  const tokens = tokenize(entry.title)
    .filter((token) => token.length > 1)
    .filter((token) => !/^\d+$/.test(token))
    .filter((token) => !FAMILY_TOKEN_STOPWORDS.has(token));
  return `${entry.brandId}:${tokens.join('-')}`;
}

async function resolveProduct(store, handle, searchTerm, supplementName, options = {}) {
  const productJson = await fetchJson(`https://${store.domain}/products/${handle}.js`, 12000, 4);
  if (!productJson) return null;

  if (!options.allowMarketplaceVendor && !vendorMatchesStore(productJson.vendor, store)) return null;
  if (listingDisqualificationReason(`${productJson.title} ${productJson.handle}`, searchTerm, supplementName)) return null;

  // Blends often keep their title clean and bury the other ingredients in
  // the description ("Our complex contains ... Ginkgo Biloba, Gotu Kola").
  const descriptionText = String(productJson.description || '')
    .replace(/<[^>]+>/g, ' ')
    .slice(0, 600);
  const descriptionAllowsComplexity = /digestive enzymes/i.test(supplementName);
  if (searchTerm && !descriptionAllowsComplexity && crossIngredientPenalty(descriptionText, searchTerm) >= 6) {
    return null;
  }

  const variant = pickVariant(productJson);
  if (!variant) return null;

  // Prefer the chosen variant's own image so e.g. a 3mg pick doesn't show
  // the 12mg bottle.
  const image =
    variant.featured_image?.src || productJson.images?.[0] || productJson.featured_image || '';
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
    servings: await parseServings(productJson, variant, store),
    url: `https://${store.domain}/products/${handle}`,
  };
}

async function sourceSupplement(entry, brandUsage, targetCount = PRODUCTS_PER_SUPPLEMENT) {
  // First pass applies the brand-diversity penalty; if no candidate resolves,
  // retry on match quality alone so diversity never costs catalog coverage.
  const results = [];
  const seenCandidateKeys = new Set();
  const seenVariantIds = new Set();
  const seenProductIds = new Set();
  const seenProductFamilies = new Set();
  const seenBrandIds = new Set();

  async function addResolvedCandidate(candidate, searchTerm, { enforceBrandDiversity = false } = {}) {
    if (listingDisqualificationReason(`${candidate.title ?? ''} ${candidate.handle}`, searchTerm, entry.name)) {
      return false;
    }
    if (results.length > 0 && enforceBrandDiversity && seenBrandIds.has(candidate.store.brandId)) return false;

    const candidateKey = `${candidate.store.domain}:${candidate.handle}`;
    if (seenCandidateKeys.has(candidateKey)) return false;
    seenCandidateKeys.add(candidateKey);

    const resolved = await resolveProduct(candidate.store, candidate.handle, searchTerm, entry.name, {
      allowMarketplaceVendor: candidate.allowMarketplaceVendor === true,
    });
    if (!resolved || !resolved.variantId || !resolved.price) return false;
    if (resolved.price > MAX_PRODUCT_PRICE) return false;
    if (seenVariantIds.has(resolved.variantId)) return false;
    if (seenProductIds.has(resolved.productId)) return false;

    const familyKey = productFamilyKey({ brandId: candidate.store.brandId, title: resolved.title });
    if (seenProductFamilies.has(familyKey)) return false;

    brandUsage.set(candidate.store.brandId, (brandUsage.get(candidate.store.brandId) ?? 0) + 1);
    seenVariantIds.add(resolved.variantId);
    seenProductIds.add(resolved.productId);
    seenProductFamilies.add(familyKey);
    seenBrandIds.add(candidate.store.brandId);

    results.push({
      supplementName: entry.name,
      store: candidate.store.domain,
      brandId: candidate.store.brandId,
      brandName: candidate.store.brandName,
      ...resolved,
    });

    return results.length >= targetCount;
  }

  for (const reusePenalty of [BRAND_REUSE_PENALTY, 0]) {
    for (const searchTerm of entry.searchTerms) {
      const candidateGroups = await Promise.all(
        ACTIVE_STORES.map((store) => searchStoreWithTimeout(store, searchTerm))
      );
      const candidates = candidateGroups
        .flat()
        .map((candidate) => ({
          ...candidate,
          score: candidate.score + (brandUsage.get(candidate.store.brandId) ?? 0) * reusePenalty,
        }))
        .sort((a, b) => a.score - b.score);

      for (const candidate of candidates.slice(0, 14)) {
        const isComplete = await addResolvedCandidate(candidate, searchTerm, {
          enforceBrandDiversity: reusePenalty !== 0,
        });
        if (isComplete) return results;
      }
    }
  }

  for (const fallback of entry.fallbackProducts ?? []) {
    const store = STORES_BY_DOMAIN.get(fallback.domain);
    if (!store) continue;
    const isComplete = await addResolvedCandidate(
      {
        store,
        handle: fallback.handle,
        title: fallback.title ?? fallback.handle,
        allowMarketplaceVendor: fallback.allowMarketplaceVendor === true,
      },
      fallback.searchTerm ?? entry.searchTerms[0]
    );
    if (isComplete) return results;
  }

  if (results.length > 0) return results;

  return { supplementName: entry.name, error: 'no match found' };
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function esc(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/** Form badge from the full listing (variant + title), since e.g. "Bags /
 * 500 grams" or "2 fl oz" only appear in the variant title. Returns null
 * when the form isn't stated rather than guessing. */
function badgeFor(text) {
  if (/powder|\bbags?\b|\bgrams?\b(?![a-z])/i.test(text)) return 'Bulk powder';
  if (/gumm/i.test(text)) return 'Gummies';
  if (/chewable/i.test(text)) return 'Chewables';
  if (/softgel|soft gel/i.test(text)) return 'Softgels';
  if (/tablet|caplet/i.test(text)) return 'Tablets';
  if (/liquid|drops|\boil\b|fl oz|\boz\b/i.test(text)) return 'Liquid';
  if (/capsule|\bcaps\b|vcap/i.test(text)) return 'Capsules';
  return null;
}

function emitSeed(entry, usedProductIds) {
  const slug = slugify(entry.supplementName);
  const baseProductId = `real-${entry.brandId}-${slug}`;
  const productId = usedProductIds.has(baseProductId)
    ? `${baseProductId}-${slugify(entry.handle || entry.displayName).slice(0, 40)}`
    : baseProductId;
  usedProductIds.add(productId);

  const cleanName = entry.displayName.replace(/\s+\|.*$/, '').trim();
  const description = `${entry.brandName} ${entry.supplementName.toLowerCase()} pick with a verified merchant listing, so shoppers can move straight from the supplement page into secure cart checkout.`;
  // 0 = servings unverifiable from the listing; the UI hides per-serving
  // math for these rather than displaying an invented number.
  const servings = Number(entry.servings) > 0 ? Number(entry.servings) : 0;
  const formBadge = badgeFor(`${entry.variantTitle ?? ''} ${entry.title}`);
  const badges = ['Verified merchant', 'Verified variant', ...(formBadge ? [formBadge] : [])];

  return `  {
    product_id: '${productId}',
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
    quality_badges: [${badges.map((badge) => `'${esc(badge)}'`).join(', ')}],
    subscriptions_available: false,
    data_source: 'shopify_ucp',
  },`;
}

function cachedResultIsStillValid(entry, item) {
  const text = `${item.displayName ?? ''} ${item.title ?? ''} ${item.handle ?? ''}`;
  const searchTerm = entry.searchTerms[0] ?? entry.name;
  return !listingDisqualificationReason(text, searchTerm, entry.name);
}

function buildOutputFile(seedBlocks) {
  return `import type { CuratedProductSeed } from './supplement-catalog';

/**
 * Shopify-sourced product seeds covering every catalog supplement that does
 * not have a hand-curated merchant listing. Each entry carries a live Shopify
 * product + variant ID verified against the merchant storefront, so every
 * supplement page can offer a working cart-permalink checkout. The product
 * name includes the exact variant that lands in the merchant cart.
 *
 * Regenerate with: npm run source:shopify:fast
 * Validate with:   npm run verify:shopify-catalog
 */
export const sourcedProductSeeds: CuratedProductSeed[] = [
${seedBlocks.join('\n')}
];
`;
}

function extractSeedString(block, key) {
  const match = block.match(new RegExp(`${key}: '([^']+)'`));
  return match?.[1] ?? null;
}

function extractExistingSeedBlocks(source) {
  const blocks = source.match(/  \{\n\s+product_id: '[^']+'[\s\S]*?\n  \},/g) ?? [];

  return blocks.map((block) => ({
    block,
    productId: extractSeedString(block, 'product_id'),
    productUrl: extractSeedString(block, 'product_url'),
    variantGid: extractSeedString(block, 'shopify_variant_gid'),
  }));
}

async function buildMergedOutputFile(newResults) {
  const existingSource = await readFile(OUTPUT_PATH, 'utf8').catch(() => '');
  const existingSeeds = extractExistingSeedBlocks(existingSource);
  const existingProductIds = new Set(existingSeeds.map((seed) => seed.productId).filter(Boolean));
  const existingVariantGids = new Set(existingSeeds.map((seed) => seed.variantGid).filter(Boolean));
  const existingProductUrls = new Set(existingSeeds.map((seed) => seed.productUrl).filter(Boolean));
  const usedProductIds = new Set(existingProductIds);
  const newBlocks = [];

  for (const result of newResults) {
    const variantGid = `gid://shopify/ProductVariant/${result.variantId}`;
    if (existingVariantGids.has(variantGid) || existingProductUrls.has(result.url)) continue;
    const block = emitSeed(result, usedProductIds);
    newBlocks.push(block);
    existingVariantGids.add(variantGid);
    existingProductUrls.add(result.url);
  }

  return {
    file: buildOutputFile([...existingSeeds.map((seed) => seed.block), ...newBlocks]),
    existingCount: existingSeeds.length,
    addedCount: newBlocks.length,
  };
}

async function main() {
  await loadCaches();

  const results = [];
  const misses = [];
  const partials = [];
  const brandUsage = new Map();
  const selectedSupplements = SUPPLEMENTS.filter((entry) =>
    SOURCE_ONLY.size === 0 ? true : SOURCE_ONLY.has(entry.name.toLowerCase())
  ).slice(0, SOURCE_LIMIT);

  console.log(
    `Sourcing ${selectedSupplements.length} supplement${selectedSupplements.length !== 1 ? 's' : ''} ` +
      `(target ${SOURCE_TARGET_COUNT}, ${DEEP_SERVINGS ? 'deep servings' : 'fast servings'}, ` +
      `${CACHE_ONLY ? 'cache-only' : 'live+cache'}, ${ACTIVE_STORES.length} stores)`
  );

  for (const entry of selectedSupplements) {
    const cached = !REFRESH_RESULT_CACHE ? resultCache.entries[entry.name] : null;
    const cachedResults = Array.isArray(cached?.results)
      ? cached.results.filter((item) => cachedResultIsStillValid(entry, item))
      : [];
    const useCachedResults =
      Array.isArray(cached?.results) && (cachedResults.length >= SOURCE_TARGET_COUNT || CACHE_ONLY);
    const result = useCachedResults
      ? cachedResults.slice(0, SOURCE_TARGET_COUNT)
      : await sourceSupplement(entry, brandUsage, SOURCE_TARGET_COUNT);

    if (result.error) {
      misses.push(result);
      console.log(`MISS  ${entry.name}: ${result.error}`);
      continue;
    }

    if (!useCachedResults) {
      resultCache.entries[entry.name] = {
        cachedAt: new Date().toISOString(),
        targetCount: SOURCE_TARGET_COUNT,
        results: result,
      };
      await saveResultCache();
    } else {
      for (const item of result) {
        brandUsage.set(item.brandId, (brandUsage.get(item.brandId) ?? 0) + 1);
      }
    }

    results.push(...result);
    if (result.length < SOURCE_TARGET_COUNT) partials.push({ name: entry.name, count: result.length });

    console.log(
      `${useCachedResults ? 'CACHE' : 'OK   '} ${entry.name} -> ${result.length} verified product${result.length !== 1 ? 's' : ''}`
    );
    result.forEach((item) => {
      console.log(
        `      [${item.store}] ${item.displayName} ($${item.price}, ${item.servings} servings, variant ${item.variantId})`
      );
    });
  }

  const distribution = [...brandUsage.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`\nBrand distribution: ${distribution.map(([brand, count]) => `${brand}=${count}`).join(', ')}`);
  if (partials.length) {
    console.warn(
      `\n${partials.length} supplements had fewer than ${SOURCE_TARGET_COUNT} verified products: ` +
        partials.map((item) => `${item.name}=${item.count}`).join(', ')
    );
  }

  if (misses.length) {
    console.error(`\n${misses.length} supplements unmatched: ${misses.map((miss) => miss.supplementName).join(', ')}`);
    await saveFetchCache();
    await saveResultCache();
    process.exitCode = 1;
    return;
  }

  const isFullSelection = SOURCE_ONLY.size === 0 && selectedSupplements.length === SUPPLEMENTS.length;

  if (!WRITE_OUTPUT) {
    await saveFetchCache();
    await saveResultCache();
    console.log(`\nNo-write mode: kept generated source file unchanged.`);
    return;
  }

  if (MERGE_EXISTING) {
    const merge = await buildMergedOutputFile(results);
    await writeFile(OUTPUT_PATH, merge.file);
    await saveFetchCache();
    await saveResultCache();
    console.log(
      `\nMerged ${merge.addedCount} new sourced product seed${merge.addedCount !== 1 ? 's' : ''} ` +
        `into ${merge.existingCount} existing seed${merge.existingCount !== 1 ? 's' : ''}.`
    );
    return;
  }

  if (!isFullSelection && !FORCE_WRITE) {
    await saveFetchCache();
    await saveResultCache();
    console.log(`\nNo-write mode: kept generated source file unchanged.`);
    console.log('Pass --merge-existing to append a targeted run, or --force-write to replace the generated file.');
    return;
  }

  const usedProductIds = new Set();
  const file = buildOutputFile(results.map((result) => emitSeed(result, usedProductIds)));

  await writeFile(OUTPUT_PATH, file);
  await saveFetchCache();
  await saveResultCache();
  console.log(`\nWrote ${results.length} sourced product seeds to shopify-sourced-products.ts`);
}

main();
