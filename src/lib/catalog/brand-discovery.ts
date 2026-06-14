import type { Product, Supplement } from '@/types';
import {
  createCatalogProductsForSupplement,
  getCanonicalSupplementCategory,
} from './supplement-catalog';

export interface BrandDiscoveryItem {
  brandName: string;
  productCount: number;
  averagePrice: number;
  categories: string[];
  heroProduct: Product;
  products: Product[];
}

interface BrandDiscoveryOptions {
  includeCatalogFallback?: boolean;
}

export function buildBrandDiscovery(
  supplements: Supplement[],
  { includeCatalogFallback = false }: BrandDiscoveryOptions = {}
): BrandDiscoveryItem[] {
  const brandMap = new Map<string, BrandDiscoveryItem>();

  supplements.forEach((supplement) => {
    createCatalogProductsForSupplement(supplement).forEach((product) => {
      if (!includeCatalogFallback && product.data_source === 'catalog_fallback') return;

      const brandName = product.brands?.brand_name || 'SuppStack Verified';
      const category =
        getCanonicalSupplementCategory(product.supplements?.supplement_name) ??
        getCanonicalSupplementCategory(supplement.supplement_name) ??
        supplement.category;
      const existing = brandMap.get(brandName);

      if (existing) {
        existing.products.push(product);
        existing.productCount += 1;
        existing.averagePrice =
          existing.products.reduce((sum, item) => sum + item.product_price, 0) /
          existing.products.length;
        if (category && !existing.categories.includes(category)) {
          existing.categories.push(category);
        }
        return;
      }

      brandMap.set(brandName, {
        brandName,
        productCount: 1,
        averagePrice: product.product_price,
        categories: category ? [category] : [],
        heroProduct: product,
        products: [product],
      });
    });
  });

  return Array.from(brandMap.values()).sort((a, b) => {
    const aCurated = a.products.some((product) => product.data_source !== 'catalog_fallback');
    const bCurated = b.products.some((product) => product.data_source !== 'catalog_fallback');
    if (aCurated !== bCurated) return bCurated ? 1 : -1;
    if (b.productCount !== a.productCount) return b.productCount - a.productCount;
    return a.brandName.localeCompare(b.brandName);
  });
}
