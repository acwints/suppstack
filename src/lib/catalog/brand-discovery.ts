import type { Product, Supplement } from '@/types';
import {
  createCatalogProductsForSupplement,
  getCanonicalSupplementCategory,
  supplementCatalog,
} from './supplement-catalog';
import {
  compareProductsByCommerceSource,
  hasAnyPurchasePath,
  isCatalogFallbackProduct,
  isVerifiedMerchantProduct,
} from '@/lib/commerce/product-source';

export interface BrandDiscoveryItem {
  brandName: string;
  productCount: number;
  commerceReadyCount: number;
  averagePrice: number;
  categories: string[];
  storeDomains: string[];
  heroProduct: Product;
  products: Product[];
}

export interface BrandDiscoveryOptions {
  includeCatalogFallback?: boolean;
}

const BRAND_SLUG_ALIASES: Record<string, string> = {
  omni: 'brainmd',
};

export function brandSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function isCommerceReady(product: Product) {
  return hasAnyPurchasePath(product);
}

function preferredHeroProduct(current: Product, candidate: Product) {
  return compareProductsByCommerceSource(candidate, current) < 0 ? candidate : current;
}

export function buildBrandDiscovery(
  supplements: Supplement[],
  { includeCatalogFallback = false }: BrandDiscoveryOptions = {}
): BrandDiscoveryItem[] {
  const brandMap = new Map<string, BrandDiscoveryItem>();

  supplements.forEach((supplement) => {
    createCatalogProductsForSupplement(supplement).forEach((product) => {
      if (!includeCatalogFallback && isCatalogFallbackProduct(product)) return;

      const brandName = product.brands?.brand_name || 'SuppStack Verified';
      const category =
        getCanonicalSupplementCategory(product.supplements?.supplement_name) ??
        getCanonicalSupplementCategory(supplement.supplement_name) ??
        supplement.category;
      const existing = brandMap.get(brandName);

      if (existing) {
        existing.products.push(product);
        existing.productCount += 1;
        if (isCommerceReady(product)) {
          existing.commerceReadyCount += 1;
        }
        existing.averagePrice =
          existing.products.reduce((sum, item) => sum + item.product_price, 0) /
          existing.products.length;
        if (category && !existing.categories.includes(category)) {
          existing.categories.push(category);
        }
        if (product.shopify_store_domain && !existing.storeDomains.includes(product.shopify_store_domain)) {
          existing.storeDomains.push(product.shopify_store_domain);
        }
        existing.heroProduct = preferredHeroProduct(existing.heroProduct, product);
        return;
      }

      brandMap.set(brandName, {
        brandName,
        productCount: 1,
        commerceReadyCount: isCommerceReady(product) ? 1 : 0,
        averagePrice: product.product_price,
        categories: category ? [category] : [],
        storeDomains: product.shopify_store_domain ? [product.shopify_store_domain] : [],
        heroProduct: product,
        products: [product],
      });
    });
  });

  return Array.from(brandMap.values()).sort((a, b) => {
    const aCurated = a.products.some(isVerifiedMerchantProduct);
    const bCurated = b.products.some(isVerifiedMerchantProduct);
    if (aCurated !== bCurated) return bCurated ? 1 : -1;
    if (b.productCount !== a.productCount) return b.productCount - a.productCount;
    return a.brandName.localeCompare(b.brandName);
  });
}

export function buildCatalogBrandDiscovery(options?: BrandDiscoveryOptions) {
  return buildBrandDiscovery(supplementCatalog, options);
}

export function findCatalogBrandBySlug(slug: string) {
  const resolvedSlug = BRAND_SLUG_ALIASES[slug] ?? slug;

  return (
    buildCatalogBrandDiscovery({ includeCatalogFallback: true }).find(
      (brand) => brandSlug(brand.brandName) === resolvedSlug
    ) ??
    null
  );
}
