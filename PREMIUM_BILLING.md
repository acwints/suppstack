# Premium subscriptions (RevenueCat)

SuppStack Premium gates the operational stack layer (adherence trends,
restock reminders, and cost analytics) behind a subscription. The marketplace,
wiki, stacks, and daily supplement logging stay free.

## Architecture

RevenueCat is the billing system of record; the app never talks to it on the
read path.

```
Web:  /premium → RevenueCat Web Billing purchase link (Stripe under the hood)
iOS:  @revenuecat/purchases-capacitor → Apple IAP (see branch cursor/ios-app-store-c1c7)
                       │
                       ▼
      RevenueCat webhook → POST /api/billing/revenuecat
                       │     (auth: REVENUECAT_WEBHOOK_AUTH_TOKEN,
                       │      writes with SUPABASE_SERVICE_ROLE_KEY)
                       ▼
      user_entitlements table (migration 0005, RLS: user reads own row)
                       │
                       ▼
      usePremium() hook → <PremiumGate> around premium features
```

Key properties:

- **One entitlement across platforms.** Clients identify to RevenueCat with
  the Supabase user id as `app_user_id`, so a web subscription unlocks the
  iOS app and vice versa.
- **Server-authoritative.** Clients can only *read* their entitlement row;
  all writes go through the webhook with the service-role key. Nobody can
  grant themselves premium from the browser.
- **Degrades gracefully.** Until the env vars are configured, the pricing
  page shows "launching soon" and the webhook returns 503 — nothing breaks.

## Setup checklist

1. **Create a RevenueCat project** (app.revenuecat.com) with an entitlement
   named `premium` — the identifier the code expects
   (`PREMIUM_ENTITLEMENT` in `src/lib/billing/entitlements.ts`).
2. **Web Billing:** connect Stripe, create a `premium_monthly` product at
   $4.99/mo, attach it to the `premium` entitlement, and create a purchase
   link. Put the link (without the trailing app-user segment) in
   `NEXT_PUBLIC_PREMIUM_CHECKOUT_URL`. The app appends `/<supabase-user-id>`
   so purchases attribute automatically.
3. **Webhook:** Integrations → Webhooks → URL
   `https://<your-domain>/api/billing/revenuecat`, Authorization header set
   to the value you generate for `REVENUECAT_WEBHOOK_AUTH_TOKEN`
   (`openssl rand -base64 32`).
4. **Env vars on Vercel:** `REVENUECAT_WEBHOOK_AUTH_TOKEN`,
   `NEXT_PUBLIC_PREMIUM_CHECKOUT_URL`, optionally
   `NEXT_PUBLIC_PREMIUM_MANAGE_URL` (customer portal link), plus the existing
   `SUPABASE_SERVICE_ROLE_KEY`.
5. **Database:** apply `supabase/migrations/20260101000005_billing.sql`
   (`supabase db push`).
6. **iOS (code is wired — owner-side setup remains):** the app already ships
   `@revenuecat/purchases-capacitor` (registered in the native shell's
   Package.swift) plus a bridge in `src/lib/billing/native-purchases.ts`.
   `AuthContext` identifies the SDK with the Supabase user id after login,
   and `/premium` shows a native Subscribe button (with Apple's localized
   price) and the App-Review-required Restore Purchases action. To activate:

   1. App Store Connect → the SuppStack AI app → Subscriptions: create a
      subscription group and an auto-renewable subscription (e.g. product id
      `premium_monthly_ios`, $4.99/mo). Fill in localization + review notes.
   2. RevenueCat → project → add an **Apple App Store** app for bundle id
      `app.suppstack`, upload the App Store Connect API key (or shared
      secret), and import the product.
   3. Attach the product to the `premium` entitlement and add it as the
      first package of the **default offering** (the app buys
      `offerings.current.availablePackages[0]`).
   4. Set `NEXT_PUBLIC_REVENUECAT_APPLE_API_KEY` (the RevenueCat *public*
      Apple SDK key, `appl_...`) in Vercel Production and redeploy. Until it
      is set the iOS paywall shows "not available in this version" and
      nothing breaks.
   5. On the Mac: `npm install && npm run ios:sync`, open Xcode, bump the
      Build number, archive, upload — the native binary changed, so this
      needs a new App Store build (see APP_STORE_SUBMISSION.md).
   6. Sandbox-test on TestFlight: purchase → webhook writes a
      `user_entitlements` row with `store = 'app_store'`; Restore Purchases
      works after reinstall; "Manage subscription" opens Apple's sheet.

   Apple takes 15–30% of IAP vs ~3% on web, so web remains the primary
   purchase surface; the iOS paywall exists to monetize mobile-first users
   who will never open the website.

## Testing

- RevenueCat's webhook "send test event" should return
  `{ received: true, ignored: "TEST" }`.
- A sandbox purchase fires `INITIAL_PURCHASE`; verify a row appears in
  `user_entitlements` with `status = 'active'` and the pricing page flips to
  "You're a Premium member".
- Cancelling in sandbox fires `CANCELLATION` (status `cancelled`, access
  retained until `current_period_end`) and later `EXPIRATION` (locked).
