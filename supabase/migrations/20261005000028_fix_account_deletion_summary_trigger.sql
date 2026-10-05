-- Account deletion failed for anyone who had ever logged a supplement:
-- deleting the auth user cascades into supplement_logs, whose AFTER DELETE
-- trigger then upserted a daily_tracking_summary row for the user being
-- deleted, violating its foreign key and aborting the whole deletion
-- (App Store guideline 5.1.1 requires in-app account deletion to work).
--
-- Skip the summary rewrite when the owning user no longer exists. Also keep
-- supplements_planned current on conflict (it was only set on insert).
-- SECURITY DEFINER because the existence check reads auth.users, which
-- client roles cannot see; the row it writes is the triggering user's own.

CREATE OR REPLACE FUNCTION public.update_daily_summary()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_user_id UUID := COALESCE(NEW.user_id, OLD.user_id);
  v_date DATE := COALESCE(NEW.log_date, OLD.log_date);
  v_planned INTEGER;
  v_taken INTEGER;
  v_streak INTEGER;
BEGIN
  -- Cascading delete of the account: nothing to summarize.
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id) THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT COUNT(*) INTO v_planned
  FROM user_supplement_settings
  WHERE user_id = v_user_id AND status = 'active';

  SELECT COUNT(DISTINCT product_id) INTO v_taken
  FROM supplement_logs
  WHERE user_id = v_user_id AND log_date = v_date;

  SELECT calculate_user_streak(v_user_id) INTO v_streak;

  INSERT INTO daily_tracking_summary (
    user_id, summary_date, supplements_planned, supplements_taken,
    completion_percentage, current_streak
  ) VALUES (
    v_user_id,
    v_date,
    v_planned,
    v_taken,
    CASE WHEN v_planned > 0 THEN (v_taken::DECIMAL / v_planned * 100) ELSE 0 END,
    v_streak
  )
  ON CONFLICT (user_id, summary_date) DO UPDATE SET
    supplements_planned = v_planned,
    supplements_taken = v_taken,
    completion_percentage = CASE WHEN v_planned > 0 THEN (v_taken::DECIMAL / v_planned * 100) ELSE 0 END,
    current_streak = v_streak,
    updated_at = NOW();

  RETURN COALESCE(NEW, OLD);
END;
$function$;
