import type { Product } from '@/types';
import {
  catalogFieldsMatchQuery,
  normalizeCatalogSearchTerm,
} from '@/lib/catalog/catalog-search';
import {
  buildProductDirectory,
  type ProductDirectoryProduct,
} from '@/lib/catalog/product-directory';
import type {
  CounterScanMatchedItem,
  CounterScanRecognizedInput,
} from '@/lib/catalog/counter-scan-types';

export interface CounterScanCatalogContextItem {
  id: string;
  brand: string;
  product: string;
  supplement: string;
  category: string;
}

interface ScoredProduct {
  product: ProductDirectoryProduct;
  score: number;
}

const MIN_MATCH_SCORE = 62;
const MIN_AMBIGUOUS_SCORE = 34;

function normalizeConfidence(value: number | undefined) {
  if (!Number.isFinite(value)) return 0.35;
  return Math.max(0, Math.min(1, Number(value)));
}

function normalizeText(value: string | null | undefined) {
  return String(value ?? '').trim();
}

function compactVisibleText(values: unknown) {
  if (!Array.isArray(values)) return [];
  return values
    .map((value) => normalizeText(String(value ?? '')))
    .filter(Boolean)
    .slice(0, 12);
}

function productBrand(product: Product) {
  return product.brands?.brand_name ?? product.shopify_store_domain ?? '';
}

function productSupplement(product: ProductDirectoryProduct) {
  return product.directory_supplement_name || product.supplements?.supplement_name || '';
}

function tokenCoverage(needle: string, haystack: string) {
  const tokens = normalizeCatalogSearchTerm(needle)
    .split(' ')
    .filter((token) => token.length > 2);
  if (tokens.length === 0) return 0;

  const normalizedHaystack = normalizeCatalogSearchTerm(haystack);
  const hits = tokens.filter((token) => normalizedHaystack.includes(token)).length;
  return hits / tokens.length;
}

function fieldScore(
  needle: string,
  haystack: string,
  weights: { exact: number; prefix: number; contains: number; tokens: number }
) {
  const normalizedNeedle = normalizeCatalogSearchTerm(needle);
  const normalizedHaystack = normalizeCatalogSearchTerm(haystack);
  if (!normalizedNeedle || !normalizedHaystack) return 0;

  if (normalizedHaystack === normalizedNeedle) return weights.exact;
  if (
    normalizedHaystack.startsWith(normalizedNeedle) ||
    normalizedNeedle.startsWith(normalizedHaystack)
  ) {
    return weights.prefix;
  }
  if (
    normalizedHaystack.includes(normalizedNeedle) ||
    normalizedNeedle.includes(normalizedHaystack)
  ) {
    return weights.contains;
  }

  return tokenCoverage(normalizedNeedle, normalizedHaystack) * weights.tokens;
}

function buildRecognitionQuery(item: CounterScanRecognizedInput) {
  return [
    item.brandName,
    item.productName,
    item.supplementName,
    item.visibleText.join(' '),
    item.label,
  ]
    .map(normalizeText)
    .filter(Boolean)
    .join(' ')
    .trim();
}

function scoreProductMatch(item: CounterScanRecognizedInput, product: ProductDirectoryProduct) {
  const brand = productBrand(product);
  const supplement = productSupplement(product);
  const visibleText = item.visibleText.join(' ');
  const query = buildRecognitionQuery(item);

  let score = 0;
  score += fieldScore(item.productName, product.product_name, {
    exact: 74,
    prefix: 52,
    contains: 38,
    tokens: 26,
  });
  score += fieldScore(item.label, product.product_name, {
    exact: 58,
    prefix: 44,
    contains: 30,
    tokens: 20,
  });
  score += fieldScore(item.brandName, brand, {
    exact: 36,
    prefix: 26,
    contains: 18,
    tokens: 12,
  });
  score += fieldScore(item.supplementName, supplement, {
    exact: 28,
    prefix: 20,
    contains: 14,
    tokens: 10,
  });
  score += fieldScore(visibleText, product.product_name, {
    exact: 46,
    prefix: 34,
    contains: 26,
    tokens: 18,
  });
  score += fieldScore(visibleText, brand, {
    exact: 18,
    prefix: 12,
    contains: 8,
    tokens: 6,
  });

  if (
    item.brandName &&
    item.productName &&
    fieldScore(item.brandName, brand, { exact: 1, prefix: 0.8, contains: 0.5, tokens: 0.3 }) >= 0.8 &&
    fieldScore(item.productName, product.product_name, {
      exact: 1,
      prefix: 0.8,
      contains: 0.5,
      tokens: 0.3,
    }) >= 0.5
  ) {
    score += 18;
  }

  if (
    query &&
    catalogFieldsMatchQuery(query, [
      product.product_name,
      brand,
      supplement,
      product.directory_category,
      product.shopify_store_domain,
    ])
  ) {
    score += 10;
  }

  return score;
}

function toStableId(item: CounterScanRecognizedInput, index: number) {
  const seed = normalizeCatalogSearchTerm(
    [item.brandName, item.productName, item.supplementName, item.label].filter(Boolean).join(' ')
  );
  return `${index + 1}-${seed || 'unknown'}`;
}

export function sanitizeCounterScanRecognitions(
  items: CounterScanRecognizedInput[]
): CounterScanRecognizedInput[] {
  return items
    .map((item) => {
      const brandName = normalizeText(item.brandName);
      const productName = normalizeText(item.productName);
      const supplementName = normalizeText(item.supplementName);
      const visibleText = compactVisibleText(item.visibleText);
      const label =
        normalizeText(item.label) ||
        [brandName, productName, supplementName].filter(Boolean).join(' ') ||
        visibleText.join(' ');

      return {
        label,
        brandName,
        productName,
        supplementName,
        confidence: normalizeConfidence(item.confidence),
        visibleText,
        visualCues: normalizeText(item.visualCues),
      };
    })
    .filter((item) => item.label || item.brandName || item.productName || item.supplementName)
    .slice(0, 24);
}

export function matchCounterScanRecognitions(
  items: CounterScanRecognizedInput[],
  products: ProductDirectoryProduct[] = buildProductDirectory().products
): CounterScanMatchedItem[] {
  const sanitized = sanitizeCounterScanRecognitions(items);

  return sanitized.map((item, index) => {
    const scored = products
      .map((product) => ({ product, score: scoreProductMatch(item, product) }))
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score || a.product.product_name.localeCompare(b.product.product_name));

    const best = scored[0] as ScoredProduct | undefined;
    const matchStatus =
      best && best.score >= MIN_MATCH_SCORE
        ? 'matched'
        : best && best.score >= MIN_AMBIGUOUS_SCORE
          ? 'ambiguous'
          : 'unmatched';
    const matchConfidence = best
      ? Math.max(0.05, Math.min(0.99, (best.score / 135) * (0.6 + item.confidence * 0.4)))
      : 0;

    return {
      ...item,
      id: toStableId(item, index),
      query: buildRecognitionQuery(item),
      matchStatus,
      matchConfidence,
      product: matchStatus === 'matched' && best ? best.product : null,
      alternates: scored.slice(0, 3).map((row) => row.product),
    };
  });
}

export function buildCounterScanCatalogContext(limit = 550): CounterScanCatalogContextItem[] {
  return buildProductDirectory()
    .products.slice(0, limit)
    .map((product) => ({
      id: String(product.product_id),
      brand: productBrand(product),
      product: product.product_name,
      supplement: productSupplement(product),
      category: product.directory_category,
    }));
}

export function buildRecognitionsFromText(value: string): CounterScanRecognizedInput[] {
  return value
    .split(/[\n,;]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 24)
    .map((label) => ({
      label,
      brandName: '',
      productName: label,
      supplementName: '',
      confidence: 0.35,
      visibleText: [label],
      visualCues: 'Typed fallback',
    }));
}
