-- ============================================================================
-- Supplement Logging & Tracking Tables
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Daily Supplement Logs
-- Tracks when users take their supplements each day
-- ============================================================================
CREATE TABLE IF NOT EXISTS supplement_logs (
  log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,

  -- When the supplement was taken
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  log_date DATE DEFAULT CURRENT_DATE,

  -- Timing of the day
  time_of_day VARCHAR(20) DEFAULT 'morning', -- 'morning', 'afternoon', 'evening', 'night'

  -- Dosage tracking
  servings_taken DECIMAL(4,2) DEFAULT 1, -- Can be 0.5, 1, 2, etc.

  -- Optional notes
  notes TEXT,

  -- Mood/feeling tracking (1-5 scale)
  mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 5),
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 5),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),

  -- Side effects
  side_effects TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- User Supplement Settings
-- Extended tracking configuration for each supplement in user's stack
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_supplement_settings (
  setting_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,

  -- Dosage configuration
  custom_dosage VARCHAR(100), -- e.g., "500mg", "2 capsules"
  servings_per_day DECIMAL(4,2) DEFAULT 1,

  -- Schedule configuration
  schedule_times TEXT[], -- Array of times: ['08:00', '20:00']
  schedule_days INTEGER[], -- Days of week: [1,2,3,4,5,6,7] (1=Monday)

  -- Timing preferences
  take_with_food BOOLEAN DEFAULT false,
  timing_notes TEXT, -- e.g., "Take 30 min before workout"

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'stopped'
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,

  -- Goals
  goal TEXT, -- e.g., "Improve sleep quality"
  target_duration_days INTEGER, -- How long user plans to take it

  -- Reminders
  reminders_enabled BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, product_id)
);

-- ============================================================================
-- Daily Tracking Summary
-- Aggregated daily stats for quick dashboard queries
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_tracking_summary (
  summary_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL,

  -- Daily totals
  supplements_planned INTEGER DEFAULT 0,
  supplements_taken INTEGER DEFAULT 0,
  completion_percentage DECIMAL(5,2) DEFAULT 0,

  -- Streak tracking
  current_streak INTEGER DEFAULT 0,

  -- Daily wellness metrics (optional user input)
  overall_energy INTEGER CHECK (overall_energy >= 1 AND overall_energy <= 5),
  overall_mood INTEGER CHECK (overall_mood >= 1 AND overall_mood <= 5),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  sleep_hours DECIMAL(4,2),

  -- Notes
  daily_notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, summary_date)
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================
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

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================
ALTER TABLE supplement_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_supplement_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tracking_summary ENABLE ROW LEVEL SECURITY;

-- Policies for supplement_logs
CREATE POLICY "Users can view own logs" ON supplement_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs" ON supplement_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs" ON supplement_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs" ON supplement_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for user_supplement_settings
CREATE POLICY "Users can view own settings" ON user_supplement_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_supplement_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_supplement_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings" ON user_supplement_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for daily_tracking_summary
CREATE POLICY "Users can view own summary" ON daily_tracking_summary
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own summary" ON daily_tracking_summary
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own summary" ON daily_tracking_summary
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own summary" ON daily_tracking_summary
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- Functions for Streak Calculation
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_user_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  has_logs BOOLEAN;
BEGIN
  LOOP
    -- Check if user has any logs for this date
    SELECT EXISTS(
      SELECT 1 FROM supplement_logs
      WHERE user_id = p_user_id AND log_date = check_date
    ) INTO has_logs;

    IF has_logs THEN
      streak := streak + 1;
      check_date := check_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;

    -- Safety limit
    IF streak > 365 THEN
      EXIT;
    END IF;
  END LOOP;

  RETURN streak;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Function to Update Daily Summary
-- ============================================================================
CREATE OR REPLACE FUNCTION update_daily_summary()
RETURNS TRIGGER AS $$
DECLARE
  v_planned INTEGER;
  v_taken INTEGER;
  v_streak INTEGER;
BEGIN
  -- Count planned supplements (active settings)
  SELECT COUNT(*) INTO v_planned
  FROM user_supplement_settings
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND status = 'active';

  -- Count taken supplements for today
  SELECT COUNT(DISTINCT product_id) INTO v_taken
  FROM supplement_logs
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND log_date = COALESCE(NEW.log_date, OLD.log_date);

  -- Calculate streak
  SELECT calculate_user_streak(COALESCE(NEW.user_id, OLD.user_id)) INTO v_streak;

  -- Upsert daily summary
  INSERT INTO daily_tracking_summary (
    user_id,
    summary_date,
    supplements_planned,
    supplements_taken,
    completion_percentage,
    current_streak
  ) VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    COALESCE(NEW.log_date, OLD.log_date),
    v_planned,
    v_taken,
    CASE WHEN v_planned > 0 THEN (v_taken::DECIMAL / v_planned * 100) ELSE 0 END,
    v_streak
  )
  ON CONFLICT (user_id, summary_date)
  DO UPDATE SET
    supplements_taken = v_taken,
    completion_percentage = CASE WHEN v_planned > 0 THEN (v_taken::DECIMAL / v_planned * 100) ELSE 0 END,
    current_streak = v_streak,
    updated_at = NOW();

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic summary updates
DROP TRIGGER IF EXISTS trigger_update_daily_summary ON supplement_logs;
CREATE TRIGGER trigger_update_daily_summary
  AFTER INSERT OR UPDATE OR DELETE ON supplement_logs
  FOR EACH ROW EXECUTE FUNCTION update_daily_summary();
