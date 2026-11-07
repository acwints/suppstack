# ADR 0007 — Complete the merchant checkout flow

Date November 7, 2026. Status accepted.

## Context

Bantee can purchase from an individual merchant using a variant cart permalink or a merchant UCP continuation URL, with embedded checkout or browser handoff according to support. Those paths do not require approval for Shopify's combined multi-merchant Universal Checkout.

SuppStack already installs Checkout Kit, but the real iPhone 18 Pro Max exposed a blocking layout problem: the sticky Buy control renders its review under a backdrop-filter ancestor. The fixed-position modal therefore extends below the viewport. Earlier browser evals opened the other Buy action and missed this entry point. The baseline regression measured the dialog bottom at 1125px in an 844px viewport.

Products carrying a direct Shopify checkout URL without variant metadata also bypassed the review and native SDK. A background session request was ignored after a cart permalink had already opened, so it could create an unused merchant session.

## Decision

- Render product checkout review in a document portal. Keep it visible while a native checkout is pending, including when Escape is pressed.
- Send every product Buy action through review. Product and stack checkout share one secure merchant presenter.
- Prefer the selected variant cart URL, preserving quantity. Direct Shopify checkout URLs without a variant use Checkout Kit with their existing selection. Hide quantity controls when the app cannot encode quantity into the merchant URL.
- Present official merchant product pages in the browser. An older installed binary without the SDK also uses browser handoff. Opening a browser is never counted as order completion.
- Keep web window opening synchronous with the buyer gesture. SDK errors never automatically create a second presentation.
- Do not make a background cart/session request whose result will be discarded. Direct handoff works without a Supabase write, Shopify Catalog credentials or combined-checkout approval.
- Skip live variant lookups when variant metadata is absent. Abort slow checks after eight seconds and leave final stock validation to the merchant. Never override an explicit unavailable result.
- Reject insecure or credential-bearing destinations, including recovery links.

## Verification

The new sticky-Buy browser regression fails on the actual eaf5d31 component and passes with the portal. Checkout routing, missing-variant metadata, unknown SDK results, failed presentation, blocked popups, pending-sheet cancellation and slow availability have deterministic evaluations. The existing stack partial-completion cases remain required.

The live Naked Nutrition product JSON was checked independently: variant 1248822167 is available at 3599 cents. Native production verification follows deployment and stops before placing a paid order. This change contains no native binary changes and uses the existing Checkout Kit plugin.

## Boundary

This provides separate merchant purchasing. Combined checkout across merchants remains ADR 0003. Physical-device payment, merchant receipt reconciliation and external authentication return remain separate qualification work. See the commerce QA log for measured results.
