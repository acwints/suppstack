-- Migration 0008: drop the health-intelligence tables.
--
-- The health-intelligence feature (manual/demo snapshots, localStorage
-- history, experiments, AI coach) was removed from the app. Apple Health is
-- now read on demand inside the iOS app and never persisted, so both tables
-- are dead. NEXT_PUBLIC_HEALTH_REMOTE_STORAGE was never enabled in
-- production, so these tables hold no user data.

DROP TABLE IF EXISTS health_experiments;
DROP TABLE IF EXISTS health_metric_snapshots;
