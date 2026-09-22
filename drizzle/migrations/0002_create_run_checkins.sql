CREATE TABLE public.run_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL,
  event_date date NOT NULL,
  person_key text NOT NULL,
  name text NOT NULL,
  contact text,
  source text NOT NULL DEFAULT 'rsvp',
  status text NOT NULL DEFAULT 'present',
  note text,
  checked_in_at timestamptz NOT NULL DEFAULT now(),
  checked_in_by text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, person_key)
);

GRANT ALL ON public.run_checkins TO service_role;

ALTER TABLE public.run_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages check-ins"
  ON public.run_checkins FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TABLE public.run_checkin_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checkin_id uuid,
  event_id text NOT NULL,
  person_key text NOT NULL,
  action text NOT NULL,
  actor text NOT NULL,
  detail jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.run_checkin_audit TO service_role;

ALTER TABLE public.run_checkin_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages check-in audit"
  ON public.run_checkin_audit FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE INDEX run_checkins_event_idx ON public.run_checkins (event_id);
CREATE INDEX run_checkin_audit_event_idx ON public.run_checkin_audit (event_id, created_at DESC);