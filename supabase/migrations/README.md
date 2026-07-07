# Database migrations

This directory is the **single source of truth** for the SuppStack database
schema. Each file is an ordered, idempotent migration.

| Order | File | Contents |
|-------|------|----------|
| 0001 | `20260101000001_core_schema.sql` | Catalog (`supplements`, `brands`, `products`), `user_profiles`, `stacks`, `stack_supplements`, `users_products`, `stack_likes`, `user_follows`, indexes, RLS, and the follower/like counter triggers. |
| 0002 | `20260101000002_commerce.sql` | Shopify/UCP + API-sourcing columns on `supplements`/`products`, `commerce_checkout_events` (RLS-locked, service-role only), `shopify_merchant_capabilities`. |
| 0003 | `20260101000003_reviews.sql` | `product_reviews`, `review_votes`, `review_images`, `product_rating_stats`, aggregate triggers, RLS. |
| 0004 | `20260101000004_tracking.sql` | `supplement_logs`, `user_supplement_settings`, `daily_tracking_summary`, streak/summary triggers, RLS. |
| 0005 | `20260101000005_billing.sql` | `user_entitlements` (premium subscription mirror written by the RevenueCat webhook; RLS: users read own row, service-role writes). |
| 0006 | `20260101000006_health_snapshots.sql` | Apple Health / manual health intelligence tables: `health_metric_snapshots`, `health_experiments`, sleep-stage, recovery/cardio columns, outcome deltas, RLS. |

## Applying

With the Supabase CLI (recommended):

```bash
supabase db push          # apply to the linked project
supabase migration up     # apply to a local dev database
```

Or paste each file, in order, into the Supabase dashboard SQL editor.

After applying the health migration to the hosted project, verify the live
PostgREST schema with:

```bash
npm run check:health-migration
```

If it reports missing tables or columns, apply
`20260101000006_health_snapshots.sql` in the Supabase SQL editor, or authenticate
the CLI with `SUPABASE_ACCESS_TOKEN` / `supabase login` and run `supabase db push`.

## Rules

- **Idempotent:** every statement uses `IF NOT EXISTS` / `CREATE OR REPLACE` /
  `DROP POLICY IF EXISTS` so a file can be re-applied to a fresh or existing
  database without error.
- **Additive & ordered:** never edit a released migration to change already-applied
  behavior — add a new timestamped file instead.
- **Counters are owned by the database.** `follower_count`, `following_count`,
  and `like_count` are maintained by triggers (migration 0001). Application code
  must not write these columns.
- **`commerce_checkout_events` is service-role only.** It has RLS enabled with no
  policies; the `/api/commerce/checkout` route writes it with
  `SUPABASE_SERVICE_ROLE_KEY`.
