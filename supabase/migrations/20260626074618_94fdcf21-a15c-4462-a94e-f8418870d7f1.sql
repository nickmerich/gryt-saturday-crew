DROP POLICY IF EXISTS "Anyone can submit a valid 2026 waiver" ON public.waiver_signatures;
CREATE POLICY "Anyone can submit a valid 2026 waiver"
  ON public.waiver_signatures
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    season = 2026
    AND length(btrim(full_name)) BETWEEN 1 AND 120
    AND length(btrim(email)) BETWEEN 3 AND 200
    AND length(btrim(signature_text)) BETWEEN 1 AND 120
    AND length(btrim(emergency_contact_name)) BETWEEN 1 AND 120
    AND length(btrim(emergency_contact_phone)) BETWEEN 3 AND 40
  );
REVOKE INSERT ON public.waiver_signatures FROM public;