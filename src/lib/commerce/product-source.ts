import type { Product } from '@/types';

function isShopifySearchUrl(value?: string | null) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.hostname === 'www.shopify.com' && url.pathname.startsWith('/search');
  } catch {
    return false;
  }
}

export function hasShopifyVariant(product: Product) {
  return Boolean(product.shopify_store_domain && product.shopify_variant_gid);
}

export function hasDirectShopifyCheckout(product: Product) {
  return Boolean(product.shopify_checkout_url && !isShopifySearchUrl(product.shopify_checkout_url));
}

export function isCatalogFallbackProduct(product: Product) {
  return product.data_source === 'catalog_fallback' || String(product.product_id).startsWith('catalog-');
}

/** Curated catalog products live in static code with `real-*` string IDs. */
export function isCuratedCatalogProductId(productId: string | number) {
  return String(productId).startsWith('real-') || String(productId).startsWith('catalog-');
}

export function hasOfficialProductUrl(product: Product) {
  return Boolean(product.product_url && !isShopifySearchUrl(product.product_url));
}

export function hasShopifyDiscoveryPath(product: Product) {
  return Boolean(
    product.ucp_enabled ||
      product.commerce_channel === 'shopify' ||
      product.shopify_store_domain ||
      isShopifySearchUrl(product.product_url)
  );
}

export function hasAnyPurchasePath(product: Product) {
  return Boolean(
    hasDirectShopifyCheckout(product) ||
      hasShopifyVariant(product) ||
      hasOfficialProductUrl(product) ||
      product.amazon_url ||
      hasShopifyDiscoveryPath(product)
  );
}

export function isVerifiedMerchantProduct(product: Product) {
  return !isCatalogFallbackProduct(product) && hasAnyPurchasePath(product);
}

export function getProductSourceRank(product: Product) {
  let score = 0;

  switch (product.inventory_status) {
    case 'out_of_stock':
      score -= 1000;
      break;
    case 'preorder':
      score += 20;
      break;
    case 'low_stock':
      score += 60;
      break;
    case 'in_stock':
    default:
      score += 100;
      break;
  }

  if (hasDirectShopifyCheckout(product)) score += 1000;
  if (hasShopifyVariant(product)) score += 900;
  if (hasOfficialProductUrl(product) && product.shopify_store_domain) score += 760;
  else if (hasOfficialProductUrl(product)) score += 650;
  if (product.amazon_url) score += 500;
  if (hasShopifyDiscoveryPath(product)) score += 300;
  if (product.subscriptions_available) score += 25;
  if (product.quality_badges?.length) score += Math.min(product.quality_badges.length, 4) * 3;
  if (!isCatalogFallbackProduct(product)) score += 120;
  else score -= 120;

  return score;
}

export function compareProductsByCommerceSource(a: Product, b: Product) {
  const rankDelta = getProductSourceRank(b) - getProductSourceRank(a);
  if (rankDelta !== 0) return rankDelta;

  const aServingCost =
    a.servings_per_container > 0 ? a.product_price / a.servings_per_container : a.product_price;
  const bServingCost =
    b.servings_per_container > 0 ? b.product_price / b.servings_per_container : b.product_price;
  const servingDelta = aServingCost - bServingCost;
  if (servingDelta !== 0) return servingDelta;

  return a.product_price - b.product_price;
}

function productDedupKey(product: Product) {
  const brand = product.brands?.brand_name ?? product.brand_id ?? '';
  return `${brand.toLowerCase()}::${product.product_name.toLowerCase()}::${product.product_url}`;
}

export function mergeProductSources(primary: Product[], secondary: Product[] = []) {
  const selectedProducts: Product[] = [];

  [...primary, ...secondary].forEach((product) => {
    const fallbackKey = productDedupKey(product);
    const existingIndex = selectedProducts.findIndex(
      (existing) =>
        String(existing.product_id) === String(product.product_id) ||
        productDedupKey(existing) === fallbackKey
    );

    if (existingIndex === -1) {
      selectedProducts.push(product);
      return;
    }

    if (compareProductsByCommerceSource(product, selectedProducts[existingIndex]) < 0) {
      selectedProducts[existingIndex] = product;
    }
  });

  return selectedProducts.sort(compareProductsByCommerceSource);
}
