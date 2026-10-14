-- The App Review demo account was seeded with product_id
-- 'premium_monthly_ios', which is not an App Store product. The live
-- products are app.suppstack.premium.annual and app.suppstack.premium.monthly.
--
-- Rewrite only that account's placeholder product id to the monthly product.
-- Status, period end, renewal, store, metadata, and every other user's rows
-- are left untouched. Re-running this after the row is corrected matches
-- zero rows.

UPDATE public.user_entitlements AS entitlement
SET product_id = 'app.suppstack.premium.monthly'
FROM auth.users AS account
WHERE entitlement.user_id = account.id
  AND lower(account.email) = 'appreview@suppstack.app'
  AND entitlement.product_id = 'premium_monthly_ios';
