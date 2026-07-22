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
| 0006 | `20260101000006_health_snapshots.sql` | Apple Health / manual health intelligence tables: `health_metric_snapshots`, `health_experiments`, sleep-stage, recovery/cardio columns, outcome deltas, RLS. Superseded by 0008. |
| 0007 | `20260708000007_schema_tightening.sql` | Drops dead tables (`shopify_merchant_capabilities`, `review_images`); normalizes `users_products` to a single `user_id` owner and membership-only columns; drops catalog-only `products` columns. After applying everywhere, the legacy profile_id fallbacks in `useProductInStack`/`user-products` can be deleted. |
| 0008 | `20260709000008_drop_health_intelligence.sql` | Drops `health_experiments` and `health_metric_snapshots` — the health-intelligence feature was removed from the app; Apple Health is read on demand in the iOS app and never persisted. |
| 0009 | `20260710000009_major_brand_catalog_coverage.sql` | Adds official Onnit, Thorne, AG1, IM8, and Momentous products plus the catch-all supplement categories (Greens Powder, Nootropic Formula, Longevity Blend, etc.) needed to classify them; temp-staging + name-join upsert. |
| 0010 | `20260710000010_backfill_stack_settings.sql` | Backfills default `user_supplement_settings` rows for existing stack memberships (depends on 0004 tracking). |
| 0011 | `20260713000011_remove_legacy_manual_daily_fields.sql` | Drops legacy hand-entered daily fields (`notes`, `mood_before`, etc.) from `supplement_logs`; sleep belongs to connected health data, not manual daily summaries. |
| 0012 | `20260715000012_add_wholesome_story_catalog.sql` | Adds Wholesome Story as an official Shopify merchant and syncs its core women-focused wellness products into canonical supplement families. |
| 0013 | `20260715000013_complete_wholesome_story_backfill.sql` | Creates the missing Myo-Inositol and NAC supplement rows that production lacked and idempotently replays the Wholesome Story product sync that 0012 had to skip. |
| 0014 | `20260716000014_add_colostrum_organ_protein_brand_coverage.sql` | Adds official Pioneer Pastures, David Protein, ARMRA, Cowboy Colostrum, and Heart & Soil catalog rows plus the canonical supplement buckets to classify them. |
| 0015 | `20260716000015_add_requested_brand_catalog_coverage.sql` | Adds first-party rows for BPN, Four Sigmatic, Ancestral Supplements, Dose Daily, Maui Nui Venison, Sports Research, Vital Proteins, Nutrafol, ZOE, Seed, and Pure Encapsulations; refreshes Thorne, Jocko Fuel, and Double Wood without duplicating product rows. |
| 0016 | `20260716000016_product_ingredient_composition.sql` | Adds the `product_ingredients` join table (2-tier composition: ingredient = a catalog supplement), seeds the explicit catch-all product compositions (temp-staging + double name-join, mirrors the static catalog), and backfills a single unquantified edge for existing single-active products. Superseded by 0020/0021 for RLS and grants. |
| 0017 | `20260720000017_drop_time_of_day_routine_fields.sql` | Removes time-of-day routine fields from supplement logs, settings, and stack supplements; tracking stays product/date based. |
| 0018 | `20260720000018_update_time_language_catalog_rows.sql` | Updates the Onnit Total Human DB-backed catalog copy away from time-of-day pack language. |
| 0019 | `20260720000019_drop_extra_supplement_settings_fields.sql` | Drops unused settings fields (`take_with_food`, `goal`, `target_duration_days`) so per-product settings stay operational. |
| 0020 | `20260721000020_enable_rls_product_ingredients.sql` | Enables RLS on `product_ingredients`, keeps public catalog reads, and removes direct client writes. |
| 0021 | `20260721000021_restrict_product_ingredients_grants.sql` | Narrows `product_ingredients` client grants to SELECT only at the privilege layer. |
| 0022 | `20260721000022_lock_catalog_client_writes.sql` | Removes public insert policies and write grants on `brands`, `products`, and `supplements`; catalog materialization is service-role only. |
| 0023 | `20260721000023_fix_function_search_paths.sql` | Pins public trigger/helper function search paths to `public, pg_temp` to satisfy Supabase security advisor hardening. |

## Applying

With the Supabase CLI (recommended):

```bash
supabase db push          # apply to the linked project
supabase migration up     # apply to a local dev database
```

Or paste each file, in order, into the Supabase dashboard SQL editor.

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
