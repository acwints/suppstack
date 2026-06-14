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

function normalizeShopifyStoreOrigin(storeDomain?: string | null) {
  if (!storeDomain) return null;

  try {
    const origin = storeDomain.startsWith('http') ? storeDomain : `https://${storeDomain}`;
    const url = new URL(origin);
    return `https://${url.hostname.toLowerCase()}`;
  } catch {
    return null;
  }
}

export function getShopifyVariantNumericId(value?: string | null) {
  if (!value) return null;
  const normalized = value.split('?')[0];
  const match = normalized.match(/(\d+)$/);
  return match?.[1] ?? null;
}

export function getShopifyCartPermalink(product: Product, quantity = 1) {
  const origin = normalizeShopifyStoreOrigin(product.shopify_store_domain);
  const variantId = getShopifyVariantNumericId(product.shopify_variant_gid);
  if (!origin || !variantId) return null;

  const url = new URL(`/cart/${variantId}:${Math.max(1, Math.floor(quantity))}`, origin);
  url.searchParams.set('utm_source', 'suppstack');
  url.searchParams.set('utm_medium', 'commerce_agent');
  url.searchParams.set('utm_campaign', 'stack_shop');
  return url.toString();
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

export function getPreferredPurchaseUrl(product: Product, quantity = 1) {
  if (hasDirectShopifyCheckout(product)) return product.shopify_checkout_url as string;
  const cartPermalink = getShopifyCartPermalink(product, quantity);
  if (cartPermalink) return cartPermalink;
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

export function getPurchaseDestination(
  product: Product,
  quantity = 1
): {
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

  const cartPermalink = getShopifyCartPermalink(product, quantity);
  if (cartPermalink) {
    return {
      url: cartPermalink,
      label: 'Add to Shopify cart',
      channel: 'shopify',
      mode: 'shopify_cart_permalink',
      isDirectCheckout: true,
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
