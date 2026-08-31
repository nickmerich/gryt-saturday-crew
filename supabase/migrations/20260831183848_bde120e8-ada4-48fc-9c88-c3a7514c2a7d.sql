DROP POLICY IF EXISTS "Anyone can submit a partner inquiry" ON public.partner_inquiries;
CREATE POLICY "Anyone can submit a partner inquiry"
ON public.partner_inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(btrim(name)) BETWEEN 1 AND 120
  AND length(btrim(email)) BETWEEN 3 AND 255
  AND length(btrim(involvement)) BETWEEN 1 AND 80
  AND (organization IS NULL OR length(organization) <= 200)
  AND (message IS NULL OR length(message) <= 4000)
);
GRANT INSERT ON public.partner_inquiries TO anon, authenticated;
GRANT ALL ON public.partner_inquiries TO service_role;