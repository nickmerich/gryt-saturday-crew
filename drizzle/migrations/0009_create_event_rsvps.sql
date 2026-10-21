CREATE TABLE public.event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  event_slug text NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  company text,
  role text,
  group_choice text NOT NULL,
  badge_status text NOT NULL,
  share_consent boolean NOT NULL DEFAULT false,
  share_consent_at timestamptz,
  share_consent_version text,
  marketing_opt_in boolean NOT NULL DEFAULT false,
  marketing_opt_in_at timestamptz,
  is_test boolean NOT NULL DEFAULT false,
  UNIQUE (event_slug, email)
);
GRANT ALL ON public.event_rsvps TO service_role;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service manages event rsvps" ON public.event_rsvps FOR ALL TO service_role USING (true) WITH CHECK (true);