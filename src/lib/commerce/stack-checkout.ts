import type { Product } from '@/types';
import { buildShopifyCartGroups, getPreferredPurchaseUrl, getPurchaseDestination, isShopifySearchUrl } from './shopify-ucp';

export interface MerchantCheckout {
  id: string;
  name: string;
  products: Product[];
  url: string;
  nativeCheckout: boolean;
}

export type MerchantOutcome = 'completed' | 'dismissed' | 'failed' | 'opened';

export function buildStackCheckout(products: Product[]): MerchantCheckout[] {
  const available = [...new Map(products
    .filter(product => product.inventory_status !== 'out_of_stock')
    .map(product => [String(product.product_id), product])).values()];
  const groups = buildShopifyCartGroups(available);
  const grouped = new Set(groups.flatMap(group => group.products.map(product => String(product.product_id))));
  const checkouts: MerchantCheckout[] = groups.map(group => ({
    id: group.url,
    name: group.brandNames.join(', ') || group.storeDomain,
    products: group.products,
    url: group.url,
    nativeCheckout: true,
  }));
  for (const product of available) {
    if (grouped.has(String(product.product_id))) continue;
    const url = getPreferredPurchaseUrl(product);
    if (isShopifySearchUrl(url)) continue;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:' || parsed.username || parsed.password) continue;
      const existing = checkouts.find(checkout => checkout.id === url);
      if (existing) {
        existing.products.push(product);
        continue;
      }
      checkouts.push({
        id: url,
        name: product.brands?.brand_name || parsed.hostname,
        products: [product],
        url,
        nativeCheckout: getPurchaseDestination(product).mode === 'shopify_checkout',
      });
    } catch {
      // A missing or invalid destination cannot become a checkout action.
    }
  }
  return checkouts;
}
