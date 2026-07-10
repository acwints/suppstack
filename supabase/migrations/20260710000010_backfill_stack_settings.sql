-- ============================================================================
-- 0010 · Backfill default settings for existing stack memberships
-- Depends on 0004 (tracking).
-- ============================================================================

INSERT INTO user_supplement_settings (
  user_id,
  product_id,
  servings_per_day,
  schedule_days,
  status,
  reminders_enabled,
  start_date,
  created_at,
  updated_at
)
SELECT
  up.user_id,
  up.product_id,
  COALESCE(NULLIF(p.servings_per_day, 0), 1),
  ARRAY[1, 2, 3, 4, 5, 6, 7]::INTEGER[],
  'active',
  false,
  CURRENT_DATE,
  NOW(),
  NOW()
FROM users_products up
JOIN products p ON p.product_id = up.product_id
WHERE NOT EXISTS (
  SELECT 1
  FROM user_supplement_settings uss
  WHERE uss.user_id = up.user_id
    AND uss.product_id = up.product_id
)
ON CONFLICT (user_id, product_id) DO NOTHING;
