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

  /**
   * Resolves a purchase session from the commerce API without opening any
   * window. Used by the embedded checkout panel, which controls its own
   * checkout window lifecycle.
   */
  const resolveCheckoutSession = async (
    product: Product,
    quantity = 1
  ): Promise<PurchaseSession> => {
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
      if (!session?.purchaseUrl) {
        throw new Error('Purchase session did not include a checkout URL.');
      }

      return session;
    } catch (error) {
      return createFallbackPurchaseSession(product, quantity);
    } finally {
      setIsStartingCheckout(false);
    }
  };

  const startCheckout = async (product: Product, quantity = 1): Promise<PurchaseSession> => {
    const session = await resolveCheckoutSession(product, quantity);
    if (session.purchaseUrl) {
      const opened = window.open(session.purchaseUrl, '_blank', 'noopener,noreferrer');
      // The await above can expire the user-activation window and get the
      // popup blocked; fall back to same-tab navigation so the click never
      // silently does nothing.
      if (!opened) {
        window.location.assign(session.purchaseUrl);
      }
    }
    return session;
  };

  return {
    isStartingCheckout,
    startCheckout,
    resolveCheckoutSession,
  };
}
