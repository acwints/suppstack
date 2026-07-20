-- Remove unused supplement settings fields.
-- Per-product settings only keep operational stack state: status, dosage,
-- serving count, and schedule days.

alter table user_supplement_settings
  drop column if exists take_with_food,
  drop column if exists goal,
  drop column if exists target_duration_days;
