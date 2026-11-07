# ADR 0001 — Physical-product checkout recovery

Date November 7, 2026. Status accepted for the recovery milestone.

## Context

Commit f5b72fc on November 1 hid merchant purchase actions in the native shell through useAllowsExternalPurchase. Product detail, sticky Buy, and Buy This Stack inherited that gate. Merchant checkout helpers remained in the repository.

SuppStack’s EmbeddedCheckout presents a review panel, then a popup on web or Capacitor Browser on iOS. The merchant URL is normally a variant cart permalink. The resolver returns early for that path. A UCP adapter in the code does not establish a working managed-payment flow.

Bantee has several commerce routes. Its shopify_embedded_checkout_mobile.dart implements a Flutter WebView sheet. Its checkout_launcher.dart can also open merchant permalinks. Its universal_checkout_repo.dart calls Bantee’s own backend for checkout configuration, buyer addresses and payment operations. SuppStack needs corresponding capabilities before reproducing that entire experience.

## Decision

Restore physical-product purchase actions in the native shell. Retain the existing merchant review and browser handoff for the first recovery milestone. Digital Premium follows the existing billing controls.

Treat opening checkout as presentation only. An unavailable product returns before merchant requests. Cart permalinks report fallback checkout capability and do not fabricate UCP checkout IDs.

ADR 0004 implements Shopify Checkout Kit through Capacitor with distinct completion, dismissal and failure outcomes. Device payment verification remains open.

## Implemented

- Product detail, sticky Buy, source information and Buy This Stack are available on native.
- Unavailable inventory short-circuits merchant requests.
- The review panel respects both catalog and live out-of-stock status.
- Generic checkout launch reports unavailable sessions and failed opens.
- The panel describes a checkout-open failure without assuming it was a popup blocker.

Native reorder links outside these product and stack entry points remain a separate audit item.

## Evaluation

Run npm run eval:commerce and npm run eval:ui.

Against the pre-change resolver at f541a05, commerce evaluations passed 6/8. COM-02 detected a merchant request for unavailable inventory. COM-03 detected a permalink claiming checkout support. The revised resolver passes 8/8.

Browser fixtures exercise the product route with a simulated native bridge and merchant responses. Live order completion, payment challenges, receipts and physical-iPad behavior remain unverified.

## Consequences

Physical-product buying is restored before the payment-platform migration. Merchant browser presentation remains an interim experience. Only a verified merchant receipt may establish order success.
