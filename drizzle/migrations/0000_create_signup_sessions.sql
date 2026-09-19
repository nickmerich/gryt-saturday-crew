CREATE TABLE public.signup_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  rsvp_id uuid,
  waiver_id uuid,
  name text,
  contact text,
  event_label text,
  waiver_signed_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '60 days'
);

CREATE INDEX signup_sessions_token_hash_idx ON public.signup_sessions (token_hash);

GRANT ALL ON public.signup_sessions TO service_role;

ALTER TABLE public.signup_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages signup sessions"
  ON public.signup_sessions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');