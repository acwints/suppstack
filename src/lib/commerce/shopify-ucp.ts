import type { Product } from '@/types';

export type PurchaseSessionMode =
  | 'shopify_checkout'
  | 'shopify_ucp_candidate'
  | 'shopify_cart_permalink'
  | 'shopify_discovery'
  | 'amazon'
  | 'official'
  | 'marketplace'
  | 'unavailable';

function getShopifySearchUrl(product: Product) {
  const supplementName = product.supplements?.supplement_name ?? '';
  const query = [supplementName, product.product_name, product.brands?.brand_name]
    .filter(Boolean)
    .join(' ');

  return `https://www.shopify.com/search?q=${encodeURIComponent(query)}`;
}

export function normalizeShopifyStoreOrigin(storeDomain?: string | null) {
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

export interface ShopifyCartGroup {
  storeDomain: string;
  brandNames: string[];
  products: Product[];
  url: string;
}

export function buildShopifyCartGroups(products: Product[]): ShopifyCartGroup[] {
  const groups = new Map<string, { brandNames: Set<string>; products: Product[]; lines: string[] }>();

  products.forEach((product) => {
    const origin = normalizeShopifyStoreOrigin(product.shopify_store_domain);
    const variantId = getShopifyVariantNumericId(product.shopify_variant_gid);
    if (!origin || !variantId || product.inventory_status === 'out_of_stock') return;

    const group = groups.get(origin) ?? {
      brandNames: new Set<string>(),
      products: [],
      lines: [],
    };
    // One container per product; servings_per_day is a dosage figure, not a
    // purchase quantity.
    group.products.push(product);
    group.lines.push(`${variantId}:1`);
    if (product.brands?.brand_name) {
      group.brandNames.add(product.brands.brand_name);
    }
    groups.set(origin, group);
  });

  return Array.from(groups.entries()).map(([origin, group]) => {
    const url = new URL(`/cart/${group.lines.join(',')}`, origin);
    url.searchParams.set('utm_source', 'suppstack');
    url.searchParams.set('utm_medium', 'stack_cart');
    url.searchParams.set('utm_campaign', 'buy_stack');

    return {
      storeDomain: new URL(origin).hostname,
      brandNames: Array.from(group.brandNames),
      products: group.products,
      url: url.toString(),
    };
  });
}

export function isShopifySearchUrl(value?: string | null) {
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
  if (product.product_url && !isShopifySearchUrl(product.product_url)) return product.product_url;
  if (product.amazon_url) return product.amazon_url;
  if (product.product_url) return product.product_url;
  return getShopifySearchUrl(product);
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
      label: 'Buy Now',
      channel: 'shopify',
      mode: 'shopify_checkout',
      isDirectCheckout: true,
    };
  }

  const cartPermalink = getShopifyCartPermalink(product, quantity);
  if (cartPermalink) {
    return {
      url: cartPermalink,
      label: 'Buy Now',
      channel: 'shopify',
      mode: 'shopify_cart_permalink',
      isDirectCheckout: true,
    };
  }

  if (product.product_url && !isShopifySearchUrl(product.product_url)) {
    return {
      url: product.product_url,
      label: 'Brand Store',
      channel: 'official',
      mode: 'official',
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

  if (product.ucp_enabled || product.commerce_channel === 'shopify' || isShopifySearchUrl(product.product_url)) {
    return {
      url: product.product_url || getShopifySearchUrl(product),
      label: 'Find Retailers',
      channel: 'shopify',
      mode: 'shopify_discovery',
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

export function canPurchase(product: Product) {
  return product.inventory_status !== 'out_of_stock';
}
