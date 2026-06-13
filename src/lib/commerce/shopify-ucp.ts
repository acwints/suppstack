import type { Product } from '@/types';

export const SHOPIFY_UCP_PROFILE = {
  protocol: 'ucp',
  version: '2026-01',
  capabilities: ['catalog', 'cart', 'checkout', 'orders'],
  agentName: 'SuppStack',
};

export function getShopifyDiscoveryUrl(product: Product) {
  if (!product.shopify_store_domain) return null;

  try {
    const origin = product.shopify_store_domain.startsWith('http')
      ? product.shopify_store_domain
      : `https://${product.shopify_store_domain}`;
    return new URL('/.well-known/ucp', origin).toString();
  } catch {
    return null;
  }
}

export function getShopifySearchUrl(product: Product) {
  const supplementName = product.supplements?.supplement_name ?? '';
  const query = [supplementName, product.product_name, product.brands?.brand_name]
    .filter(Boolean)
    .join(' ');

  return `https://www.shopify.com/search?q=${encodeURIComponent(query)}`;
}

export function getPreferredPurchaseUrl(product: Product) {
  if (product.shopify_checkout_url) return product.shopify_checkout_url;
  if (product.ucp_enabled) return getShopifySearchUrl(product);
  if (product.product_url) return product.product_url;
  if (product.amazon_url) return product.amazon_url;
  return getShopifySearchUrl(product);
}

export function getPurchaseChannel(product: Product) {
  if (product.shopify_checkout_url || product.ucp_enabled || product.commerce_channel === 'shopify') {
    return 'shopify';
  }

  if (product.amazon_url) return 'amazon';
  if (product.product_url) return 'official';
  return 'marketplace';
}

export function getPurchaseLabel(product: Product) {
  const channel = getPurchaseChannel(product);

  if (channel === 'shopify') return 'Shop with Shopify';
  if (channel === 'amazon') return 'Buy on Amazon';
  if (channel === 'official') return 'Official Store';
  return 'Find Stores';
}

export function getInventoryLabel(product: Product) {
  switch (product.inventory_status) {
    case 'low_stock':
      return 'Low stock';
    case 'out_of_stock':
      return 'Out of stock';
    case 'preorder':
      return 'Preorder';
    case 'in_stock':
    default:
      return 'In stock';
  }
}

export function canPurchase(product: Product) {
  return product.inventory_status !== 'out_of_stock';
}
