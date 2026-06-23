DROP POLICY IF EXISTS "Anyone can submit an RSVP" ON public.rsvps;

CREATE POLICY "Anyone can submit a valid RSVP"
  ON public.rsvps
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(btrim(name)) BETWEEN 1 AND 80
    AND length(btrim(contact)) BETWEEN 3 AND 200
    AND (source IS NULL OR length(source) <= 40)
    AND (event_label IS NULL OR length(event_label) <= 120)
  );