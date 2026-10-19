REVOKE INSERT ON public.partner_inquiries FROM anon,authenticated;
GRANT INSERT(name,email,organization,involvement,message,ip_hash) ON public.partner_inquiries TO anon,authenticated;
CREATE POLICY "Service manages private partner logos" ON storage.objects FOR ALL TO service_role USING(bucket_id='partner-logos') WITH CHECK(bucket_id='partner-logos');