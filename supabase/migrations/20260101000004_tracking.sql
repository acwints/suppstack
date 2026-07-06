-- ============================================================================
-- 0004 · Supplement logging & daily tracking
-- Depends on 0001 (products).
-- ============================================================================

CREATE TABLE IF NOT EXISTS supplement_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  log_date DATE DEFAULT CURRENT_DATE,
  time_of_day VARCHAR(20) DEFAULT 'morning',
  servings_taken DECIMAL(4,2) DEFAULT 1,
  notes TEXT,
  mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 5),
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 5),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  side_effects TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_supplement_settings (
  setting_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
  custom_dosage VARCHAR(100),
  servings_per_day DECIMAL(4,2) DEFAULT 1,
  schedule_times TEXT[],
  schedule_days INTEGER[],
  take_with_food BOOLEAN DEFAULT false,
  timing_notes TEXT,
  status VARCHAR(20) DEFAULT 'active',
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  goal TEXT,
  target_duration_days INTEGER,
  reminders_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS daily_tracking_summary (
  summary_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL,
  supplements_planned INTEGER DEFAULT 0,
  supplements_taken INTEGER DEFAULT 0,
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  overall_energy INTEGER CHECK (overall_energy >= 1 AND overall_energy <= 5),
  overall_mood INTEGER CHECK (overall_mood >= 1 AND overall_mood <= 5),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  sleep_hours DECIMAL(4,2),
  daily_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, summary_date)
);

CREATE INDEX IF NOT EXISTS idx_supplement_logs_user_id ON supplement_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_supplement_logs_product_id ON supplement_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_supplement_logs_log_date ON supplement_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_supplement_logs_user_date ON supplement_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_user_supplement_settings_user_id ON user_supplement_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_supplement_settings_product_id ON user_supplement_settings(product_id);
CREATE INDEX IF NOT EXISTS idx_user_supplement_settings_status ON user_supplement_settings(status);
CREATE INDEX IF NOT EXISTS idx_daily_tracking_summary_user_id ON daily_tracking_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_tracking_summary_date ON daily_tracking_summary(summary_date);
CREATE INDEX IF NOT EXISTS idx_daily_tracking_summary_user_date ON daily_tracking_summary(user_id, summary_date);

-- ── RLS (each user sees only their own rows) ──────────────────────────────
ALTER TABLE supplement_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_supplement_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tracking_summary ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own logs" ON supplement_logs;
CREATE POLICY "Users can manage own logs" ON supplement_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own settings" ON user_supplement_settings;
CREATE POLICY "Users can manage own settings" ON user_supplement_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own summary" ON daily_tracking_summary;
CREATE POLICY "Users can manage own summary" ON daily_tracking_summary
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Streak + daily summary maintenance ───────────────────────────────────
CREATE OR REPLACE FUNCTION calculate_user_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  has_logs BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM supplement_logs WHERE user_id = p_user_id AND log_date = check_date
    ) INTO has_logs;

    IF has_logs THEN
      streak := streak + 1;
      check_date := check_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;

    IF streak > 365 THEN
      EXIT;
    END IF;
  END LOOP;

  RETURN streak;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_daily_summary()
RETURNS TRIGGER AS $$
DECLARE
  v_planned INTEGER;
  v_taken INTEGER;
  v_streak INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_planned
  FROM user_supplement_settings
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id) AND status = 'active';

  SELECT COUNT(DISTINCT product_id) INTO v_taken
  FROM supplement_logs
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND log_date = COALESCE(NEW.log_date, OLD.log_date);

  SELECT calculate_user_streak(COALESCE(NEW.user_id, OLD.user_id)) INTO v_streak;

  INSERT INTO daily_tracking_summary (
    user_id, summary_date, supplements_planned, supplements_taken,
    completion_percentage, current_streak
  ) VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    COALESCE(NEW.log_date, OLD.log_date),
    v_planned,
    v_taken,
    CASE WHEN v_planned > 0 THEN (v_taken::DECIMAL / v_planned * 100) ELSE 0 END,
    v_streak
  )
  ON CONFLICT (user_id, summary_date) DO UPDATE SET
    supplements_taken = v_taken,
    completion_percentage = CASE WHEN v_planned > 0 THEN (v_taken::DECIMAL / v_planned * 100) ELSE 0 END,
    current_streak = v_streak,
    updated_at = NOW();

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_daily_summary ON supplement_logs;
CREATE TRIGGER trigger_update_daily_summary
  AFTER INSERT OR UPDATE OR DELETE ON supplement_logs
  FOR EACH ROW EXECUTE FUNCTION update_daily_summary();
