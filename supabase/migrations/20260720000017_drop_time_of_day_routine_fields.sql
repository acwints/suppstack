-- Remove time-of-day routine fields.
-- Daily supplement tracking is product/date based; schedule days remain the
-- only routine cadence field.

alter table supplement_logs
  drop column if exists time_of_day;

alter table user_supplement_settings
  drop column if exists schedule_times,
  drop column if exists timing_notes,
  drop column if exists reminders_enabled;

alter table stack_supplements
  drop column if exists timing;
