# Handoff: next steps for the local agent

Context: all feature work is merged to `main` and deployed to production
(https://suppstack.vercel.app). What remains is exclusively **credentialed
setup** that could not be done from a cloud VM: applying database migrations
to the live Supabase project, configuring RevenueCat + Vercel env vars for
Premium, and the Apple-side work for the iOS app. Everything below assumes
you are on the owner's machine with access to their Supabase, Vercel,
RevenueCat, and Apple accounts.

## Current state (done, no action needed)

- Marketplace, checkout (Shopify cart permalinks), brand pages, peptides
  wiki (research-only entries, IDs 9200–9207), NAD+/Glutathione categories,
  and the Premium UI are all live on production.
- PRs #19, #20, #21, #22, #23, #24 are merged. PR #17 (iOS shell) shows
  OPEN on GitHub but all of its commits are already in `main` (it was an
  ancestor of the merged peptides branch) — close it manually with a note,
  do not merge it again.
- Validation gates all pass on `main`: `npx tsc --noEmit`, `npx next lint`,
  `npm run build`, `npm run check:catalog`, `npm run verify:shopify-catalog`.

## Task 1 — Apply database migrations to live Supabase (highest priority)

The live database has never received the reconciled schema. The app is
running against a drifted schema: `commerce_checkout_events` (and its RLS),
`user_profiles` body-metric columns, and `user_entitlements` are missing.

```bash
supabase login                      # opens browser
supabase link --project-ref <ref>  # ref is in the Supabase dashboard URL
supabase db push                   # applies supabase/migrations/ in order
```

Notes:

- All five migrations (`20260101000001_core_schema.sql` …
  `20260101000005_billing.sql`) are idempotent (`IF NOT EXISTS`,
  `CREATE OR REPLACE`, `DROP POLICY IF EXISTS`), so it is safe to run
  against the existing database with data in it. Do NOT reset the database.
- Verify afterwards (SQL editor or `psql`):

```sql
select count(*) from information_schema.tables
  where table_name in ('commerce_checkout_events', 'user_entitlements'); -- expect 2
select column_name from information_schema.columns
  where table_name = 'user_profiles' and column_name = 'date_of_birth';  -- expect 1 row
```

- Smoke-test after applying: complete a checkout click on production and
  confirm a row lands in `commerce_checkout_events`.

## Task 2 — RevenueCat + Vercel env vars (activates Premium)

Follow `PREMIUM_BILLING.md` in the repo root — it is the authoritative
checklist. Summary:

1. Create a RevenueCat project with an entitlement whose identifier is
   exactly `premium`.
2. Web Billing: connect Stripe, create `premium_monthly` at $4.99/mo,
   attach to `premium`, generate a purchase link.
3. Webhook: point it at `https://suppstack.vercel.app/api/billing/revenuecat`
   with an Authorization header value from `openssl rand -base64 32`.
4. Set Vercel env vars (Production):
   - `REVENUECAT_WEBHOOK_AUTH_TOKEN` — same value as the webhook header
   - `NEXT_PUBLIC_PREMIUM_CHECKOUT_URL` — purchase link, **without** the
     trailing app-user segment (the app appends `/<supabase-user-id>`)
   - `NEXT_PUBLIC_PREMIUM_MANAGE_URL` — customer portal link (optional)
   - `SUPABASE_SERVICE_ROLE_KEY` — from Supabase dashboard → API settings
     (required for the webhook to write entitlements)
5. Redeploy, then send RevenueCat's test event — expect
   `{ received: true, ignored: "TEST" }`. Do a sandbox purchase and confirm
   a `user_entitlements` row appears and `/premium` flips to member state.

Until this task is done Premium degrades gracefully (everyone is free
tier); nothing is broken in the meantime.

## Task 3 — iOS App Store submission

Follow `APP_STORE_SUBMISSION.md` in the repo root for the remaining App Store
review metadata. The native project has been restored and a TestFlight build
has been uploaded. Key facts:

- Bundle ID `app.suppstack`, app name SuppStack AI, Capacitor shell in
  `ios/` loading `https://suppstack.vercel.app` (config:
  `ios/App/App/capacitor.config.json`).
- Apple Developer App ID: `app.suppstack`; App Store Connect Apple ID:
  `6788166423`; SKU: `suppstack-ai-ios`.
- App Store provisioning profile: `SuppStack AI App Store`, UUID
  `caea33a6-0b56-4255-a84e-f1c0113a29d8`.
- Latest uploaded build: version `1.0.0`, build `1`, delivery UUID
  `599455c8-3fad-4ebe-9e15-659e12a9badc`, processing status `VALID`;
  attached to App Store version `1.0` so the build-provided app icon/logo
  appears on the version page.
- TestFlight internal group `Internal Testers` exists with
  `acwints78@gmail.com` invited and build 1 attached.
- The previous App Store Connect record `6788125138` is parked as
  `SuppStack AI Legacy` because it is locked to the old
  `com.acwints.suppstack` bundle ID.
- Review-guideline landmines already accounted for in the docs: physical
  goods must use external checkout not IAP (3.1.3(e)); account deletion
  must be reachable in-app (5.1.1); add Sign in with Apple if Google
  sign-in ships on iOS (4.8).
- Premium purchase in the iOS app is now WIRED via Apple IAP:
  `@revenuecat/purchases-capacitor` is registered in the native shell and
  `/premium` presents a native Subscribe + Restore Purchases flow. It stays
  dormant ("not available in this version") until the owner-side setup in
  the iOS section of `PREMIUM_BILLING.md` is done — App Store Connect
  subscription product, RevenueCat Apple app config, and the
  `NEXT_PUBLIC_REVENUECAT_APPLE_API_KEY` env var. The native binary changed,
  so the next App Store upload must be a new build number.

## Task 4 — Optional: unblock future cloud agents

If cloud agents should be able to manage Supabase/Vercel going forward, add
these in the Cursor dashboard (Cloud Agents → Secrets):
`SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `VERCEL_TOKEN`.

## Verification checklist when everything above is done

- [ ] `supabase db push` ran clean; both verification queries pass
- [ ] Checkout click writes a `commerce_checkout_events` row
- [ ] RevenueCat test event returns `received: true`
- [ ] Sandbox purchase creates an active `user_entitlements` row and
      `/premium` shows member state
- [ ] PR #17 closed with a "merged via peptides branch" note
- [ ] TestFlight build installs and loads production site with native chrome
