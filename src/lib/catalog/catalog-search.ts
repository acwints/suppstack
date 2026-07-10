import type { Product, Supplement } from '@/types';
import {
  brandSlug,
  buildCatalogBrandDiscovery,
  type BrandDiscoveryItem,
} from '@/lib/catalog/brand-discovery';
import {
  buildProductDirectory,
  type ProductDirectoryData,
  type ProductDirectoryProduct,
} from '@/lib/catalog/product-directory';
import {
  HEALTH_GOAL_DEFINITIONS,
  healthGoalHref,
  type HealthGoalDefinition,
} from '@/lib/catalog/health-goal-directory';
import { supplementCatalog } from '@/lib/catalog/supplement-catalog';

export type CatalogSearchResultType = 'product' | 'brand' | 'supplement' | 'goal' | 'peptide';

export interface CatalogSearchResult {
  type: CatalogSearchResultType;
  id: string | number;
  name: string;
  subtitle: string;
  href: string;
  rank: number;
  product?: ProductDirectoryProduct;
  brand?: BrandDiscoveryItem;
  supplement?: Supplement;
  goal?: HealthGoalDefinition;
}

export interface CatalogSearchIndex {
  products: ProductDirectoryProduct[];
  brands: BrandDiscoveryItem[];
  supplements: Supplement[];
  goals: HealthGoalDefinition[];
}

export interface CatalogSearchOptions {
  productLimit?: number;
  brandLimit?: number;
  supplementLimit?: number;
  goalLimit?: number;
}

const DEFAULT_LIMITS: Required<CatalogSearchOptions> = {
  productLimit: 12,
  brandLimit: 6,
  supplementLimit: 8,
  goalLimit: 4,
};

export function normalizeCatalogSearchTerm(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function queryTokens(query: string) {
  return normalizeCatalogSearchTerm(query).split(' ').filter(Boolean);
}

export function catalogFieldsMatchQuery(query: string, fields: Array<string | undefined | null>) {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return true;

  const haystack = normalizeCatalogSearchTerm(fields.filter(Boolean).join(' '));
  return tokens.every((token) => haystack.includes(token));
}

function scoreFields(query: string, fields: Array<string | undefined | null>) {
  const normalizedQuery = normalizeCatalogSearchTerm(query);
  const normalizedFields = fields.map((field) => normalizeCatalogSearchTerm(field ?? ''));
  let score = 0;

  normalizedFields.forEach((field, index) => {
    if (!field) return;
    if (field === normalizedQuery) score += 100 - index;
    else if (field.startsWith(normalizedQuery)) score += 60 - index;
    else if (field.includes(normalizedQuery)) score += 20 - index;
  });

  return score;
}

export function productMatchesCatalogQuery(product: ProductDirectoryProduct, query: string) {
  return catalogFieldsMatchQuery(query, [
    product.product_name,
    product.product_description,
    product.brands?.brand_name,
    product.supplements?.supplement_name,
    product.directory_supplement_name,
    product.directory_category,
    product.shopify_store_domain,
    ...(product.quality_badges ?? []),
  ]);
}

export function brandMatchesCatalogQuery(brand: BrandDiscoveryItem, query: string) {
  return catalogFieldsMatchQuery(query, [
    brand.brandName,
    ...brand.categories,
    ...brand.storeDomains,
    ...brand.products.map((product) => product.product_name),
  ]);
}

function supplementMatchesCatalogQuery(supplement: Supplement, query: string) {
  return catalogFieldsMatchQuery(query, [
    supplement.supplement_name,
    supplement.supplement_description,
    supplement.category,
    ...(supplement.aliases ?? []),
    ...(supplement.primary_goals ?? []),
  ]);
}

function goalMatchesCatalogQuery(goal: HealthGoalDefinition, query: string) {
  return catalogFieldsMatchQuery(query, [
    goal.title,
    goal.shortTitle,
    goal.description,
    goal.signalLabel,
    goal.commerceAngle,
    ...goal.supplementNames,
  ]);
}

export function buildCatalogSearchIndex(
  directory: ProductDirectoryData = buildProductDirectory()
): CatalogSearchIndex {
  return {
    products: directory.products,
    brands: buildCatalogBrandDiscovery({ includeCatalogFallback: true }),
    supplements: supplementCatalog,
    goals: HEALTH_GOAL_DEFINITIONS,
  };
}

export function searchCatalog(
  query: string,
  index: CatalogSearchIndex = buildCatalogSearchIndex(),
  options: CatalogSearchOptions = {}
): CatalogSearchResult[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const limits = { ...DEFAULT_LIMITS, ...options };

  const goalResults: CatalogSearchResult[] = index.goals
    .filter((goal) => goalMatchesCatalogQuery(goal, trimmed))
    .map((goal) => ({
      type: 'goal' as const,
      id: goal.id,
      name: goal.title,
      subtitle: goal.signalLabel,
      href: healthGoalHref(goal.id),
      rank: scoreFields(trimmed, [goal.title, goal.shortTitle, goal.signalLabel]),
      goal,
    }))
    .sort((a, b) => b.rank - a.rank || a.name.localeCompare(b.name))
    .slice(0, limits.goalLimit);

  const supplementResults: CatalogSearchResult[] = index.supplements
    .filter((supplement) => supplementMatchesCatalogQuery(supplement, trimmed))
    .map((supplement) => ({
      type: supplement.research_only ? ('peptide' as const) : ('supplement' as const),
      id: supplement.supplement_id,
      name: supplement.supplement_name,
      subtitle: supplement.research_only ? 'Research reference' : supplement.category ?? 'Supplement',
      href: `/supplement/${supplement.supplement_id}`,
      rank: scoreFields(trimmed, [
        supplement.supplement_name,
        supplement.category,
        ...(supplement.aliases ?? []),
      ]),
      supplement,
    }))
    .sort((a, b) => b.rank - a.rank || a.name.localeCompare(b.name))
    .slice(0, limits.supplementLimit);

  const brandResults: CatalogSearchResult[] = index.brands
    .filter((brand) => brandMatchesCatalogQuery(brand, trimmed))
    .map((brand) => ({
      type: 'brand' as const,
      id: brandSlug(brand.brandName),
      name: brand.brandName,
      subtitle: `${brand.productCount} product${brand.productCount === 1 ? '' : 's'}`,
      href: `/brands/${brandSlug(brand.brandName)}`,
      rank:
        scoreFields(trimmed, [brand.brandName, ...brand.categories, ...brand.storeDomains]) +
        Math.min(brand.productCount, 20),
      brand,
    }))
    .sort((a, b) => b.rank - a.rank || a.name.localeCompare(b.name))
    .slice(0, limits.brandLimit);

  const productResults: CatalogSearchResult[] = index.products
    .filter((product) => productMatchesCatalogQuery(product, trimmed))
    .map((product) => ({
      type: 'product' as const,
      id: product.product_id,
      name: product.product_name,
      subtitle: product.brands?.brand_name ?? product.directory_supplement_name,
      href: `/product/${product.product_id}`,
      rank: scoreFields(trimmed, [
        product.product_name,
        product.brands?.brand_name,
        product.directory_supplement_name,
        product.directory_category,
      ]),
      product,
    }))
    .sort((a, b) => b.rank - a.rank || a.name.localeCompare(b.name))
    .slice(0, limits.productLimit);

  return [...goalResults, ...supplementResults, ...brandResults, ...productResults];
}
