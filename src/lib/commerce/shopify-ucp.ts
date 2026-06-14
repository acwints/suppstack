import type { Product } from '@/types';
import type { PurchaseSessionMode } from './purchase-session';

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

function isShopifySearchUrl(value?: string | null) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.hostname === 'www.shopify.com' && url.pathname.startsWith('/search');
  } catch {
    return false;
  }
}

export function hasDirectShopifyCheckout(product: Product) {
  return Boolean(product.shopify_checkout_url && !isShopifySearchUrl(product.shopify_checkout_url));
}

export function getPreferredPurchaseUrl(product: Product) {
  if (hasDirectShopifyCheckout(product)) return product.shopify_checkout_url as string;
  if (product.shopify_variant_gid && product.shopify_store_domain) {
    return product.product_url || getShopifySearchUrl(product);
  }
  if (product.ucp_enabled || product.commerce_channel === 'shopify') return getShopifySearchUrl(product);
  if (product.product_url) return product.product_url;
  if (product.amazon_url) return product.amazon_url;
  return getShopifySearchUrl(product);
}

export function getPurchaseChannel(product: Product) {
  if (hasDirectShopifyCheckout(product) || product.ucp_enabled || product.commerce_channel === 'shopify') {
    return 'shopify';
  }

  if (product.amazon_url) return 'amazon';
  if (product.product_url) return 'official';
  return 'marketplace';
}

export function getPurchaseDestination(product: Product): {
  url: string;
  label: string;
  channel: 'shopify_ucp' | 'shopify' | 'amazon' | 'official' | 'marketplace';
  mode: PurchaseSessionMode;
  isDirectCheckout: boolean;
} {
  if (hasDirectShopifyCheckout(product)) {
    return {
      url: product.shopify_checkout_url as string,
      label: 'Shop with Shopify',
      channel: 'shopify',
      mode: 'shopify_checkout',
      isDirectCheckout: true,
    };
  }

  if (product.shopify_variant_gid && product.shopify_store_domain) {
    return {
      url: product.product_url || getShopifySearchUrl(product),
      label: 'Start Shopify checkout',
      channel: 'shopify_ucp',
      mode: 'shopify_ucp_candidate',
      isDirectCheckout: false,
    };
  }

  if (product.ucp_enabled || product.commerce_channel === 'shopify') {
    return {
      url: getShopifySearchUrl(product),
      label: 'Find on Shopify',
      channel: 'shopify',
      mode: 'shopify_discovery',
      isDirectCheckout: false,
    };
  }

  if (product.amazon_url) {
    return {
      url: product.amazon_url,
      label: 'Buy on Amazon',
      channel: 'amazon',
      mode: 'amazon',
      isDirectCheckout: false,
    };
  }

  if (product.product_url) {
    return {
      url: product.product_url,
      label: 'Brand Store',
      channel: 'official',
      mode: 'official',
      isDirectCheckout: false,
    };
  }

  return {
    url: getShopifySearchUrl(product),
    label: 'Find Stores',
    channel: 'marketplace',
    mode: 'marketplace',
    isDirectCheckout: false,
  };
}

export function getPurchaseLabel(product: Product) {
  return getPurchaseDestination(product).label;
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
