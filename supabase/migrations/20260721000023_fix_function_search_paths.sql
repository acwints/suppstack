-- Pin public function search paths so trigger execution cannot be affected by
-- caller-controlled or role-level search_path changes.

alter function public.calculate_user_streak(uuid) set search_path = public, pg_temp;
alter function public.update_daily_summary() set search_path = public, pg_temp;
alter function public.update_follower_counts() set search_path = public, pg_temp;
alter function public.update_like_counts() set search_path = public, pg_temp;
alter function public.update_product_rating_stats() set search_path = public, pg_temp;
alter function public.update_review_helpful_count() set search_path = public, pg_temp;
alter function public.update_user_entitlements_updated_at() set search_path = public, pg_temp;
