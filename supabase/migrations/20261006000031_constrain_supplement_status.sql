-- A stack item is either active or paused; removing a product deletes its
-- users_products and user_supplement_settings rows. The legacy 'stopped'
-- status (which hid an item while leaving it in the stack) is retired.

BEGIN;

DELETE FROM public.user_supplement_settings WHERE status = 'stopped';

ALTER TABLE public.user_supplement_settings
  DROP CONSTRAINT IF EXISTS user_supplement_settings_status_check;
ALTER TABLE public.user_supplement_settings
  ADD CONSTRAINT user_supplement_settings_status_check
  CHECK (status IN ('active', 'paused'));

COMMIT;
