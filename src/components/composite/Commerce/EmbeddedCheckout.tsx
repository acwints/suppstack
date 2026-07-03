'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FiExternalLink, FiLock, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import type { Product } from '@/types';
import { Badge, Button, Inline, Modal, Stack } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import { useCommerceCheckout } from '@/hooks';
import type { PurchaseSession } from '@/lib/commerce/purchase-session';
import {
  getPurchaseDestination,
  getShopifyCartPermalink,
  getShopifyVariantNumericId,
} from '@/lib/commerce/shopify-ucp';

export interface EmbeddedCheckoutProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

type CheckoutStage = 'review' | 'opened' | 'blocked';

const CHECKOUT_WINDOW_NAME = 'suppstack_shopify_checkout';

function merchantDomain(product: Product) {
  const domain = product.shopify_store_domain;
  if (!domain) return null;
  try {
    return new URL(domain.startsWith('http') ? domain : `https://${domain}`).hostname;
  } catch {
    return null;
  }
}

/**
 * Shopify merchant checkouts set `frame-ancestors 'none'`, so they cannot be
 * rendered inside an iframe. The closest embedded experience is a dedicated
 * checkout window sized like a payment sheet, driven from this in-app panel.
 */
function openCheckoutWindow(url: string) {
  const width = 480;
  const height = 800;
  const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
  const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);

  return window.open(
    url,
    CHECKOUT_WINDOW_NAME,
    `popup=yes,noopener=no,width=${width},height=${height},left=${left},top=${top}`
  );
}

export function EmbeddedCheckout({ product, isOpen, onClose }: EmbeddedCheckoutProps) {
  const [quantity, setQuantity] = useState(1);
  const [stage, setStage] = useState<CheckoutStage>('review');
  const [session, setSession] = useState<PurchaseSession | null>(null);
  const { isStartingCheckout, resolveCheckoutSession } = useCommerceCheckout();

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setStage('review');
      setSession(null);
    }
  }, [isOpen, product.product_id]);

  const domain = merchantDomain(product);
  const variantId = getShopifyVariantNumericId(product.shopify_variant_gid);
  const hasVerifiedVariant = Boolean(domain && variantId);
  const cartPermalink = getShopifyCartPermalink(product, quantity);
  const destination = getPurchaseDestination(product, quantity);
  const subtotal = product.product_price * quantity;

  const launchCheckout = async () => {
    const resolved = session ?? (await resolveCheckoutSession(product, quantity));
    setSession(resolved);

    const url = cartPermalink ?? resolved.purchaseUrl;
    const checkoutWindow = openCheckoutWindow(url);

    if (checkoutWindow) {
      checkoutWindow.focus();
      setStage('opened');
    } else {
      setStage('blocked');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Checkout"
      description={hasVerifiedVariant ? 'Verified Shopify catalog product' : destination.label}
      size="md"
    >
      <Stack gap={6}>
        {/* Order summary */}
        <div className="flex gap-4">
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-50">
            {product.product_image ? (
              <Image
                src={product.product_image}
                alt={product.product_name}
                fill
                className="object-contain p-2"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xl font-semibold text-gray-900">
                {product.product_name.charAt(0)}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-500">
              {product.brands?.brand_name || 'Verified merchant'}
            </p>
            <h3 className="font-serif text-lg text-gray-900 line-clamp-2">
              {product.product_name}
            </h3>
            <Inline gap={2} className="mt-2" wrap>
              {hasVerifiedVariant && <Badge variant="success">Shopify UCP</Badge>}
              {domain && (
                <span className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-600">
                  <FiLock className="h-3 w-3" />
                  {domain}
                </span>
              )}
            </Inline>
          </div>
        </div>

        {stage === 'review' && (
          <>
            {/* Quantity + totals */}
            <div className="rounded border border-gray-200">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <span className="text-sm text-gray-600">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    disabled={quantity <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-600 transition-colors duration-150 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <FiMinus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold text-gray-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.min(10, value + 1))}
                    disabled={quantity >= 10}
                    className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-600 transition-colors duration-150 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <FiPlus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm font-semibold text-gray-900">
                  ${formatPrice(subtotal)}
                </span>
              </div>
            </div>

            <Stack gap={3}>
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={launchCheckout}
                isLoading={isStartingCheckout}
                leftIcon={<FiShoppingBag />}
              >
                Complete secure Shopify checkout
              </Button>
              <p className="text-center text-xs text-gray-500">
                {hasVerifiedVariant
                  ? 'Your cart is prefilled with the verified variant. Payment is completed on the merchant Shopify checkout.'
                  : 'Payment is completed on the merchant store.'}
              </p>
            </Stack>
          </>
        )}

        {stage === 'opened' && (
          <div className="rounded border border-gray-200 bg-gray-50 p-5 text-center">
            <FiLock className="mx-auto mb-3 h-5 w-5 text-gray-500" />
            <p className="font-medium text-gray-900">Secure checkout window opened</p>
            <p className="mt-1 text-sm text-gray-600">
              Finish your payment in the Shopify checkout window
              {domain ? ` on ${domain}` : ''}. You can keep browsing here.
            </p>
            <Inline gap={3} justify="center" className="mt-4">
              <Button variant="outline" onClick={launchCheckout} isLoading={isStartingCheckout}>
                Reopen checkout
              </Button>
              <Button variant="primary" onClick={onClose}>
                Done
              </Button>
            </Inline>
          </div>
        )}

        {stage === 'blocked' && (
          <div className="rounded border border-amber-200 bg-amber-50 p-5 text-center">
            <p className="font-medium text-gray-900">Popup was blocked</p>
            <p className="mt-1 text-sm text-gray-600">
              Use the link below to open the Shopify checkout directly.
            </p>
            <a
              href={cartPermalink ?? session?.purchaseUrl ?? destination.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded bg-gray-900 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-gray-800"
            >
              Open Shopify checkout
              <FiExternalLink />
            </a>
          </div>
        )}
      </Stack>
    </Modal>
  );
}

export default EmbeddedCheckout;
