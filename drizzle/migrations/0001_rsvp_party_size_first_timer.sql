ALTER TABLE public.rsvps
  ADD COLUMN IF NOT EXISTS party_size smallint NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS first_timer boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS "Anyone can submit a valid RSVP" ON public.rsvps;

CREATE POLICY "Anyone can submit a valid RSVP"
ON public.rsvps
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (length(btrim(name)) >= 1 AND length(btrim(name)) <= 80)
  AND (length(btrim(contact)) >= 3 AND length(btrim(contact)) <= 200)
  AND (source IS NULL OR length(source) <= 40)
  AND (event_label IS NULL OR length(event_label) <= 120)
  AND (hero_variant IS NULL OR hero_variant = ANY (ARRAY['a'::text, 'b'::text]))
  AND (party_size >= 1 AND party_size <= 10)
);