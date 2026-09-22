-- These policies were written as "... AND false", i.e. they grant nothing.
-- With RLS enabled, having no client-role policy at all is the same denial,
-- without a policy that looks permissive to scanners.
DROP POLICY IF EXISTS "Recaps: deny anon select" ON storage.objects;
DROP POLICY IF EXISTS "Recaps: deny anon insert" ON storage.objects;
DROP POLICY IF EXISTS "Recaps: deny anon update" ON storage.objects;
DROP POLICY IF EXISTS "Recaps: deny anon delete" ON storage.objects;