import {
  hasDirectShopifyCheckout,
  hasOfficialProductUrl,
  hasShopifyVariant,
  isCatalogFallbackProduct,
} from '@/lib/commerce/product-source';
import { getShopifyCartPermalink } from '@/lib/commerce/shopify-ucp';
import { buildCatalogBrandDiscovery } from '@/lib/catalog/brand-discovery';
import { getCuratedCatalogProducts, supplementCatalog } from '@/lib/catalog/supplement-catalog';

export function getCatalogHealthReport() {
  const products = getCuratedCatalogProducts();
  const brands = buildCatalogBrandDiscovery();
  const fallbackSupplements = supplementCatalog.filter(
    (supplement) => products.every((product) => product.supplement_id !== supplement.supplement_id)
  );

  const shopifyVariantProducts = products.filter(hasShopifyVariant);
  const shopifyCartPermalinkProducts = products.filter((product) => Boolean(getShopifyCartPermalink(product)));
  const directCheckoutProducts = products.filter(hasDirectShopifyCheckout);
  const officialUrlProducts = products.filter(hasOfficialProductUrl);
  const fallbackProducts = products.filter(isCatalogFallbackProduct);

  const productsBySupplement = new Map<number, number>();
  products.forEach((product) => {
    productsBySupplement.set(product.supplement_id, (productsBySupplement.get(product.supplement_id) ?? 0) + 1);
  });

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      supplements: supplementCatalog.length,
      curatedProducts: products.length,
      verifiedBrands: brands.length,
      shopifyVariantProducts: shopifyVariantProducts.length,
      shopifyCartPermalinkProducts: shopifyCartPermalinkProducts.length,
      directCheckoutProducts: directCheckoutProducts.length,
      officialUrlProducts: officialUrlProducts.length,
      fallbackProducts: fallbackProducts.length,
      fallbackSupplements: fallbackSupplements.length,
    },
    coverage: {
      curatedProductRate: products.length / supplementCatalog.length,
      shopifyVariantRate: products.length ? shopifyVariantProducts.length / products.length : 0,
      shopifyCartPermalinkRate: products.length ? shopifyCartPermalinkProducts.length / products.length : 0,
      officialUrlRate: products.length ? officialUrlProducts.length / products.length : 0,
      fallbackSupplementRate: fallbackSupplements.length / supplementCatalog.length,
    },
    topBrands: brands.slice(0, 20).map((brand) => ({
      brandName: brand.brandName,
      productCount: brand.productCount,
      commerceReadyCount: brand.commerceReadyCount,
      categories: brand.categories,
      storeDomains: brand.storeDomains,
    })),
    fallbackSupplements: fallbackSupplements.slice(0, 40).map((supplement) => ({
      supplementId: supplement.supplement_id,
      supplementName: supplement.supplement_name,
      category: supplement.category,
    })),
    productsBySupplement: supplementCatalog
      .filter((supplement) => productsBySupplement.has(supplement.supplement_id))
      .map((supplement) => ({
        supplementId: supplement.supplement_id,
        supplementName: supplement.supplement_name,
        category: supplement.category,
        productCount: productsBySupplement.get(supplement.supplement_id) ?? 0,
      })),
  };
}
