# ADR 0005 — Merchant checkout progress before Universal Checkout access

Date November 7, 2026. Status accepted for separate merchant checkout. Combined Universal Checkout remains proposed under ADR 0003.

## Context

Buy This Stack opened every merchant cart and fallback URL in a loop. Native sheets competed for presentation and browser popups could be blocked. There was no per-merchant completion or recovery state. An unavailable product excluded from grouped carts was still opened through the individual fallback loop.

Production environment inspection found no Shopify Catalog credentials. Approval for Universal Checkout has not been established. Shopify's [Universal Checkout guide](https://shopify.dev/docs/agents/carts-and-checkout/universal-checkout) requires early-access-approved Catalog credentials, authenticated merchant carts and an owned profile. Separate cart links cannot establish a combined session.

Bantee was also checked directly through its production Laravel runtime on November 7. Its existing `universalCheckoutAccess()` probe returned `status: credentials_unavailable, available: false`, and both required credential configuration entries were absent. This establishes current configuration, not account-level approval history. Bantee's separate merchant UCP, embedded checkout and own-store paths do not prove combined-checkout access.

## Decision

- Replace bulk opening and duplicate individual links with one review action. The buyer opens each merchant explicitly. Native Shopify carts use the installed Checkout Kit bridge. Older binaries use the merchant browser and remain marked opened.
- Keep all merchant actions disabled while a native checkout is pending. A synchronous ref also guards repeated taps before React updates.
- Count completion only from the SDK's completed outcome. Dismissed, failed, unknown and browser-open outcomes never increment completion. No failure automatically launches a fallback or retry.
- Retain outcomes in page memory keyed by the exact cart selection. Closing the review or changing a sibling merchant preserves unchanged completed carts. Completed carts cannot be reopened from this review.
- Exclude unavailable products from both grouped carts and fallback actions. Reject insecure, credential-bearing or missing destinations. Discovery searches are not checkout actions.
- Deduplicate repeated product selections and variant lines. One container per unique variant is added, even when a blend matches multiple supplements.
- Render review in a portal above application navigation, trap keyboard focus, and restore focus to the trigger on close.
- Keep checkout URLs and progress out of storage and diagnostic logs. Progress expires on page navigation or reload. The review tells buyers to check their merchant receipt before reopening a checkout.

## Evaluation evidence

`npm run eval:commerce` adds six planning cases to the existing eleven. `npm run eval:ui` adds normal stack-route scenarios for review without opening, pending-sheet exclusivity, partial completion, sibling failure/retry, dismissal, close/reopen, old-binary handoff, unknown outcomes, blocked popups, keyboard access and changed selections.

The CI workflow retains a machine-readable browser report, the fixture review screenshot and failure traces for seven days. Each run starts its own server and fails if its port is occupied. `COMMERCE_EVAL_PORT` supports isolated local runs.

## Remaining qualification

This does not implement a combined multi-merchant payment. Confirm an approved Catalog client, configure server-only credentials and publish the owned agent profile before implementing authenticated Cart MCP and global create_checkout. Add fixtures for currency incompatibility, opaque cart keys, checkout_timeout without automatic retry, capability escalation, stale event revisions, ejected merchants and partial completion before enabling it.

Shopify documents Universal Checkout through Checkout Kit for Web. The installed iOS plugin currently presents one merchant. Its compatibility with a combined session requires separate device evidence. Physical-device payments, merchant receipts, external authentication and long-running native presentation remain unverified by these browser fixtures.
