-- ============================================================================
-- 0006 · Health snapshots and experiments
-- Private Apple Health / manual metric history for AI coaching and shopping cues.
-- ============================================================================

CREATE TABLE IF NOT EXISTS health_metric_snapshots (
  snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source VARCHAR(20) NOT NULL CHECK (source IN ('apple_health', 'manual', 'demo')),
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_range_days INTEGER NOT NULL DEFAULT 14 CHECK (date_range_days BETWEEN 1 AND 365),

  sleep_hours_avg DECIMAL(4,2),
  sleep_quality_avg DECIMAL(3,1),
  sleep_days_tracked INTEGER,
  sleep_debt_hours DECIMAL(5,2),
  sleep_consistency_score DECIMAL(5,2),
  sleep_rem_hours_avg DECIMAL(4,2),
  sleep_deep_hours_avg DECIMAL(4,2),
  sleep_awake_hours_avg DECIMAL(4,2),

  weight_kg DECIMAL(6,2),
  weight_trend_kg DECIMAL(6,2),
  body_fat_percent DECIMAL(5,2),
  body_fat_trend_percent DECIMAL(5,2),

  active_energy_burned_kcal_avg DECIMAL(8,2),
  resting_energy_burned_kcal_avg DECIMAL(8,2),
  steps_avg DECIMAL(8,2),
  exercise_minutes_avg DECIMAL(6,2),
  resting_heart_rate_bpm_avg DECIMAL(5,2),
  heart_rate_variability_ms_avg DECIMAL(6,2),
  vo2_max_ml_kg_min DECIMAL(5,2),

  readiness_score INTEGER CHECK (readiness_score BETWEEN 0 AND 100),
  focus_goal_id VARCHAR(50),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS health_experiments (
  experiment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_id UUID REFERENCES health_metric_snapshots(snapshot_id) ON DELETE SET NULL,
  outcome_snapshot_id UUID REFERENCES health_metric_snapshots(snapshot_id) ON DELETE SET NULL,
  goal_id VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'active', 'completed', 'dismissed')),
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  target_days INTEGER NOT NULL DEFAULT 14 CHECK (target_days BETWEEN 1 AND 120),
  product_ids TEXT[] DEFAULT '{}',
  supplement_names TEXT[] DEFAULT '{}',
  baseline_readiness_score INTEGER CHECK (baseline_readiness_score BETWEEN 0 AND 100),
  baseline_sleep_hours_avg DECIMAL(4,2),
  outcome_readiness_score INTEGER CHECK (outcome_readiness_score BETWEEN 0 AND 100),
  outcome_sleep_hours_avg DECIMAL(4,2),
  outcome_weight_kg DECIMAL(6,2),
  outcome_body_fat_percent DECIMAL(5,2),
  outcome_active_energy_burned_kcal_avg DECIMAL(8,2),
  outcome_readiness_delta INTEGER,
  outcome_sleep_delta_hours DECIMAL(5,2),
  outcome_summary TEXT,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE health_metric_snapshots
  ADD COLUMN IF NOT EXISTS sleep_rem_hours_avg DECIMAL(4,2),
  ADD COLUMN IF NOT EXISTS sleep_deep_hours_avg DECIMAL(4,2),
  ADD COLUMN IF NOT EXISTS sleep_awake_hours_avg DECIMAL(4,2),
  ADD COLUMN IF NOT EXISTS exercise_minutes_avg DECIMAL(6,2),
  ADD COLUMN IF NOT EXISTS resting_heart_rate_bpm_avg DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS heart_rate_variability_ms_avg DECIMAL(6,2),
  ADD COLUMN IF NOT EXISTS vo2_max_ml_kg_min DECIMAL(5,2);

ALTER TABLE health_experiments
  ADD COLUMN IF NOT EXISTS outcome_snapshot_id UUID REFERENCES health_metric_snapshots(snapshot_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS target_days INTEGER NOT NULL DEFAULT 14 CHECK (target_days BETWEEN 1 AND 120),
  ADD COLUMN IF NOT EXISTS product_ids TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS supplement_names TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS baseline_readiness_score INTEGER CHECK (baseline_readiness_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS baseline_sleep_hours_avg DECIMAL(4,2),
  ADD COLUMN IF NOT EXISTS outcome_readiness_score INTEGER CHECK (outcome_readiness_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS outcome_sleep_hours_avg DECIMAL(4,2),
  ADD COLUMN IF NOT EXISTS outcome_weight_kg DECIMAL(6,2),
  ADD COLUMN IF NOT EXISTS outcome_body_fat_percent DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS outcome_active_energy_burned_kcal_avg DECIMAL(8,2),
  ADD COLUMN IF NOT EXISTS outcome_readiness_delta INTEGER,
  ADD COLUMN IF NOT EXISTS outcome_sleep_delta_hours DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS outcome_summary TEXT,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_health_metric_snapshots_user_id
  ON health_metric_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_health_metric_snapshots_user_captured
  ON health_metric_snapshots(user_id, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_metric_snapshots_focus_goal
  ON health_metric_snapshots(focus_goal_id);
CREATE INDEX IF NOT EXISTS idx_health_experiments_user_id
  ON health_experiments(user_id);
CREATE INDEX IF NOT EXISTS idx_health_experiments_status
  ON health_experiments(status);
CREATE INDEX IF NOT EXISTS idx_health_experiments_goal
  ON health_experiments(goal_id);
CREATE INDEX IF NOT EXISTS idx_health_experiments_outcome_snapshot
  ON health_experiments(outcome_snapshot_id);

ALTER TABLE health_metric_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_experiments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own health snapshots" ON health_metric_snapshots;
CREATE POLICY "Users can manage own health snapshots" ON health_metric_snapshots
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own health experiments" ON health_experiments;
CREATE POLICY "Users can manage own health experiments" ON health_experiments
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
