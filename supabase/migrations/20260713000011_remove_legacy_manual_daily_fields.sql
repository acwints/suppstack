-- Remove legacy manual daily entry fields.
-- Sleep belongs to connected health data, not hand-entered daily summaries.

alter table supplement_logs
  drop column if exists notes,
  drop column if exists mood_before,
  drop column if exists mood_after,
  drop column if exists energy_level,
  drop column if exists side_effects;

alter table daily_tracking_summary
  drop column if exists overall_energy,
  drop column if exists overall_mood,
  drop column if exists sleep_quality,
  drop column if exists sleep_hours,
  drop column if exists daily_notes;
