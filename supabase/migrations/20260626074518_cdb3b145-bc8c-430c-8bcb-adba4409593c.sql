DROP POLICY IF EXISTS "Anyone can submit a valid 2026 waiver" ON public.waiver_signatures;
CREATE POLICY "Anyone can submit a valid 2026 waiver"
  ON public.waiver_signatures
  FOR INSERT
  TO public
  WITH CHECK (season = 2026);