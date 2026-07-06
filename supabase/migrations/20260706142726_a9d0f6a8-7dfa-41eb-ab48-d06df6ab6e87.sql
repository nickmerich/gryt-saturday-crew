
ALTER TABLE public.rsvps ADD COLUMN IF NOT EXISTS hero_variant text;

-- Replace the insert policy so hero_variant is length-capped like other fields.
DROP POLICY IF EXISTS "Anyone can submit a valid RSVP" ON public.rsvps;
CREATE POLICY "Anyone can submit a valid RSVP" ON public.rsvps
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(btrim(name)) BETWEEN 1 AND 80
    AND length(btrim(contact)) BETWEEN 3 AND 200
    AND (source IS NULL OR length(source) <= 40)
    AND (event_label IS NULL OR length(event_label) <= 120)
    AND (hero_variant IS NULL OR hero_variant IN ('a','b'))
  );

CREATE INDEX IF NOT EXISTS rsvps_hero_variant_idx
  ON public.rsvps (hero_variant) WHERE hero_variant IS NOT NULL;
