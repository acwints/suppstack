# SuppStack Canonical Product, Architecture, and Customer Journey

Last audited: **August 31, 2026**  
Document status: **Canonical**  
Applies to: production web app, Capacitor iOS/iPadOS shell, Supabase data model, commerce, billing, HealthKit, and App Store delivery

## 1. Authority and update rule

This is the source of truth for what SuppStack is, how customer actions change data, what the app measures, and what remains unsafe or incomplete. It is intentionally broader than the database migration index and narrower than a general product strategy.

When behavior changes, the same pull request must update:

1. the affected customer journey in this file;
2. the affected data invariant or event definition;
3. the risk or progress row; and
4. a dated entry in the progress ledger.

Specialized documents remain supporting evidence:

- [`supabase/migrations/README.md`](supabase/migrations/README.md) owns migration ordering and database history.
- [`APP_STORE_SUBMISSION.md`](APP_STORE_SUBMISSION.md) owns the detailed App Store submission procedure.
- [`docs/IMPECCABLE_AUDIT_2026-07-30.md`](docs/IMPECCABLE_AUDIT_2026-07-30.md) is a historical UI audit, not the current product status.
- [`HANDOFF.md`](HANDOFF.md) is an operational handoff and may become stale.

Truth labels used here:

| Label | Meaning |
| --- | --- |
| **Implemented** | Present in code and supported by direct evidence. |
| **Partial** | Useful behavior exists, but an important failure path, control, or verification layer is missing. |
| **Planned** | Desired behavior with no complete implementation. |
| **Risk** | Current behavior can cause incorrect data, privacy exposure, review failure, or a broken journey. |
| **Unknown** | Cannot be established from the repository or current production evidence. |

## 2. Executive truth

**No: SuppStack cannot yet be confirmed as following all mobile-app best practices.**

The app has a credible, deliberately simple product core: authenticated stack membership, per-product settings, daily logs, database row-level security, canonical ingredient composition, native Apple authentication, native HealthKit reads, native IAP, account deletion, and an offline launch fallback. The production build compiles and the submitted iOS build is waiting for review.

It does not yet meet a best-in-class standard because the following are material:

- public profile rows can expose private-profile columns through the public data API;
- public stacks and product reviews create a user-generated-content surface without reporting, blocking, or moderation workflow;
- critical multi-row writes are not atomic and several counters use unsafe read-then-write updates;
- the daily tracking model has duplicate-log, schedule-day, timezone, and summary-recalculation gaps;
- there is no automated unit/integration/end-to-end test suite for customer journeys or RLS policies;
- there is no crash, hang, real-user performance, or general product-event instrumentation;
- current mobile LCP is outside the good Core Web Vitals threshold;
- HealthKit purpose strings and privacy copy do not exactly match the read-only implementation;
- photo scanning sends an image to a third-party AI service without an explicit just-in-time disclosure in the scan UI;
- accessibility still has unlabeled selects and some controls below the recommended 44-point default size.

### Current scorecard

| Area | Status | Evidence and commentary |
| --- | --- | --- |
| Product focus | **Implemented** | The primary loop is discover → add to stack → configure → log → understand intake/restock. No new surface should ship unless it deepens this loop. |
| Native authentication | **Implemented** | Apple uses `AuthenticationServices` with a nonce and a bounded Supabase token exchange; cancellation and failure clear the pending UI. Google uses `SFSafariViewController` and a PKCE deep link. |
| Database authorization | **Partial** | User-owned tracking, membership, billing, and former health tables use RLS. Public profile column exposure and the absence of automated policy tests prevent a pass. |
| Tracking correctness | **Risk** | The basic write/read loop works, but schedule days are ignored, logs are not uniquely constrained per product/day, and UTC/local-date logic is inconsistent. |
| Ingredient integrity | **Implemented** | A pure intake Module separates unit buckets and never converts or sums incompatible units such as mg and IU. Catalog checks pass. |
| Privacy | **Risk** | HealthKit is on-device and read-only, but profile exposure, AI-photo disclosure, and inaccurate privacy/purpose metadata require correction. |
| UGC safety | **Risk** | Public stacks and reviews exist without report/block/moderation controls required for a robust public UGC system. |
| Reliability/testing | **Risk** | Lint and builds pass, but there is no application test suite and no route-level error recovery. |
| Performance | **Partial** | Production mobile Lighthouse: 81 performance, LCP 3.6 s, FCP 3.5 s, CLS 0, approximately 1.72 MB transferred. Stability is strong; load performance is not. |
| Accessibility | **Partial** | Safe areas, focus styles, semantic labels, and large primary actions are generally strong. Production accessibility score is 94; unlabeled selects and undersized repeated controls remain. |
| Billing | **Partial** | Apple IAP, restore, and an RLS-protected entitlement mirror exist. Webhook delivery ordering/idempotency and entitlement convergence are not durable enough yet. |
| App Store delivery | **Partial** | Version 1.1 build 60 is `WAITING_FOR_REVIEW`; approval is not guaranteed and is not evidence of best-practice completeness. |

## 3. Product intent and non-goals

### Product promise

SuppStack helps a person answer three questions with minimal work:

1. **What am I taking?** A canonical, editable stack of real products.
2. **Did I take it?** A fast daily product-level checkoff.
3. **What does that imply?** Ingredient overlap, adherence context, cost/restock estimates, and optional on-device health context.

### Product principles

- **Data integrity over feature count.** A smaller trustworthy record is more valuable than a larger speculative one.
- **One daily ritual.** The Stack screen is the operational home; tracking must remain a one-tap action.
- **Separate facts from estimates.** Logged intake is a fact. Ingredient totals depend on catalog composition. Restock dates and health context are estimates and must be labeled as such.
- **Health data stays behind the narrowest Seam.** HealthKit is read on demand, on device, and is never an analytics dimension.
- **No medical diagnosis.** SuppStack organizes, compares, and tracks; it does not prescribe or diagnose.
- **No frontend feature theater.** New UI is justified only by a stronger invariant, a shorter core journey, or a clearly measured failure.

### Non-goals

- social engagement for its own sake;
- gamification beyond clear adherence feedback;
- collecting health or behavioral data “in case it is useful”;
- medical recommendations, treatment claims, or dosage calculation;
- duplicating merchant order/payment systems;
- a broad analytics taxonomy that records every tap.

## 4. Domain vocabulary

| Term | Canonical meaning | Source of truth |
| --- | --- | --- |
| **Supplement** | A canonical ingredient/family or reference entity, such as Magnesium Glycinate. It is not a specific purchasable SKU. | `supplements` plus the curated catalog |
| **Product** | A specific merchant offer/SKU with brand, price, servings, URL, image, and composition. | `products` plus the curated catalog |
| **Ingredient edge** | A product-to-supplement composition row with amount, unit, and ordering metadata. | `product_ingredients` |
| **Stack membership** | A user takes or manages a product. | `users_products` |
| **Product settings** | Status, planned servings, schedule days, custom dosage, and start/end dates for one stack product. | `user_supplement_settings` |
| **Daily log** | A dated record that the user took a product, with servings taken. | `supplement_logs` |
| **Daily summary** | A database-derived adherence projection for a user/date. It must never become an independent truth. | `daily_tracking_summary` |
| **Published stack** | A named, shareable supplement-family collection with source attribution. It is separate from personal product membership. | `stacks` and `stack_supplements` |
| **Saved product** | A device-local bookmark snapshot. It is not synced to the account. | `localStorage` |
| **Recently viewed** | A device-local product-history snapshot. It is not analytics and is not server persisted. | `localStorage` |
| **Checkout event** | A service-role audit record that a purchase route was resolved. It is not proof of a completed merchant order. | `commerce_checkout_events` |
| **Entitlement** | A server mirror of RevenueCat subscription state. RevenueCat remains the billing system of record. | `user_entitlements` |
| **Health snapshot** | A transient in-memory result read directly from HealthKit. It is not persisted by SuppStack. | native `SuppStackHealth` Adapter |

## 5. Architecture map

### Major Modules and Interfaces

| Module | Interface | Implementation | Depth and seams |
| --- | --- | --- | --- |
| Catalog | Search, directory, product lookup, composition lookup | `src/lib/catalog/*`, curated TypeScript catalog, public Supabase catalog tables | Deep domain logic, but the static-ID/DB-ID split creates a high-cost Seam. |
| Account | Auth session, profile, account deletion | Supabase Auth, `AuthContext`, `src/lib/account/*`, `/api/account/delete` | Native Apple, Google OAuth, and existing-account email/password sign-in are hidden behind one Interface; profile privacy is not sufficiently separated. |
| Personal stack | Membership and settings | `users_products`, `user_supplement_settings`, `useProductInStack`, `useRegimen` | Two tables represent one user action. Current Implementation is not transactional. |
| Daily tracking | Log/unlog, streak, completion, restock | `supplement_logs`, `daily_tracking_summary`, triggers, tracking hooks/components | Business rules are split across client, database, and UTC/local clocks, reducing Locality. |
| Ingredient intake | Daily ingredient rollup and overlap | pure `src/lib/ingredients/intake.ts` plus persistence mapper | Strong Module: small Interface, substantial hidden correctness, high Leverage. |
| Published stacks | Create/copy/share/like/follow | `stacks`, `stack_supplements`, social tables, hooks | Public UGC responsibilities exceed the current safety Implementation. |
| Commerce | Resolve allowed merchant checkout and open externally | commerce API, Shopify/UCP Adapter, Capacitor Browser Adapter | Merchant allowlist is a useful SSRF Seam; audit event is not an order record. |
| Billing | Offer, purchase, restore, entitlement read | RevenueCat native Adapter, webhook, `user_entitlements` | Good system-of-record separation; webhook ordering/idempotency needs depth. |
| Health | Availability, permission, transient metrics | HealthKit native Adapter and `AppleHealthCard` | Excellent privacy Locality: HealthKit values do not cross the native/web Seam into storage. |
| Photo scan | Image capture, AI recognition, catalog match | native file input, `/api/catalog/photo-scan`, OpenAI Responses API, deterministic matcher | Image leaves the device for processing; consent, rate limiting, and operational telemetry are missing. |
| Presentation | Routes, providers, components, native shell | Next.js App Router, React client providers, Capacitor remote URL | Many client Components and a remote shell increase startup/network sensitivity. |

### Runtime flow

`iOS/iPadOS shell → WKWebView → production Next.js app → Supabase/route handlers`

Native-only Seams:

- Apple sign-in → `SuppStackAppleSignInPlugin` → Apple ID token → Supabase Auth.
- Apple Health → `SuppStackHealthPlugin` → transient JavaScript object → UI only.
- Google sign-in and merchant checkout → Capacitor Browser → visible `SFSafariViewController`.
- Premium → RevenueCat Capacitor plugin → App Store purchase sheet → webhook → Supabase entitlement mirror.

The native bundle contains a minimal offline fallback, but the actual product is remotely served. A production web regression can therefore change the installed app without a new App Store binary. Every production web deployment must be treated as a mobile release.

## 6. Data ownership, classification, and invariants

### Data classification

| Class | Examples | Storage | Rule |
| --- | --- | --- | --- |
| Public catalog | supplements, products, brands, ingredient composition | static catalog and Supabase | Public read; service-role-only catalog writes. |
| Public UGC | published stacks, approved reviews, likes/follows | Supabase | Only intentionally public fields may be exposed. Must support moderation/report/block before being considered mature. |
| Private account | email identity, date of birth, gender, height, weight | Supabase Auth and `user_private_profiles` after roadmap phase 1 contract | Owner-only. Never expose through a public row policy or direct client table grant. |
| Private behavioral product data | stack membership, settings, daily logs | Supabase | Owner-only under RLS; not analytics. |
| Billing | entitlement status, product, period end | RevenueCat and Supabase mirror | RevenueCat is authoritative; clients read but cannot grant access. |
| HealthKit | sleep, weight, body fat, activity, heart metrics | device memory only | Never persist, transmit, advertise against, or include in telemetry. |
| Photo scan | customer-selected supplement photo | request memory and OpenAI request | No storage by SuppStack; disclose third-party AI processing before upload; never use for model training or analytics. |
| Optional analytics | coarse journey outcomes and performance | not implemented | Consent-controlled, minimized, pseudonymous, and health-free. |

### Required invariants

The following statements define correctness. A change that breaks one is a regression even if the UI appears to work.

1. One authenticated person owns one profile.
2. A personal stack contains at most one membership row per `(user, product)`.
3. A product has at most one settings row per `(user, product)`.
4. A user can have at most one effective daily log per `(user, product, local_date)` unless multi-dose logging is explicitly designed end to end.
5. The customer-local date and timezone used for planning, logging, summaries, streaks, and calendar display are the same.
6. Planned items for a date respect `status`, `schedule_days`, start date, and end date.
7. Daily summaries are derived, reproducible, and recomputed when either logs or planning settings change.
8. Stack add/remove, published-stack create/update/copy, and other aggregate mutations are atomic and idempotent.
9. Ingredient amounts are summed only within the same canonical ingredient and compatible unit bucket. No implicit mg/IU conversion occurs.
10. Estimates are never presented as facts. Restock must expose its assumptions and confidence.
11. Public reads cannot reveal private profile, auth, health, billing, or personal-regimen data.
12. Service-role credentials exist only in server-only code.
13. Billing events cannot move entitlement state backward because of duplicates or out-of-order delivery.
14. Account deletion removes or irreversibly anonymizes every user-linked row and can be safely retried.
15. Every critical mutation has a stable operation ID, an explicit success/failure outcome, and a recovery path.

### Current invariant violations or gaps

| Invariant | Current state | Consequence |
| --- | --- | --- |
| Profile privacy | **Risk in production; remediation in progress**: migration 0026 and the matching Account Profile Module build the private store and atomic commands, but the staged contract migration has not removed the legacy public columns/grants. No populated sensitive value was found in the aggregate production check on August 30. | Until the staged rollout is completed, a future user entering these fields can make them publicly readable through the data API. |
| One daily log | **Risk**: no unique database constraint on `(user_id, product_id, log_date)`. | Concurrent taps/retries can create duplicates; UI hides them while restock usage can overcount them. |
| One clock | **Risk**: log writes use a local date helper, weekly display uses UTC ISO dates, and streak triggers use database `CURRENT_DATE`. | Travel and timezone edges can assign a log, streak, and calendar cell to different days. |
| Scheduled plan | **Risk**: active status is respected, but `schedule_days`, start date, and end date are not applied to the daily checklist or summary trigger. | Completion percentages and missed-day states can be wrong. |
| Derived summaries | **Risk**: summaries update on log mutations, not planning-setting mutations. | Historical and current denominators become stale. |
| Atomic membership | **Risk**: membership and settings are two sequential client writes/deletes. | Partial stack state can exist after a network or database failure. |
| Atomic published stacks | **Risk**: stack header and child rows are written separately; updates delete children before reinserting. | A failed second step can leave an empty or partial stack. |
| Social counters | **Risk**: view/copy increments use client read-then-write and errors are ignored; RLS can deny non-owner counter updates. | Lost updates and misleading popularity metadata. |
| Billing ordering | **Risk**: the entitlement mirror has no persisted RevenueCat event ID or event timestamp ordering rule. | Duplicate or delayed webhooks can overwrite newer state. |
| Catalog identity | **Partial**: catalog IDs and database IDs are reconciled by name, aliases, and product URL. | Correctness depends on mutable natural keys and repeated sync logic. |

## 7. End-to-end customer journey

### Journey overview

`Launch → Authenticate → Discover or Scan → Evaluate → Add/Configure → Daily Log → Understand → Restock/Buy → Maintain/Delete`

The customer can also branch from Evaluate into Save, Review, or Published Stack, and from Understand into optional Apple Health or Premium analytics.

### 7.1 Launch and shell readiness

- **Customer experience:** The native splash yields to the remotely served app. Native routes require authentication; web visitors may browse as guests. If the production URL cannot load, the bundled fallback shows an explanation and Retry.
- **Logic and data:** `capacitor.config.ts` loads `https://www.suppstack.app`; `AuthContext` races initial session retrieval against a five-second fallback.
- **Metadata/events today:** No launch event, release ID, crash report, hang report, or web-vitals report is captured.
- **Performance commentary:** The remote shell makes network, DNS, TLS, Next.js JavaScript, and catalog images part of launch. Production mobile FCP is 3.5 seconds and LCP is 3.6 seconds in the August 30 lab run.
- **UX/accessibility commentary:** Safe-area and dynamic-viewport handling are strong. A blank authenticated route can still be masked by a spinner rather than a route-specific recovery state.
- **Status:** **Partial**. Add release-aware crash/hang/RUM measurement and define offline behavior for the daily core.

### 7.2 Authentication and profile creation

- **Customer experience:** Apple is first and native. Google opens a visible in-app browser. An existing-account email/password option supports users and App Review accounts that cannot use a reviewer-owned Apple or Google identity. Successful login returns to the requested route; cancellations and timeouts restore usable buttons.
- **Logic and data:** Apple identity token + raw nonce → Supabase `signInWithIdToken`; Google OAuth code → deep link → Supabase PKCE exchange; email/password → Supabase `signInWithPassword`. A profile is lazily created after sign-in.
- **Metadata/events today:** Failures go to `console.error`; no structured provider/outcome/duration/error-code event exists.
- **Performance commentary:** The session exchange has a 20-second hard timeout. There is no measured p50/p95 by provider, app version, device class, or OS.
- **UX/accessibility commentary:** Primary controls are 52 points high, email fields have explicit labels and autocomplete semantics, and cancellation is treated as a no-op. The five-second initial-session timeout can show a signed-out state during a slow restore and later redirect when auth state catches up.
- **Status:** **Implemented** for Apple sign-in and App Review credential access; **Partial** for observability and automated clean-install testing.

### 7.3 Browse, goal discovery, brand discovery, and search

- **Customer experience:** Customers browse a broad catalog by goal, product, supplement family, or brand and can search across all of them.
- **Logic and data:** The primary directory and search index are built in the client from the curated catalog; database data fills canonical/persisted identities when needed.
- **Metadata/events today:** Raw search terms remain in the URL but are not sent to an analytics service. Recently viewed is local-only.
- **Performance commentary:** The home route renders a large catalog and downloads oversized remote imagery. Lighthouse estimates roughly 989 KiB of image-delivery savings and about 69 KiB of unused JavaScript.
- **UX/accessibility commentary:** Information architecture is coherent. Current production audit still finds select elements without associated labels; some filter chips are below the recommended 44-point default control size.
- **Status:** **Partial**. Preserve the simple IA; paginate/progressively reveal results, optimize images, and fix accessible naming.

### 7.4 Scan Your Stack

- **Customer experience:** In the native app, the customer takes or selects a photo, reviews recognized bottles and confidence, and manually confirms products by adding them. Unresolved items route to catalog search.
- **Logic and data:** The client compresses common image formats to at most 1600 px and rejects uploads above 4 MiB. The authenticated API sends an in-memory data URL to OpenAI with `store: false`, then maps recognized labels to the canonical catalog. It does not automatically add products.
- **Metadata/events today:** The response includes `scannedAt`, matched count, and unresolved count, but no durable operational event. The image itself is not stored by SuppStack.
- **Performance commentary:** The API allows up to 60 seconds and has no visible percent/progress or measured latency distribution. There is no rate limit or request-cost guard beyond authentication and size.
- **UX/privacy commentary:** Manual confirmation is the correct integrity control. The screen does not explicitly disclose, immediately before upload, that the photo is sent to OpenAI for processing; Apple requires disclosure and explicit permission for third-party AI sharing of personal data.
- **Status:** **Risk** until disclosure/consent, rate limiting, and failure telemetry exist.

### 7.5 Product evaluation, save, and recently viewed

- **Customer experience:** A product page shows brand, price, serving plan, ingredient composition, source/merchant status, reviews, and actions to add, buy, or save.
- **Logic and data:** Catalog products are resolved to a database identity only when persisted behavior requires it. Save and recently viewed are bounded device-local snapshots.
- **Metadata/events today:** No product-view analytics event is sent. Local history is product functionality and must not be silently repurposed as analytics.
- **Performance commentary:** Client-only dynamic product pages sacrifice server metadata and can trigger database identity work for signed-in visitors. Remote images are often unoptimized.
- **UX/accessibility commentary:** The product decision is clear and mobile purchase bar is appropriately sized. Compact add controls remain 40×40; dynamic product titles/descriptions and social previews are missing.
- **Status:** **Partial**.

### 7.6 Add a product and configure the personal stack

- **Customer experience:** A signed-in customer taps Add. The product becomes active with daily default settings; they may edit servings/schedule or pause/stop/remove it.
- **Logic and data:** A curated product is first materialized through an authenticated server Adapter. The client then inserts `users_products` and upserts `user_supplement_settings` sequentially.
- **Metadata/events today:** The database rows are customer records, not analytics events. Success is a toast; failure is a generic toast and console error.
- **Performance commentary:** Product cards independently check membership, causing repeated queries. The shared ingredient context correctly avoids one composition fetch per card.
- **UX/data commentary:** The action is simple and overlap feedback is useful. Because membership/settings are not one transaction, retry semantics and partial-state repair are undefined.
- **Status:** **Risk** for data integrity. Move aggregate mutations behind one database command/RPC with idempotency.

### 7.7 Daily log and unlog

- **Customer experience:** The Stack tab shows today’s active products. Each is a one-tap checkoff with completion and weekly context; a second tap removes the log.
- **Logic and data:** The client inserts/deletes `supplement_logs`; a database trigger updates `daily_tracking_summary`; streak is also recomputed in the client for the header.
- **Metadata/events today:** The log is the authoritative customer record. There is no separate coarse success/failure/latency event.
- **Performance commentary:** Local state updates after server confirmation, so feedback waits on the network and has no offline queue. Stats issue three additional queries after mutations.
- **UX/accessibility commentary:** The core ritual is clear. The log button compresses to scale 0.92, which is excessive motion, and there is no explicit pending state scoped to a single product. Failure leaves the record unchanged and shows a retryable toast.
- **Data commentary:** Duplicate logs, timezone mismatch, and ignored schedule days can make displayed adherence disagree with raw history.
- **Status:** **Risk** until the date model, uniqueness, schedule evaluation, and idempotent/offline mutation behavior are corrected.

### 7.8 Intake, adherence, streak, and restock understanding

- **Customer experience:** Customers see weekly completion, streak, ingredient totals/overlaps, and estimated days until restock.
- **Logic and data:** Ingredient intake is a pure computation over active products and composition edges. Weekly completion is derived from logs and a constant active-product count. Restock estimates combine container size, planned servings, recent logged servings, and elapsed time since start.
- **Metadata/events today:** No insight-view events exist. This is acceptable until a specific product decision requires measurement.
- **Performance commentary:** Several related Supabase reads run independently. The computation itself is small and pure.
- **UX/data commentary:** Ingredient mixed units and unquantified edges are honestly flagged. Restock language currently sounds more certain than the model warrants; pauses, missed days, container resets, and actual purchase dates are not represented.
- **Status:** Ingredient intake **Implemented**; adherence/restock **Partial/Risk**.

### 7.9 Published stacks, reviews, likes, follows, and sharing

- **Customer experience:** Customers can publish/copy/share named supplement stacks and submit product reviews; public visitors can read approved content.
- **Logic and data:** Public content is stored in `stacks`, `stack_supplements`, `product_reviews`, likes, follows, and database-maintained like/follower counters. View/copy counters are client read-then-write.
- **Metadata/events today:** View/copy/like counts function as product metadata, not a trustworthy event ledger.
- **Performance commentary:** Stack detail loads the stack and related stacks sequentially. Public counter mutations may be denied by RLS or lose concurrent updates.
- **UX/safety commentary:** There is no report-content action, block-user action, moderation queue, or contact-backed response workflow. Reviews default `is_approved=true`.
- **Status:** **Risk** under Apple’s UGC expectations. Either build the complete safety Module or remove/privatize the shallow social surface. The deletion test favors removing public social behavior if it is not core.

### 7.10 Physical-product checkout

- **Customer experience:** The customer selects Buy and completes the physical-goods purchase on the independent merchant’s visible checkout surface.
- **Logic and data:** Shopify/UCP discovery is attempted only for allowlisted merchant hosts; otherwise the app creates a verified fallback purchase session. The native app opens checkout in `SFSafariViewController`.
- **Metadata/events today:** `commerce_checkout_events` stores provider, mode, status, URLs, quantity, product/brand, and capability messages through a service-role-only sink. It does not prove purchase completion and currently has no authenticated user attribution.
- **Performance commentary:** Checkout resolution is awaited before browser open, which can exhaust the direct user-activation window on web; fallback behavior mitigates it. Quantity is lower-bounded but not upper-bounded.
- **UX/security commentary:** Merchant allowlisting is a strong SSRF control. Errors fall back to a purchase URL, which favors completion but can hide service degradation unless operationally measured.
- **Status:** **Partial**. Keep the audit distinction between route resolution and merchant conversion.

### 7.11 Premium purchase, restore, and access

- **Customer experience:** Native customers see Apple-localized price, purchase with IAP, restore previous purchases, and manage App Store subscriptions. Core logging history remains free.
- **Logic and data:** RevenueCat handles purchase state. A signed webhook mirrors entitlements to a table clients can only read. Access checks respect cancellation through the paid period.
- **Metadata/events today:** The mirrored row retains coarse RevenueCat event context. There is no durable raw event ledger or idempotency key.
- **Performance commentary:** After purchase/restore the UI waits four seconds and refetches once, so a delayed webhook can leave the local “purchased” state ahead of the server mirror.
- **UX/data commentary:** Restore exists and purchase cancellation is non-fatal. Offering load failure produces “not available” without a support diagnostic code.
- **Status:** **Partial**.

### 7.12 Apple Health

- **Customer experience:** The customer explicitly opens Apple Health, taps Connect, grants selected permissions, and sees 14-day on-device averages.
- **Logic and data:** The native Adapter requests read access only and computes sleep/body/activity summaries in memory. The web app displays the returned object; no Supabase health tables remain.
- **Metadata/events today:** No health event or metric is sent to the backend. This is the correct default.
- **Performance commentary:** Multiple HealthKit queries run concurrently and resolve as a group. There is no timeout or query-level diagnostic.
- **UX/privacy commentary:** Just-in-time permissioning and no persistence are strong. `NSHealthUpdateUsageDescription` claims writes that do not occur; the read purpose and privacy policy mention “ranking opportunities,” while current UI only shows metrics beside generic goal links. Purpose strings must match actual use exactly.
- **Status:** Core privacy architecture **Implemented**; metadata **Risk**.

### 7.13 Profile, support, sign-out, and account deletion

- **Customer experience:** A customer edits optional identity/body details, signs out, gets support, or types DELETE to permanently remove the account.
- **Logic and data:** Production still upserts profile fields directly. The next release routes get/create and edit through atomic authenticated database commands and stores optional body data in `user_private_profiles`; deletion authenticates the bearer token, removes the profile, then calls Supabase Admin delete so the private row cascades.
- **Metadata/events today:** Deletion has no durable operation record or customer-visible receipt. Errors return raw database/admin messages to the client.
- **Performance commentary:** Profile loads after auth and can show a full-screen spinner without an inline recovery action.
- **UX/privacy commentary:** In-app deletion satisfies a major App Store requirement. Public-profile RLS currently undermines the privacy of optional DOB/gender/height/weight fields. The privacy policy also says stacks are private even though published stacks default public.
- **Status:** Deletion **Implemented/Partial**; profile privacy **Risk**.

## 8. Event and metadata contract

### Principle

Customer records answer **what happened to the customer’s data**. Telemetry answers **whether the product journey worked**. Never duplicate private records into analytics merely because it is convenient.

### Current instrumentation

| Existing signal | Purpose | Limitation |
| --- | --- | --- |
| `supplement_logs` | Authoritative daily behavior | Product data, not operational analytics. |
| `commerce_checkout_events` | Checkout route audit | No conversion proof, no event idempotency, no funnel continuity. |
| RevenueCat entitlement metadata | Billing debugging | Latest state only; no ordered event ledger. |
| `console.error` | Developer debugging | Not queryable, release-aware, or durable. |
| Local saved/recent snapshots | Customer convenience | Device-local and must not be repurposed silently. |

### Minimal canonical event set

Do not add an event for every tap. Start with these outcome events:

| Event | Fires when | Allowed properties | Explicitly forbidden |
| --- | --- | --- | --- |
| `app_ready` | First usable screen is rendered | launch type, duration, platform, app/build/web release, outcome | email, user-entered content |
| `auth_result` | Apple/Google flow ends | provider, outcome, duration, stable error code | token, email, Apple user identifier |
| `search_result` | Submitted search returns | result count bucket, filter/sort, duration | raw search query |
| `scan_result` | Photo recognition ends | outcome, duration, image-size bucket, matched/unresolved counts | image, OCR text, recognized health interests |
| `stack_mutation_result` | Add/remove/settings command ends | operation, outcome, duration, product identifier, error code | dosage notes, stack title, free text |
| `daily_log_result` | Log/unlog command ends | operation, outcome, duration, retry/offline flags | date history, servings, supplement name in third-party analytics |
| `checkout_result` | Purchase route is resolved/opened | provider, mode, product identifier, duration, outcome | payment/shipping data |
| `entitlement_result` | Offer/purchase/restore/convergence ends | operation, store, product id, duration, outcome | receipt, Apple account data |
| `account_delete_result` | Deletion request ends | outcome, duration, stable error code | user profile contents |
| `unexpected_error` | A handled critical journey fails | journey, operation, release, stable fingerprint | tokens, request bodies, health data, photos, free text |

HealthKit values and permissions are excluded from remote telemetry by default. If a concrete reliability need later justifies `health_connect_result`, it requires explicit diagnostic consent and may contain only outcome/duration/error code—never metric values, requested categories, or user identity.

### Event envelope

Every event uses:

```text
event_id          client-generated UUID; deduplicates retries
event_name        one of the canonical names above
schema_version    integer, beginning at 1
occurred_at       UTC timestamp
session_id        random, short-lived, not an advertising identifier
journey           stable journey name
platform          ios | ipados | web
app_version       native marketing version when present
build_number      native build when present
web_release_id    immutable deployment identifier
route             normalized route template, never the full URL
outcome           success | cancelled | failed | timeout | offline
duration_ms       bounded integer
error_code        stable application code, never raw provider text
properties        allowlisted event-specific values only
```

### Consent, retention, and ownership

- Necessary security/billing audit records are separated from optional product analytics.
- Optional analytics defaults to off until the customer makes an informed choice and has an in-app withdrawal control.
- Never use IDFA or cross-app tracking.
- Never send a Supabase auth token, email, name, raw URL, raw search term, photo, free text, or HealthKit value.
- Pseudonymous user correlation, if needed, is created server-side and never shared across processors.
- Raw operational events retain for 30 days by default; aggregate release metrics retain for 13 months. Any exception is documented here and in the privacy policy.
- The privacy policy and App Store privacy answers must name every processor receiving telemetry before collection begins.

## 9. Performance and reliability contract

These are internal targets, not claims that the app meets them today.

| Signal | Target | Current evidence |
| --- | --- | --- |
| Web LCP | p75 ≤ 2.5 s | Lab mobile LCP 3.6 s on Aug 30: **miss** |
| Web INP | p75 ≤ 200 ms | No field measurement: **unknown** |
| Web CLS | p75 ≤ 0.1 | Lab CLS 0: **pass in lab** |
| Native cold launch to usable UI | p75 ≤ 2.0 s; p95 ≤ 4.0 s | No MetricKit/Xcode Organizer baseline: **unknown** |
| Auth provider sheet presentation | p95 ≤ 1.0 s after tap | Not measured |
| Auth session convergence | p95 ≤ 5 s; hard timeout 20 s | Timeout implemented; percentile unknown |
| Normal read API | p95 ≤ 800 ms | Not measured |
| Critical write confirmation | p95 ≤ 1.2 s | Not measured; no optimistic/offline layer |
| Photo scan | p95 ≤ 15 s; hard timeout ≤ 60 s | Server maximum 60 s; percentile unknown |
| Crash-free sessions | ≥ 99.8% | No crash telemetry |
| Hang-free sessions | ≥ 99.5% | No MetricKit/Organizer tracking |
| Critical mutation loss | 0 | Cannot be demonstrated without idempotency and tests |

Performance work order:

1. instrument field Web Vitals and native launch/hang/crash metrics without collecting private health content;
2. fix image delivery and progressively reveal the catalog;
3. reduce the global client-provider and route JavaScript surface;
4. remove per-card membership queries in favor of one membership index;
5. parallelize independent route reads and add route-level loading/error recovery;
6. protect budgets in CI and compare every release.

## 10. UX and accessibility contract

### What already works

- three-job mobile navigation: Shop, Stack, You;
- comprehensive safe-area handling and `100dvh` use;
- clear Apple-first authentication with large primary controls;
- visible pending and failure feedback for major actions;
- manual confirmation before scan matches enter a stack;
- reduced claims around research-only peptides and merchant checkout;
- good layout stability and generally useful image alt text/focus styling.

### Required standard

- Default iOS/iPadOS control targets are at least 44×44 points; smaller visible glyphs must have a 44-point hit area.
- Every control has a programmatic name, role, state, and focus indication.
- One visible `main` landmark per page, with ordered headings.
- Dynamic changes are announced where necessary; combobox active options use `aria-activedescendant` correctly.
- Reduced Motion disables nonessential scrolling/transforms and never removes state feedback.
- Text zoom and Dynamic Type equivalents do not clip at 200%.
- Errors are inline, actionable, persistent long enough to read, and never rely on color alone.
- Every indefinite spinner has a timeout or escape path.
- iPad split-screen, landscape, external keyboard, VoiceOver, Switch Control, and low-connectivity behavior are part of release testing.

Known failures include unlabeled select controls, 40-point compact add actions, 36-point chips, 0.92 press scaling, nested main landmarks, incomplete reduced-motion handling, and no automated accessibility regression test.

## 11. Security, privacy, and App Store contract

### Existing strengths

- service-role credentials are used only in server routes;
- private user tables use owner-scoped RLS;
- catalog and ingredient writes are service-role-only and client grants are narrowed;
- checkout discovery uses a catalog merchant allowlist to prevent arbitrary-host probing;
- HealthKit is read on demand and not persisted;
- account deletion is available in app;
- Sign in with Apple is equivalent to Google login;
- physical product checkout is visibly external; digital Premium uses Apple IAP and supports restore;
- Swift package resolution is pinned for reproducible Xcode Cloud builds.

### Release gates

| Gate | Required proof | Current status |
| --- | --- | --- |
| Private profile isolation | Anonymous/authenticated RLS tests proving sensitive columns cannot be read publicly | **In progress**: expand migration, caller cutover, and contract-test scaffold built; contract migration and deployed proof remain |
| UGC safety | Report, block, filtering/moderation, response contact—or removal of public UGC | **Fail** |
| HealthKit truthfulness | Read-only purpose string, no update purpose key, UI/privacy/App Store copy aligned | **Fail** |
| AI photo consent | Just-in-time disclosure naming third-party AI processing and no-storage behavior | **Fail** |
| Account deletion | Clean retryable E2E test and full cascade verification | **Partial** |
| Auth | Clean-install iPhone+iPad success/cancel/timeout/retry | **Manual evidence only** |
| IAP | Sandbox purchase, cancel, restore, renewal/expiration convergence | **Manual/unknown** |
| IPv6-only | NAT64 test of app, auth, Supabase, checkout | **Unknown** |
| Privacy manifest/report | Archive privacy report reviewed for every SDK | **Unknown** |
| Backend availability | Production health checks and alerting during review | **Partial** |

### Metadata alignment defects

- Root metadata is generic and most product, supplement, brand, search, Premium, terms, and profile routes have no route-specific metadata.
- There is no repository-owned `robots.ts` or `sitemap.ts`.
- The privacy policy says supplement “stacks” are private even though published stacks default public; it also references Health opportunity rankings that the current UI does not implement.
- The privacy policy does not disclose OpenAI photo processing or RevenueCat billing processing.
- `NSHealthUpdateUsageDescription` describes a write capability the app does not use.
- `NSHealthShareUsageDescription` mentions ranking supplement opportunities, while the current Health screen displays on-device summaries beside generic goal links.
- App Store privacy answers must reflect processor behavior across Supabase, Vercel, RevenueCat, OpenAI scan processing, Apple/Google auth, and merchant handoff.

## 12. Prioritized risk register

| ID | Priority | Risk | Required resolution | Status |
| --- | --- | --- | --- | --- |
| DI-01 | P0 | Public profile policy exposes private columns | Keep `user_profiles` as the public identity Interface; move optional body/account fields to owner-only `user_private_profiles`; use authenticated commands; contract away legacy columns/grants after client convergence; prove with database tests. | In progress |
| UGC-01 | P0 | Reviews/public stacks lack report, block, and moderation | Build the complete safety Module or remove/privatize the public UGC surface before relying on it. | Open |
| PR-01 | P0 | AI photo is shared without explicit just-in-time third-party disclosure | Add consent/disclosure, processor/privacy updates, retention statement, and rate/cost limits. | Open |
| DI-02 | P0 | Daily tracking can duplicate or misdate records | Define customer timezone, add idempotency/uniqueness, and use one date function from UI through database. | Open |
| DI-03 | P0 | Schedule days and setting changes do not drive summaries | Centralize planned-for-date rules and rebuild summaries on both plan and log mutation. | Open |
| DI-04 | P1 | Aggregate writes are non-atomic | Introduce database commands/RPCs for membership+settings and published-stack aggregates. | Open |
| BILL-01 | P1 | RevenueCat webhook can regress on duplicate/out-of-order delivery | Persist provider event ID/timestamp, reject stale events, and add reconciliation. | Open |
| META-01 | P1 | HealthKit purpose strings/privacy copy mismatch implementation | Make all metadata accurately describe read-only, on-device display. | Open |
| TEST-01 | P1 | No application/RLS/E2E test suite | Add unit, database policy, integration, native auth/IAP, and critical journey tests in CI. | Open |
| OBS-01 | P1 | No structured crash/hang/performance/failure telemetry | Implement the minimal consent-aware contract in section 8. | Open |
| PERF-01 | P1 | Mobile LCP 3.6 s and large image payload | Optimize image pipeline and initial catalog rendering; add field metrics and budgets. | Open |
| SEC-01 | P1 | Scan/checkout APIs lack comprehensive rate and quantity limits | Add authenticated/user/IP cost controls, input schemas, body limits, and stable error codes. | Open |
| UX-01 | P1 | Accessibility failures remain | Fix names, hit areas, landmarks, motion, keyboard/VoiceOver paths; automate checks. | Open |
| OFF-01 | P2 | Daily log requires live network | Add an append-only local mutation queue with operation IDs, visible sync state, and server idempotency. | Planned |
| META-02 | P2 | Dynamic metadata, sitemap, and release metadata coverage are thin | Add route metadata and a release checklist tied to this file. | Open |
| DEP-01 | P2 | Dependency audit reports `nanoid <3.3.18` through PostCSS | Update the lockfile/dependency chain, then rerun build and production audit; runtime exploitability appears limited but is not accepted as clean. | Open |

## 13. Execution roadmap

This roadmap is ordered by customer trust and data correctness, not visual novelty. A phase is complete only when its exit evidence is recorded in the progress ledger. “Built” does not mean “deployed,” and “deployed” does not mean “verified.”

### Release rule while version 1.1 is in review

The native app remotely loads the production web client. A production web deployment can therefore alter the binary Apple is reviewing. Keep the current production experience stable while submission `b1f62173-5238-4eb0-8268-2d408618e660` is waiting for review unless a rollback-worthy incident requires intervention. Build and validate roadmap changes without publishing them; sequence database and web cutovers after the review state is known.

### Sequenced phases

| Phase | Outcome | Owner | Build order | Exit evidence | Status |
| --- | --- | --- | --- | --- | --- |
| 0. Review containment | The submitted Apple-login fix remains stable and review evidence is preserved. | iOS/release | Monitor review; retain clean-install iPhone/iPad auth evidence; avoid unrelated production changes. | Review decision recorded; any rejection reproduced and resolved with device/build evidence. | Active |
| 1. Trust foundation | Public identity, private account data, AI processing, HealthKit metadata, and public-content obligations are truthful and enforceable. | Backend + privacy + iOS | DI-01 staged profile split; PR-01 scan disclosure/privacy update; META-01 purpose strings; decide whether to deepen or remove public UGC. | Zero failing P0 privacy/policy tests; anonymous/authenticated negative proofs; privacy copy, binary metadata, and App Store answers agree. | In progress |
| 2. Deterministic tracking | Add/configure/log/summary uses one clock, one plan rule, idempotent commands, and reproducible projections. | Backend/domain | DI-02 date/uniqueness command; DI-03 schedule evaluator and summary rebuild; DI-04 atomic membership/settings; operation IDs. | Database invariant tests cover concurrency, timezone travel, settings changes, retry, and projection rebuild. | Planned |
| 3. Recovery and verification | Critical journeys fail safely and can be proven before release. | Engineering/release | Test harness; route contracts; account-delete cascade/retry; web E2E; native auth/IAP/offline matrix; CI release gates. | Automated layers in section 15 pass; manual device evidence linked; rollback exercised. | Planned |
| 4. Operational quality | The team can detect regressions without collecting sensitive content; launch and core actions meet budgets. | Platform + UX | Privacy-typed telemetry Adapter; crash/hang/RUM; image/initial-load work; accessibility fixes; route recovery states. | Field p75/p95 and crash/hang baselines exist; LCP/accessibility budgets pass; no forbidden telemetry properties. | Planned |
| 5. Durable business systems | Billing and catalog identity remain correct under replay, delay, and data change. | Backend | Ordered RevenueCat event ledger/reconciliation; immutable catalog identity at the persistence Seam; remaining security limits. | Duplicate/out-of-order billing tests pass; catalog foreign keys no longer depend on mutable natural keys; clean dependency/security audit. | Planned |

### Phase 1 implementation slice now underway

| Slice | Change | Dependency | Completion rule | Status |
| --- | --- | --- | --- | --- |
| 1A. Expand database | Preflight duplicate profile owners; add unique owner index, owner-only `user_private_profiles`, backfill/mirroring, hardened ownership helper/policies, follower trigger, and authenticated get/create/update commands. | Local database verification before any linked push. | Migration 0026 and its contract tests pass against a production-shaped local database. | Built; not applied |
| 1B. Cut over callers | Make the Account Profile Module the only ownership/profile-write Interface; remove public `user_id` selections from reviews, follows, likes, stacks, and public types. | 1A deployed first. | Lint/build pass; profile edit and public embedded identity smoke tests pass; remote release is deployed and stable. | Built; verification in progress |
| 1C. Contract database | Final backfill; remove compatibility trigger and legacy DOB/gender/height/weight columns; revoke direct client insert/update and `user_id` selection; grant only explicit public identity columns. | 1B remote release convergence and rollback checkpoint. | Anonymous and authenticated cross-account reads/writes fail; own command paths, follows, likes, reviews, deletion, and public stack identity pass. | Planned; deliberately not auto-applied |
| 1D. Processor truth | Add just-in-time OpenAI photo disclosure, rate/cost controls, privacy-policy processor disclosures, and accurate RevenueCat/HealthKit metadata. | Product copy and binary metadata review. | UI, privacy policy, privacy manifest/report, purpose strings, and App Store answers match observed data flow. | Planned |
| 1E. UGC decision | Either build moderation/report/block/contact response as a deep safety Module or privatize/remove public reviews/social stacks. | Explicit product decision. | Apple UGC requirements are implemented and manually verified, or no public UGC surface remains. | Decision required |

### Roadmap operating rules

1. Do not start a later phase to avoid a failing earlier exit gate.
2. Every mutation is designed from its database invariant and retry behavior before UI work.
3. Every database contract change uses expand/cutover/contract when old and new clients can overlap.
4. Every release records immutable app/build/web identifiers and evidence in this file.
5. New frontend work must shorten the core journey, expose necessary recovery, or enforce a documented invariant.

## 14. Architecture deepening opportunities

These are structural candidates, not permission to add product scope.

### Opportunity 1: Split public identity from private body/account data

**Files:** `supabase/migrations/20260101000001_core_schema.sql`, a new migration, `src/lib/account/profile.ts`, public review/stack selects  
**Problem:** One `user_profiles` Interface serves both public creator identity and private account/body data. RLS protects rows, not fields, so the public policy exposes too much. The Module lacks depth because every caller can see the full shape.  
**Solution:** Keep `user_profiles` as the narrow public identity table so existing foreign keys remain stable; move private details into owner-only `user_private_profiles`; place get/create/update behind authenticated database commands; revoke wildcard grants in the contract phase.  
**Benefits:** High **Leverage** across account, reviews, stacks, and deletion; strong **Locality** for privacy rules; a smaller public Interface that hides private Implementation details.

### Opportunity 2: Create one tracking command Module

**Files:** `useProductInStack.ts`, `useSupplementLogs.ts`, `useSupplementSettings.ts`, tracking migration/trigger  
**Problem:** The same business action crosses multiple client hooks and tables. Date, schedule, idempotency, and summary rules have low Locality.  
**Solution:** Add database commands such as `add_stack_product`, `remove_stack_product`, and `set_daily_log`, each transactionally enforcing invariants and returning the new projection. Keep the React hooks as thin Adapters.  
**Benefits:** High **Leverage** over every daily interaction; deepens the Module; makes retry/offline reconciliation possible; removes client orchestration.

### Opportunity 3: Make published stacks a real aggregate—or delete the shallow social layer

**Files:** `useStacks.ts`, stack/social migrations, stack/review UI  
**Problem:** Parent/child writes, copy behavior, and counters are distributed and non-atomic. Public content also creates moderation obligations.  
**Solution:** If public stacks remain core, place create/update/copy/counter operations behind transactional database Interfaces and add moderation/report/block. If not, make stacks private and delete likes/follows/public reviews.  
**Benefits:** Passes the deletion test: either a deep, trustworthy Module or less code and less App Review/privacy surface.

### Opportunity 4: Introduce an ordered billing event ledger

**Files:** RevenueCat webhook, billing migration, entitlement helper  
**Problem:** The latest webhook directly overwrites the projection without a provider event ID or monotonic ordering.  
**Solution:** Store each unique provider event, apply it idempotently in provider-time order, then derive/reconcile the entitlement projection.  
**Benefits:** High billing **Leverage**, auditability, replay, and strong separation between immutable inputs and mutable projection.

### Opportunity 5: Create a privacy-typed telemetry Adapter

**Files:** new `src/lib/telemetry/*`, native release metadata bridge, critical journey hooks/routes  
**Problem:** Errors are unstructured while adding a generic analytics SDK would make over-collection easy.  
**Solution:** Implement only the allowlisted events and properties in section 8 using discriminated TypeScript types, consent state, redaction at the telemetry Seam, and a first-party server endpoint.  
**Benefits:** A narrow Interface makes the safe action easy, hides processor Implementation, and provides high operational Leverage without polluting domain Modules.

### Opportunity 6: Collapse catalog identity at the persistence Seam

**Files:** `supplement-sync.ts`, `catalog-db-sync.ts`, catalog migrations, product/ingredient types  
**Problem:** Static IDs, database serial IDs, aliases, names, and URLs all participate in identity resolution. Natural-key drift is handled repeatedly.  
**Solution:** Assign immutable catalog UUIDs/keys to supplements and products, persist them with unique constraints, and make all Adapters translate once at ingress.  
**Benefits:** Better Locality, fewer race paths, simpler foreign-key reasoning, and a deeper catalog Module.

## 15. Test and release strategy

### Required test layers

1. **Pure unit tests:** ingredient unit buckets, schedule evaluation, timezone/date keys, streaks, entitlement rules, restock estimation.
2. **Database invariant tests:** uniqueness, transactions, trigger recalculation, grants, public/private RLS, account cascade, immutable catalog writes.
3. **Route contract tests:** auth required, input/body limits, stable error codes, webhook idempotency, SSRF allowlist, scan no-store behavior.
4. **Web E2E:** guest browse, login redirect, add/configure/log/unlog, failure/retry, checkout handoff, delete account.
5. **Native E2E/manual release matrix:** clean/update installs on iPhone and iPad; Apple/Google login; cancellation; offline launch; rotation/split view; HealthKit deny/allow/revoke; IAP purchase/cancel/restore; VoiceOver and keyboard.
6. **Performance/accessibility:** Lighthouse budgets, field Web Vitals, Xcode Organizer/MetricKit, automated axe checks plus manual assistive-technology testing.

### Minimum release gates

- clean lint, TypeScript, production build, catalog integrity, ingredient checks, and dependency audit;
- zero failing P0 database/security/privacy tests;
- critical E2E paths pass on current shipping iOS/iPadOS and the App Review device class;
- production backend health and auth verified immediately before submission;
- App Store screenshots, description, privacy answers, purpose strings, IAP status, review notes, and this document agree;
- rollback exists for both web deployment and database migration;
- every deployed web release has an immutable ID and is recorded below.

## 16. Progress ledger

| Date | Area | Change/evidence | Result | Next |
| --- | --- | --- | --- | --- |
| 2026-08-13 | App Review | Version 1.1 build 55 rejected under Guideline 2.1(a): Apple login loaded indefinitely on iPad Air 11-inch (M3). | Rejected | Replace browser/deep-link Apple auth with native flow. |
| 2026-08-27 | Authentication | Native `AuthenticationServices` plugin, cryptographic nonce, direct Supabase ID-token exchange, cancellation/error recovery, and 20-second session timeout committed in `3e097f3`. | Implemented | Maintain clean-install iPhone/iPad test evidence. |
| 2026-08-27 | Build reproducibility | Swift package resolution pinned in `c7de5de`; Xcode Cloud can resolve RevenueCat packages with automatic resolution disabled. | Implemented | Keep `Package.resolved` updated with plugin upgrades. |
| 2026-08-28 | App Store | Version 1.1 build 60 submitted. Submission `b1f62173-5238-4eb0-8268-2d408618e660`. | `WAITING_FOR_REVIEW` as verified Aug 30 | Monitor review; do not equate approval with full quality closure. |
| 2026-08-30 | Code verification | ESLint, TypeScript/Next production build, 121-supplement/341-product catalog integrity, and ingredient intake checks all pass. | Pass | Add real test layers. |
| 2026-08-30 | Dependency security | Production audit reports one high advisory: transitive `nanoid 3.3.16` via PostCSS, fixed in `>=3.3.18`. | Open | Update dependency/lock and re-audit. |
| 2026-08-30 | Production performance | Mobile Lighthouse: performance 81, accessibility 94, best practices 100, SEO 100; FCP 3.5 s, LCP 3.6 s, TBT 100 ms, CLS 0, 1.72 MB transferred. | Needs improvement | Instrument field data; fix images/initial catalog. |
| 2026-08-30 | Data/privacy audit | Anonymous production API can select private-profile columns from public profiles; aggregate check found zero public rows with a populated DOB/gender/height/weight at audit time. | P0 design risk; no populated exposure observed | Split public/private profile Interfaces before collecting those values. |
| 2026-08-30 | Canonical documentation | Customer journey, architecture, invariants, telemetry contract, release gates, and risk register established here. | Implemented | Update this ledger with every material change. |
| 2026-08-31 | Profile trust foundation | Added the phase-1 roadmap; built additive migration 0026, owner-only private profile storage, ownership/policy hardening, atomic authenticated profile commands, Account Profile caller cutover, and source/database contract checks. | Lint, production build, catalog, and ingredient checks pass; database test is not executed; not deployed or contract-complete | Run migration/tests on local Supabase; after App Review, apply expand migration, deploy/cut over, verify convergence, then build/apply the contract migration. |
| 2026-09-04 | App Review | Apple paused build 60 under Guideline 2.1 because the prior metadata offered no demo account for the expired-subscription purchase path. Added an existing-account email/password sign-in path, provisioned a dedicated expired-Premium review account, deployed the production interface, saved credentials/navigation notes in App Store Connect, and replied to App Review. | Build 60 resubmitted after the item returned to `READY_FOR_REVIEW` | Keep the review account unchanged and monitor App Review. |

## 17. Official standards baseline

This audit uses the following living primary sources; re-check them during every major release:

- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) — completeness, metadata, UGC, login, IAP, privacy, HealthKit, and account deletion.
- [Apple Human Interface Guidelines: Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) — control sizing and assistive interaction.
- [Apple HealthKit: Protecting user privacy](https://developer.apple.com/documentation/healthkit/protecting_user_privacy) — purpose strings, permission, disclosure, and data restrictions.
- [Apple: Improving your app’s performance](https://developer.apple.com/documentation/xcode/improving-your-app-s-performance/) — Organizer, MetricKit, testing, and continuous measurement.
- [Apple: Manage app privacy](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/) — App Store privacy answers and processor coverage.
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) — RLS plus least-privilege grants and policy testing.
- [Supabase production checklist](https://supabase.com/docs/guides/deployment/going-into-prod) — production security and availability checks.
- [Core Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds) — LCP, INP, and CLS targets at the 75th percentile.
- [Next.js App Router documentation](https://nextjs.org/docs/app) — server/client boundaries, metadata, route handlers, loading, and error conventions.

## 18. Definition of “best mobile app” for SuppStack

SuppStack reaches that bar when a customer can reliably record today’s supplement behavior in seconds, trust that the record is private and correct across devices/timezones/retries, understand exactly which conclusions are facts versus estimates, recover from every network/auth/payment failure, and delete the account completely—while the team can prove those properties with tests and release telemetry.

The bar is not more screens. It is fewer ambiguous states, deeper Modules, smaller public Interfaces, atomic writes, privacy by construction, and measurable customer outcomes.
