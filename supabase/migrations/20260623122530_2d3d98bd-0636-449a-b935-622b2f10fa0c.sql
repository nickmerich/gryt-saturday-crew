CREATE TABLE public.rsvps (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  contact text NOT NULL,
  source text,
  event_label text,
  user_agent text,
  ip_hash text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.rsvps TO anon, authenticated;
GRANT ALL ON public.rsvps TO service_role;

ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an RSVP (insert only). Reads/updates/deletes restricted to service_role.
CREATE POLICY "Anyone can submit an RSVP"
  ON public.rsvps
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX rsvps_created_at_idx ON public.rsvps (created_at DESC);