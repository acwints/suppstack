# Premium subscriptions (RevenueCat)

SuppStack Premium gates the personal analytics layer (wellness trends,
efficacy insights, restock reminders, cost analytics) behind a subscription.
The marketplace, wiki, stacks, and daily logging stay free.

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
6. **iOS (when the Capacitor branch ships):** create the subscription in App
   Store Connect, add `@revenuecat/purchases-capacitor`, call
   `Purchases.configure({ apiKey, appUserID: supabaseUserId })` after login,
   and present the paywall with the same `premium` entitlement. Apple takes
   15–30% of IAP vs ~3% on web, so web remains the primary purchase surface.

## Testing

- RevenueCat's webhook "send test event" should return
  `{ received: true, ignored: "TEST" }`.
- A sandbox purchase fires `INITIAL_PURCHASE`; verify a row appears in
  `user_entitlements` with `status = 'active'` and the pricing page flips to
  "You're a Premium member".
- Cancelling in sandbox fires `CANCELLATION` (status `cancelled`, access
  retained until `current_period_end`) and later `EXPIRATION` (locked).
