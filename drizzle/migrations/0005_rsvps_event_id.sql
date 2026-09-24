ALTER TABLE public.rsvps ADD COLUMN IF NOT EXISTS event_id text;
CREATE INDEX IF NOT EXISTS rsvps_event_id_idx ON public.rsvps (event_id);