# ADR 0003 — Capability-driven UCP and Universal Checkout

Date November 7, 2026. Status proposed.

## Context

Shopify’s posts announce location-aware discovery and early-access Universal Checkout. SuppStack builds separate merchant carts. Its UCP adapter uses an April example profile URL, infers tools from broad capabilities, and usually bypasses discovery for variant permalinks. Authentication, negotiated schemas and a trusted order receipt remain unverified.

Current Shopify documentation requires authentication or signed requests for Checkout MCP. Discovery can advertise a UCP permalink endpoint. Access to new Universal Checkout capabilities must be confirmed for this application.

## Proposed decision

1. Retain separate merchant carts as the fallback.
2. Host a SuppStack-owned agent profile and negotiate merchant versions and capabilities.
3. Use advertised tool schemas and documented authentication. Validate discovery destinations and redirects against merchant allowlists and public-network restrictions before requests.
4. Record cart creation, buyer review, escalation, completion, cancellation and failure separately. Only a trusted completion response or receipt establishes purchase success.
5. Prefer discovered UCP permalinks where supported, preserving variant and quantity. Retain legacy links for unsupported merchants.
6. Qualify Universal Checkout access before promising a single cross-merchant payment.
7. Add location/pickup only when merchants return inventory for that location, with freshness visible.

## Verified Shopify integration shape

The [current Universal Checkout guide](https://shopify.dev/docs/agents/carts-and-checkout/universal-checkout) requires Catalog credentials whose API key has early-access approval, an owned profile declaring the draft universal-checkout capability, authenticated merchant carts, and compatible currency. The global endpoint combines opaque cart IDs and returns a combined continuation URL or separate merchant fallbacks. Session URLs and cart keys must stay out of logs. Partial completion must be tracked per merchant. A timeout cannot be retried blindly because checkout may already exist.

This is the concrete integration to qualify in COM-5. Bantee’s custom backend is a separate implementation reference.

## Entry requirements

- Confirm application access and merchant eligibility.
- Identify required authentication without placing secrets in client bundles.
- Capture sanitized discovery documents and tool schemas as fixtures.
- Compare the supported Shopify native integration with Bantee’s WebView and custom-backend routes.
- Define order identity, idempotency and receipt boundaries before payment completion.

## Completion evaluations

- Variant, quantity, currency and amount preserved through receipt.
- Tax/shipping changes, missing buyer fields, consent and authentication challenges.
- Cart replacement semantics preserve required merchant fields.
- Unsupported capability, declined payment, cancellation, expired session, duplicate tap, retry and merchant failure are recoverable.
- Cross-merchant partial failure exposes each merchant outcome and prevents retry from duplicating accepted orders.
- Location changes cannot present stale pickup inventory as confirmed.
- Native close, resume and authentication return tested on iPhone and iPad.

No live payment or Universal Checkout session was created in this investigation. Access and end-to-end completion are open milestones.
