-- Remove the daily tracking summary.
--
-- A trigger rewrote daily_tracking_summary (planned/taken counts and a
-- streak) on every supplement log, but nothing reads it: the app derives
-- completion and the schedule-aware streak from supplement_logs directly.
-- The stored copy ignored schedule days, cost four queries per log, and was
-- the source of the account-deletion failure fixed in 0028.

BEGIN;

DROP TRIGGER IF EXISTS trigger_update_daily_summary ON public.supplement_logs;
DROP FUNCTION IF EXISTS public.update_daily_summary();
DROP FUNCTION IF EXISTS public.calculate_user_streak(UUID);
DROP TABLE IF EXISTS public.daily_tracking_summary;

COMMIT;
