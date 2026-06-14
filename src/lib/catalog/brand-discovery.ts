import type { Product, Supplement } from '@/types';
import { createCatalogProductsForSupplement } from './supplement-catalog';

export interface BrandDiscoveryItem {
  brandName: string;
  productCount: number;
  averagePrice: number;
  categories: string[];
  heroProduct: Product;
  products: Product[];
}

export function buildBrandDiscovery(supplements: Supplement[]): BrandDiscoveryItem[] {
  const brandMap = new Map<string, BrandDiscoveryItem>();

  supplements.forEach((supplement) => {
    createCatalogProductsForSupplement(supplement).forEach((product) => {
      const brandName = product.brands?.brand_name || 'SuppStack Verified';
      const existing = brandMap.get(brandName);

      if (existing) {
        existing.products.push(product);
        existing.productCount += 1;
        existing.averagePrice =
          existing.products.reduce((sum, item) => sum + item.product_price, 0) /
          existing.products.length;
        if (supplement.category && !existing.categories.includes(supplement.category)) {
          existing.categories.push(supplement.category);
        }
        return;
      }

      brandMap.set(brandName, {
        brandName,
        productCount: 1,
        averagePrice: product.product_price,
        categories: supplement.category ? [supplement.category] : [],
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
