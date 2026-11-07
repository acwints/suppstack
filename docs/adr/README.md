# Decisions and delivery tracking

Each ADR records context, a decision, the implementation boundary, and evidence. An accepted decision can have unfinished milestones.

| ADR | Decision | State |
| --- | --- | --- |
| [0001](0001-physical-product-checkout.md) | Restore physical-product purchasing and distinguish presentation from UCP execution | Accepted, initial recovery implemented |
| [0002](0002-evaluation-and-release-evidence.md) | Evaluate stable scenarios and record device verification separately | Accepted, suites implemented |
| [0003](0003-ucp-capabilities-and-universal-checkout.md) | Negotiate UCP capabilities and qualify Universal Checkout | Proposed |

## Delivery queue

| ID | Work | Acceptance evidence | Current state |
| --- | --- | --- | --- |
| COM-1 | Restore native product Buy and Buy This Stack | Product route with a native bridge fixture preserves variant and quantity when presenting the merchant URL | Implemented, browser fixture verification |
| COM-2 | Respect unavailable inventory and report fallback honestly | COM-02 and COM-03 pass without merchant requests for unavailable products | Implemented, 8/8 commerce evaluations |
| COM-3 | Qualify supported embedded native Shopify checkout | Device callback tests cover close, cancel, failure, completion, Shop Pay and authentication return | Pending |
| COM-4 | Negotiate merchant UCP schemas with an owned agent profile | Discovery, authentication, escalation and supported-version fixtures pass | Pending |
| COM-5 | Qualify multi-merchant Universal Checkout | Access, merchant eligibility, shipping/tax/consent and partial failure scenarios verified | Pending access investigation |
| UX-1 | Keep feedback inside What’s New | Signed-out evaluation passes; signed-in header icon opens updates | Existing implementation, sign-in regression automated |
| UX-2 | Improve checkout loading and recovery | Slow merchant, unavailable inventory, bridge failure, cancel and retry tested on phone and iPad | Initial browser fixtures; device coverage pending |
| UX-3 | Eliminate native/server first-render mismatch | Native fixture page has no hydration warning | Observed during browser fixture development; separate investigation pending |
| REL-1 | Resolve App Review rejection | Physical iPad Release/TestFlight cold launch, resume and Apple sign-in evidence plus accepted submission | Open; build 91 available in TestFlight |

## Source review on November 7, 2026

- [Breeje Anadkat’s UI post](https://x.com/BreejeAnadkat/status/2119040284088787421) introduces a thread about building app UI and motion with Claude Code. Root text was retrieved through a public mirror after X returned 403. Thread replies and video walkthrough were unavailable. Detailed tutorial instructions are not attributed to it. The proposed application is to evaluate rendered task flows and failure states before adding visual effects.
- [Gil’s Universal Checkout announcement](https://x.com/gilgNYC/status/2118703307883692409) describes purchasing across merchants in one flow and labels it early access.
- [Gil’s UCP location announcement](https://x.com/gilgNYC/status/2118406897753530616) describes Storefront MCP location availability and a MapKit demo. The root names four features but exposes only the first. The others were not inferred.
- [Shopify carts and checkout](https://shopify.dev/docs/agents/carts-and-checkout) distinguishes permalinks, Cart MCP, authenticated Checkout MCP, and buyer handoff.
- [Shopify agentic commerce](https://shopify.dev/docs/agents) describes agent profiles and access tiers.
- [UCP permalink announcement](https://shopify.dev/changelog/posts/cart-and-checkout-permalinks-now-support-ucp-at-buy) documents discovery of the merchant’s permalink endpoint.

Merchant availability, access approvals and order completion require separate verification.
