# Decisions and delivery tracking

Each ADR records context, a decision, the implementation boundary, and evidence. An accepted decision can have unfinished milestones.

| ADR | Decision | State |
| --- | --- | --- |
| [0001](0001-physical-product-checkout.md) | Restore physical-product purchasing and distinguish presentation from UCP execution | Accepted, initial recovery implemented |
| [0002](0002-evaluation-and-release-evidence.md) | Evaluate stable scenarios and record device verification separately | Accepted, suites implemented |
| [0004](0004-native-checkout-kit-lifecycle.md) | Own native presentation outcomes through Checkout Kit | Accepted, implementation and fixtures complete; physical payment verification pending |
| [0003](0003-ucp-capabilities-and-universal-checkout.md) | Negotiate UCP capabilities and qualify Universal Checkout | Proposed |
| [0005](0005-multi-merchant-checkout-progress.md) | Track separate merchant checkout progress and recovery | Accepted, implementation and fixture evaluation complete |
| [0006](0006-mobile-directory-search-and-filters.md) | Put search and product results before mobile filter details | Accepted, implementation and Chromium/WebKit evaluations complete; physical accessibility QA pending |
| [0007](0007-merchant-checkout-parity.md) | Complete product checkout from mobile sticky Buy and direct merchant links | Accepted, portal and shared presentation implemented |

## Delivery queue

| ID | Work | Acceptance evidence | Current state |
| --- | --- | --- | --- |
| COM-1 | Restore native product Buy and Buy This Stack | Product route with a native bridge fixture preserves variant and quantity when presenting the merchant URL | Implemented, browser fixture verification |
| COM-2 | Respect unavailable inventory and report fallback honestly | COM-02 and COM-03 pass without merchant requests for unavailable products | Implemented, 8/8 commerce evaluations |
| COM-3 | Qualify supported embedded native Shopify checkout | Device callback tests cover close, cancel, failure, completion, Shop Pay and authentication return | SDK plugin implemented; native build and browser fixtures verified; physical payment tests pending |
| COM-4 | Negotiate merchant UCP schemas with an owned agent profile | Discovery, authentication, escalation and supported-version fixtures pass | Pending |
| COM-5 | Qualify multi-merchant Universal Checkout | Access, merchant eligibility, shipping/tax/consent and partial failure scenarios verified | No Catalog credentials in production; approved client and owned profile still required |
| COM-6 | Make separate merchant checkout usable | One sheet per gesture, partial completion, sibling retry and unchanged-cart progress preserved | Implemented with offline and normal stack-route browser evaluations; see ADR 0005 |
| UX-1 | Keep feedback inside What’s New | Signed-out evaluation passes; signed-in header icon opens updates | Existing implementation, sign-in regression automated |
| UX-2 | Improve checkout loading and recovery | Slow merchant, unavailable inventory, bridge failure, cancel and retry tested on phone and iPad | Initial browser fixtures; device coverage pending |
| UX-3 | Eliminate native/server first-render mismatch | Native fixture page has no hydration warning | Auth gate corrected; native browser fixtures now assert no hydration errors |
| UX-4 | Make mobile catalog search and filtering usable before scrolling | DIR-01 through DIR-07 in Chromium and WebKit; same-route visual comparison | Search and two-column products lead; draft/apply filter sheet implemented; device keyboard and VoiceOver QA pending |
| REL-1 | Resolve App Review rejection | Physical iPad Release/TestFlight cold launch, resume and Apple sign-in evidence plus accepted submission | Open; build 91 available in TestFlight |

## Source review on November 7, 2026

- [Breeje Anadkat’s UI post](https://x.com/BreejeAnadkat/status/2119040284088787421) introduces a thread about building app UI and motion with Claude Code. Root text was retrieved through a public mirror after X returned 403. Thread replies and video walkthrough were unavailable. Detailed tutorial instructions are not attributed to it. The proposed application is to evaluate rendered task flows and failure states before adding visual effects.
- [Gil’s Universal Checkout announcement](https://x.com/gilgNYC/status/2118703307883692409) describes purchasing across merchants in one flow and labels it early access.
- [Gil’s UCP location announcement](https://x.com/gilgNYC/status/2118406897753530616) describes Storefront MCP location availability and a MapKit demo. The root names four features but exposes only the first. The others were not inferred.
- [Shopify carts and checkout](https://shopify.dev/docs/agents/carts-and-checkout) distinguishes permalinks, Cart MCP, authenticated Checkout MCP, and buyer handoff.
- [Shopify agentic commerce](https://shopify.dev/docs/agents) describes agent profiles and access tiers.
- [UCP permalink announcement](https://shopify.dev/changelog/posts/cart-and-checkout-permalinks-now-support-ucp-at-buy) documents discovery of the merchant’s permalink endpoint.

Merchant availability, access approvals and order completion require separate verification.
