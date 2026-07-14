
-- Restrict storage.objects access for the private 'recaps' bucket.
-- All application access goes through supabaseAdmin (service_role bypasses RLS),
-- so anon/authenticated should have no direct access.

CREATE POLICY "Recaps: deny anon select"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'recaps' AND false);

CREATE POLICY "Recaps: deny anon insert"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'recaps' AND false);

CREATE POLICY "Recaps: deny anon update"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'recaps' AND false)
  WITH CHECK (bucket_id = 'recaps' AND false);

CREATE POLICY "Recaps: deny anon delete"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'recaps' AND false);
