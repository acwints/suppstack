'use client';

import { useState } from 'react';
import type { Product } from '@/types';
import {
  createFallbackPurchaseSession,
  productPurchasePayload,
  type PurchaseSession,
} from '@/lib/commerce/purchase-session';

export function useCommerceCheckout() {
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);

  const startCheckout = async (product: Product, quantity = 1): Promise<PurchaseSession> => {
    setIsStartingCheckout(true);

    try {
      const response = await fetch('/api/commerce/checkout', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          product: productPurchasePayload(product),
          quantity,
        }),
      });

      if (!response.ok) {
        throw new Error('Unable to start checkout.');
      }

      const payload = await response.json();
      const session = payload.session as PurchaseSession;
      if (session?.purchaseUrl) {
        window.open(session.purchaseUrl, '_blank', 'noopener,noreferrer');
      }

      return session;
    } catch (error) {
      const fallback = createFallbackPurchaseSession(product);
      window.open(fallback.purchaseUrl, '_blank', 'noopener,noreferrer');
      return fallback;
    } finally {
      setIsStartingCheckout(false);
    }
  };

  return {
    isStartingCheckout,
    startCheckout,
  };
}
