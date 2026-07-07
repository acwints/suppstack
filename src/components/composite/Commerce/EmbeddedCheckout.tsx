'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FiAlertCircle, FiExternalLink, FiLock, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import type { Product } from '@/types';
import { Badge, Button, Inline, Modal, Spinner, Stack } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import { useCommerceCheckout } from '@/hooks';
import { BrandLogo } from '@/components/composite/Brand';
import {
  getPurchaseDestination,
  getShopifyCartPermalink,
  getShopifyVariantNumericId,
} from '@/lib/commerce/shopify-ucp';
import {
  getProductImageSrc,
  isRemoteImageSrc,
  PRODUCT_IMAGE_FALLBACK,
} from '@/lib/catalog/product-image';

export interface EmbeddedCheckoutProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

type CheckoutStage = 'review' | 'opened' | 'blocked';

interface LiveStatus {
  status: 'loading' | 'available' | 'unavailable' | 'unknown';
  price: number | null;
  variantTitle: string | null;
}

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
    `popup=yes,width=${width},height=${height},left=${left},top=${top}`
  );
}

export function EmbeddedCheckout({ product, isOpen, onClose }: EmbeddedCheckoutProps) {
  const [quantity, setQuantity] = useState(1);
  const [stage, setStage] = useState<CheckoutStage>('review');
  const [imageSrc, setImageSrc] = useState(() => getProductImageSrc(product.product_image));
  const [live, setLive] = useState<LiveStatus>({ status: 'loading', price: null, variantTitle: null });
  const { resolveCheckoutSession } = useCommerceCheckout();

  useEffect(() => {
    setImageSrc(getProductImageSrc(product.product_image));
  }, [product.product_image]);

  useEffect(() => {
    if (!isOpen) return;

    setQuantity(1);
    setStage('review');
    setLive({ status: 'loading', price: null, variantTitle: null });

    // Resolve the merchant's live variant state at view time so the panel
    // shows current price and availability rather than the catalog snapshot.
    let cancelled = false;
    fetch('/api/commerce/product-status', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
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
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, product.product_id, product.product_url, product.shopify_variant_gid]);

  const domain = merchantDomain(product);
  const variantId = getShopifyVariantNumericId(product.shopify_variant_gid);
  const hasVerifiedVariant = Boolean(domain && variantId);
  const cartPermalink = getShopifyCartPermalink(product, quantity);
  const destination = getPurchaseDestination(product, quantity);
  const unitPrice = live.price ?? product.product_price;
  const subtotal = unitPrice * quantity;
  const checkoutUrl = cartPermalink ?? destination.url;
  const isUnavailable = live.status === 'unavailable';

  /**
   * The cart permalink is known synchronously, so the checkout window opens
   * inside the click's user-activation window — no await before window.open,
   * which would trip popup blockers. Session logging happens in the
   * background and never gates the checkout.
   */
  const launchCheckout = () => {
    const checkoutWindow = openCheckoutWindow(checkoutUrl);

    if (checkoutWindow) {
      checkoutWindow.focus();
      setStage('opened');
    } else {
      setStage('blocked');
    }

    resolveCheckoutSession(product, quantity).catch(() => undefined);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Checkout"
      description={hasVerifiedVariant ? 'Verified merchant product' : destination.label}
      size="md"
    >
      <Stack gap={6}>
        {/* Order summary */}
        <div className="flex gap-4">
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-50">
            <Image
              src={imageSrc}
              alt={product.product_name}
              fill
              className="object-contain p-2"
              sizes="96px"
              unoptimized={isRemoteImageSrc(imageSrc)}
              onError={() => setImageSrc(PRODUCT_IMAGE_FALLBACK)}
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
          <div className="flex items-center justify-between rounded border border-success-200 bg-success-50 px-4 py-2.5 text-sm">
            <span className="text-success-700">In stock at {domain}</span>
            <span className="font-semibold text-success-700">${formatPrice(unitPrice)} live price</span>
          </div>
        )}
        {isUnavailable && (
          <div className="flex items-start gap-2 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-gray-700">
            <FiAlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
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
              {/* Fail closed while confirming availability; fail open on
                  'unknown' so a merchant hiccup never blocks checkout. */}
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={launchCheckout}
                isLoading={live.status === 'loading'}
                leftIcon={<FiShoppingBag />}
              >
                {live.status === 'loading' ? 'Confirming availability' : 'Complete secure checkout'}
              </Button>
              <p className="text-center text-xs text-gray-500">
                {hasVerifiedVariant
                  ? 'Your cart is prefilled with the verified item. Payment is completed securely on the merchant checkout.'
                  : 'Payment is completed on the merchant store.'}
              </p>
            </Stack>
          </>
        )}

        {isUnavailable && product.product_url && (
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

        {stage === 'opened' && !isUnavailable && (
          <div className="rounded border border-gray-200 bg-gray-50 p-5 text-center">
            <FiLock className="mx-auto mb-3 h-5 w-5 text-gray-500" />
            <p className="font-medium text-gray-900">Secure checkout window opened</p>
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
          <div className="rounded border border-amber-200 bg-amber-50 p-5 text-center">
            <p className="font-medium text-gray-900">Popup was blocked</p>
            <p className="mt-1 text-sm text-gray-600">
              Use the link below to open the secure checkout directly.
            </p>
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded bg-gray-900 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-gray-800"
            >
              Open secure checkout
              <FiExternalLink />
            </a>
          </div>
        )}
      </Stack>
    </Modal>
  );
}

export default EmbeddedCheckout;
