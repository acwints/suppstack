-- In-app improvement notes. Service-role writes only.
--
-- Not required for the first deploy. POST /api/feedback inserts here when the
-- table exists, and otherwise stores the same payload in
-- commerce_checkout_events (provider = in_app_feedback) so production can
-- accept notes before this file is applied.
--
-- Apply on Railway Postgres, then NOTIFY pgrst. Until then, do not point
-- readers at this table.

BEGIN;

CREATE TABLE IF NOT EXISTS public.feedback (
  feedback_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  email text,
  page_path text NOT NULL DEFAULT '',
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT feedback_message_length CHECK (char_length(message) BETWEEN 1 AND 2000),
  CONSTRAINT feedback_email_length CHECK (email IS NULL OR char_length(email) <= 320),
  CONSTRAINT feedback_page_path_length CHECK (char_length(page_path) <= 300),
  CONSTRAINT feedback_user_agent_length CHECK (user_agent IS NULL OR char_length(user_agent) <= 400)
);

CREATE INDEX IF NOT EXISTS feedback_created_at_idx
  ON public.feedback (created_at DESC);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.feedback FROM PUBLIC, anon, authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
