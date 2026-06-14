import type { Product } from '@/types';
import { canPurchase, getPurchaseDestination } from './shopify-ucp';

export type PurchaseSessionMode =
  | 'shopify_checkout'
  | 'shopify_ucp_candidate'
  | 'shopify_discovery'
  | 'amazon'
  | 'official'
  | 'marketplace'
  | 'unavailable';

export interface PurchaseSession {
  mode: PurchaseSessionMode;
  provider: 'shopify_ucp' | 'shopify' | 'amazon' | 'official' | 'marketplace';
  label: string;
  status: 'ready' | 'fallback' | 'unavailable';
  purchaseUrl: string;
  fallbackUrl?: string;
  merchantUrl?: string;
  checkoutId?: string;
  cartId?: string;
  capabilityStatus?: {
    discovery: 'not_required' | 'candidate' | 'supported' | 'unavailable' | 'failed';
    cart: 'not_required' | 'candidate' | 'supported' | 'unavailable' | 'failed';
    checkout: 'not_required' | 'candidate' | 'supported' | 'fallback' | 'failed';
  };
  messages?: string[];
}

export function createFallbackPurchaseSession(product: Product): PurchaseSession {
  const destination = getPurchaseDestination(product);

  if (!canPurchase(product)) {
    return {
      mode: 'unavailable',
      provider: destination.channel,
      label: 'Out of stock',
      status: 'unavailable',
      purchaseUrl: destination.url,
      fallbackUrl: destination.url,
      capabilityStatus: {
        discovery: 'not_required',
        cart: 'not_required',
        checkout: 'not_required',
      },
      messages: ['This product is currently out of stock.'],
    };
  }

  return {
    mode: destination.mode,
    provider: destination.channel,
    label: destination.label,
    status: destination.isDirectCheckout ? 'ready' : 'fallback',
    purchaseUrl: destination.url,
    fallbackUrl: destination.url,
    merchantUrl: product.product_url || destination.url,
    capabilityStatus: {
      discovery: destination.mode === 'shopify_ucp_candidate' ? 'candidate' : 'not_required',
      cart: destination.mode === 'shopify_ucp_candidate' ? 'candidate' : 'not_required',
      checkout: destination.isDirectCheckout ? 'supported' : 'fallback',
    },
  };
}

export function productPurchasePayload(product: Product) {
  return {
    product_id: product.product_id,
    product_name: product.product_name,
    product_price: product.product_price,
    product_url: product.product_url,
    amazon_url: product.amazon_url,
    shopify_checkout_url: product.shopify_checkout_url,
    shopify_store_domain: product.shopify_store_domain,
    shopify_product_gid: product.shopify_product_gid,
    shopify_variant_gid: product.shopify_variant_gid,
    commerce_channel: product.commerce_channel,
    ucp_enabled: product.ucp_enabled,
    inventory_status: product.inventory_status,
    data_source: product.data_source,
    brand_id: product.brand_id,
    supplement_id: product.supplement_id,
    brands: product.brands,
    supplements: product.supplements,
  };
}
