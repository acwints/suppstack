'use client';

import type { Product } from '@/types';
import { Badge, type BadgeVariant } from '@/components/ui';
import { getPurchaseDestination } from '@/lib/commerce/shopify-ucp';
import { hasShopifyVariant } from '@/lib/commerce/product-source';

export interface ProductSourceBadgeProps {
  product: Product;
  compact?: boolean;
}

function sourceLabel(product: Product): { label: string; variant: BadgeVariant } {
  if (product.inventory_status === 'out_of_stock') {
    return { label: 'Out of stock', variant: 'error' };
  }

  const destination = getPurchaseDestination(product);
  if (destination.isDirectCheckout || hasShopifyVariant(product)) {
    return { label: 'Direct checkout', variant: 'success' };
  }

  if (destination.channel === 'official' || product.commerce_channel === 'official') {
    return { label: 'Official store', variant: 'info' };
  }

  if (product.shopify_store_domain) {
    return { label: 'Verified merchant', variant: 'secondary' };
  }

  return { label: 'Marketplace', variant: 'secondary' };
}

export function ProductSourceBadge({ product, compact = false }: ProductSourceBadgeProps) {
  const source = sourceLabel(product);

  return (
    <Badge variant={source.variant} size="sm" className={compact ? 'max-w-full truncate' : undefined}>
      {source.label}
    </Badge>
  );
}

export default ProductSourceBadge;
