# ADR 0002 — Evaluate improvements against task outcomes

Date November 7, 2026. Status accepted.

## Context

A passing build did not catch hidden native purchase controls or feedback forms on sign-in. Improvements need stable task scenarios and evidence for the environment tested.

## Decision

Use deterministic commerce evaluations for routing and capability decisions, Playwright for rendered behavior, and device checks for native releases. Keep stable scenario IDs. Change expectations only when an ADR explains a deliberate behavior change.

For every iteration, record the source commit, scenario set, before and after results, failed cases and evidence links. Existing safety cases must pass before visual or performance improvements count. Fixture success and physical-device verification remain separate.

## Commands

- npm run eval:commerce runs eleven offline scenarios and emits JSON with IDs and pass count.
- npm run eval:ui starts or reuses the local development server on port 3511.
- Install the test browser once with npx playwright install chromium.
- Directory iOS-engine checks use `npx playwright install webkit`, then `npm run eval:ui -- evals/directory.spec.ts --browser=webkit`.
- UI tests need the project’s public Supabase URL to derive the storage key. They intercept Supabase and checkout responses, use an artificial buyer, and stop before payment.
- npm run check:catalog runs existing catalog checks.
- Failed browser traces stay under test-results. Review their contents before sharing.

## Gates

| Area | Acceptance | Evidence |
| --- | --- | --- |
| Variant and quantity | Selected merchant variant and container quantity survive | COM-01, COM-05, COM-07, COM-UI-01 |
| Inventory | Unavailable products never contact the merchant or start checkout | COM-02, COM-UI-02 |
| Capability truth | Permalink is not reported as authenticated UCP checkout | COM-03 |
| Recovery | Missing/rejected native bridge produces a recovery state | COM-08, COM-UI-03 |
| Action visibility | Native product detail has a usable Buy action | COM-UI-01 |
| Account boundary | Sign-in has no feedback prompt or updates icon | UX-01 |
| Catalog | Zero catalog-check failures | Existing catalog command |
| Native release | Cold launch, resume, checkout return and Apple sign-in on physical iPad | Open |

For visual refinement, capture the same route, content, viewport and state before and after. Review competing actions, hierarchy, overflow, keyboard focus, touch targets and reduced motion. Record the specific issue improved. Performance work records navigation-to-usable-control time under the same network/cache conditions while preserving these gates.

## First iteration

The pre-change resolver scored 6/8. Recovery scores 8/8. Browser scenarios cover native presentation, unavailable live stock, bridge failure and sign-in noise. Expand this baseline as the real checkout integration is added.

## Native integration iteration

After merging #45, Checkout Kit lifecycle work expands the offline suite to 11/11 and the browser suite to 9/9. The additional gates distinguish completion from dismissal, reject unknown outcomes, preserve older-binary fallback and prevent duplicate presentation. Every native product fixture also asserts hydration consistency. See ADR 0004 for the native dependency and remaining device checks.

The Commerce evaluations GitHub Actions workflow runs the offline, registration, browser and TypeScript checks on pull requests and main. It uses dummy public Supabase configuration and intercepted browser requests, with no production secrets.

## Mobile directory iteration

ADR 0005 adds seven stable directory scenarios: phone layout, draft cancellation and focus, combined search/facets/sort, persistence, reset, overflow, desktop controls and delayed hydration. The directory suite runs in Chromium and WebKit in CI. The browser baseline is now 16 Chromium cases plus seven WebKit directory cases; offline commerce remains 11 cases. Physical keyboard and VoiceOver verification remain separate.
