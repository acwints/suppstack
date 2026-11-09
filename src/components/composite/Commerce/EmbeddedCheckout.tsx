'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CatalogImage } from '@/components/ui/CatalogImage';
import { FiAlertCircle, FiExternalLink, FiLock, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import type { Product } from '@/types';
import { Badge, Button, Inline, Modal, Spinner, VStack } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { reportCheckoutFunnel } from '@/lib/commerce/report-checkout-funnel';
import { requestPostIntentInvite } from '@/lib/growth/post-intent-invite';
import { isSecureCheckoutUrl, presentMerchantCheckout } from '@/lib/native/checkout';
import { BrandLogo } from '@/components/composite/Brand';
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

type CheckoutStage = 'review' | 'presenting' | 'completed' | 'opened' | 'blocked';

interface LiveStatus {
  status: 'loading' | 'available' | 'unavailable' | 'unknown';
  price: number | null;
  variantTitle: string | null;
}

function merchantDomain(product: Product) {
  const domain = product.shopify_store_domain;
  if (!domain) return null;
  try {
    return new URL(domain.startsWith('http') ? domain : `https://${domain}`).hostname;
  } catch {
    return null;
  }
}

export function EmbeddedCheckout({ product, isOpen, onClose }: EmbeddedCheckoutProps) {
  const [quantity, setQuantity] = useState(1);
  const nativeInFlight = useRef(false);
  const presentationGeneration = useRef(0);
  const [stage, setStage] = useState<CheckoutStage>('review');
  const [live, setLive] = useState<LiveStatus>({ status: 'loading', price: null, variantTitle: null });

  useEffect(() => {
    if (!isOpen) return;

    presentationGeneration.current += 1;
    setQuantity(1);
    setStage('review');
    setLive({ status: 'loading', price: null, variantTitle: null });

    if (!product.shopify_store_domain || !getShopifyVariantNumericId(product.shopify_variant_gid) || !product.product_url) {
      setLive({ status: 'unknown', price: null, variantTitle: null });
      return () => { presentationGeneration.current += 1; };
    }

    // Resolve the merchant's live variant state at view time so the panel
    // shows current price and availability rather than the catalog snapshot.
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    fetch('/api/commerce/product-status', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        productUrl: product.product_url,
        variantGid: product.shopify_variant_gid,
      }),
    })
      .then((response) => (response.ok ? response.json() : { status: 'unknown' }))
      .then((payload) => {
        if (cancelled) return;
        setLive({
          status: payload.status === 'available' || payload.status === 'unavailable' ? payload.status : 'unknown',
          price: typeof payload.price === 'number' ? payload.price : null,
          variantTitle: typeof payload.variantTitle === 'string' ? payload.variantTitle : null,
        });
      })
      .catch(() => {
        if (!cancelled) setLive({ status: 'unknown', price: null, variantTitle: null });
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      controller.abort();
      presentationGeneration.current += 1;
    };
  }, [isOpen, product.product_id, product.product_url, product.shopify_variant_gid, product.shopify_store_domain]);

  const domain = merchantDomain(product);
  const variantId = getShopifyVariantNumericId(product.shopify_variant_gid);
  const hasVerifiedVariant = Boolean(domain && variantId);
  const cartPermalink = getShopifyCartPermalink(product, quantity);
  const destination = getPurchaseDestination(product, quantity);
  const unitPrice = live.price ?? product.product_price;
  const subtotal = unitPrice * quantity;
  const checkoutUrl = cartPermalink ?? destination.url;
  const secureCheckout = isSecureCheckoutUrl(checkoutUrl);
  const shopifyCheckout = Boolean(cartPermalink) || destination.mode === 'shopify_checkout';
  const isUnavailable = live.status === 'unavailable' || product.inventory_status === 'out_of_stock';

  const launchCheckout = () => {
    if (!secureCheckout || isUnavailable || live.status === 'loading' || nativeInFlight.current) return;
    nativeInFlight.current = true;
    setStage('presenting');
    const generation = presentationGeneration.current;
    const attemptId = crypto.randomUUID();
    void presentMerchantCheckout(checkoutUrl, shopifyCheckout)
      .then((status) => {
        reportCheckoutFunnel({
          outcome: status,
          attemptId,
          productId: String(product.product_id),
          surface: 'product',
          nativeKit: shopifyCheckout,
        });
        if (generation !== presentationGeneration.current) return;
        if (status === 'completed') requestPostIntentInvite();
        setStage(status === 'failed' ? 'blocked' : status === 'dismissed' ? 'review' : status);
      })
      .catch(() => {
        if (generation === presentationGeneration.current) setStage('blocked');
      })
      .finally(() => { nativeInFlight.current = false; });
  };

  if (!isOpen || typeof document === 'undefined') return null;
  return createPortal(
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Checkout"
      description={hasVerifiedVariant ? 'Verified merchant product' : destination.label}
      size="md"
      showCloseButton={stage !== 'presenting'}
      closeOnEscape={stage !== 'presenting'}
      closeOnOverlayClick={stage !== 'presenting'}
    >
      <VStack gap={6}>
        {/* Order summary */}
        <div className="flex gap-4">
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-50">
            <CatalogImage
              src={product.product_image}
              alt={product.product_name}
              fill
              className="object-contain p-2"
              sizes="96px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-500">
              {product.brands?.brand_name || 'Verified merchant'}
            </p>
            <h3 className="font-serif text-lg text-gray-900 line-clamp-2">
              {product.product_name}
            </h3>
            <Inline gap={2} className="mt-2" wrap>
              {hasVerifiedVariant && <Badge variant="success">Verified</Badge>}
              {live.variantTitle && (
                <span className="rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-600">
                  {live.variantTitle}
                </span>
              )}
              {domain && (
                <span className="inline-flex items-center gap-1.5 rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-600">
                  <BrandLogo
                    domain={domain}
                    brandName={product.brands?.brand_name || domain}
                    size="sm"
                  />
                  {domain.replace(/^www\./, '')}
                </span>
              )}
            </Inline>
          </div>
        </div>

        {/* Live merchant status */}
        {live.status === 'loading' && (
          <div className="flex items-center gap-2 rounded border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-600">
            <Spinner size="sm" />
            Confirming live availability with {domain ?? 'the merchant'}...
          </div>
        )}
        {live.status === 'available' && (
          <div className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm">
            <span className="text-gray-700">In stock at {domain}</span>
            <span className="font-semibold text-gray-900">{formatCurrency(unitPrice)} live price</span>
          </div>
        )}
        {isUnavailable && (
          <div className="flex items-start gap-2 rounded border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-900">
            <FiAlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning-600" />
            <span>
              This variant is currently unavailable at the merchant. You can still visit the
              product page to pick another size or flavor.
            </span>
          </div>
        )}

        {stage === 'review' && !isUnavailable && (
          <>
            {/* Quantity + totals */}
            <div className="rounded border border-gray-200">
              {hasVerifiedVariant && <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <span className="text-sm text-gray-600">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    disabled={quantity <= 1}
                    className="flex h-11 w-11 items-center justify-center rounded border border-gray-200 text-gray-600 transition-colors duration-150 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-40"
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
                    className="flex h-11 w-11 items-center justify-center rounded border border-gray-200 text-gray-600 transition-colors duration-150 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <FiPlus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>}
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>

            <VStack gap={3}>
              {/* Fail closed while confirming availability; fail open on
                  'unknown' so a merchant hiccup never blocks checkout. */}
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={launchCheckout}
                isLoading={live.status === 'loading'}
                disabled={!secureCheckout}
                leftIcon={<FiShoppingBag />}
              >
                {live.status === 'loading' ? 'Confirming availability' : 'Complete secure checkout'}
              </Button>
              <p className="text-center text-xs text-gray-500">
                {!secureCheckout ? 'A secure merchant link is currently unavailable.' : hasVerifiedVariant
                  ? 'Your cart is prefilled with the verified item. Payment is completed securely on the merchant checkout.'
                  : 'Payment is completed on the merchant store.'}
              </p>
            </VStack>
          </>
        )}

        {isUnavailable && isSecureCheckoutUrl(product.product_url) && (
          <a
            href={product.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-gray-900 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-gray-800"
          >
            View on {domain ?? 'merchant store'}
            <FiExternalLink />
          </a>
        )}

        {stage === 'presenting' && (
          <p role="status" className="text-center text-sm text-gray-600">
            Checkout is open. Finish or close it to return here.
          </p>
        )}

        {stage === 'completed' && (
          <div className="text-center">
            <p role="status" className="font-medium text-gray-900">Checkout completed</p>
            <p className="mt-2 text-sm text-gray-600">Check your merchant receipt for order details.</p>
            <Button variant="primary" onClick={onClose} className="mt-4">Done</Button>
          </div>
        )}

        {stage === 'opened' && !isUnavailable && (
          <div className="rounded border border-gray-200 bg-gray-50 p-5 text-center">
            <FiLock className="mx-auto mb-3 h-5 w-5 text-gray-500" />
            <p className="font-medium text-gray-900">Merchant checkout opened</p>
            <p className="mt-1 text-sm text-gray-600">
              Finish your payment in the secure checkout window
              {domain ? ` on ${domain}` : ''}. You can keep browsing here.
            </p>
            <Inline gap={3} justify="center" className="mt-4">
              <Button variant="outline" onClick={launchCheckout}>
                Reopen checkout
              </Button>
              <Button variant="primary" onClick={onClose}>
                Done
              </Button>
            </Inline>
          </div>
        )}

        {stage === 'blocked' && !isUnavailable && (
          <div className="rounded border border-warning-200 bg-warning-50 p-5 text-center">
            <p className="font-medium text-gray-900">Checkout could not open</p>
            <p className="mt-1 text-sm text-gray-600">
              Try again or open the merchant checkout directly.
            </p>
            <Button variant="outline" onClick={launchCheckout} className="mt-4">
              Try again
            </Button>
            {secureCheckout && <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded bg-gray-900 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-gray-800"
            >
              Open secure checkout
              <FiExternalLink />
            </a>}
          </div>
        )}
      </VStack>
    </Modal>, document.body
  );
}
