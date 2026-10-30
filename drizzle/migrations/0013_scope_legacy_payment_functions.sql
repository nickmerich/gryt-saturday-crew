CREATE OR REPLACE FUNCTION public.gryt_test_catalog(event_slug text DEFAULT '') RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT public.gryt_payment_catalog(event_slug,'sandbox') $$;
CREATE OR REPLACE FUNCTION public.gryt_reserve_test_order(payload jsonb) RETURNS uuid LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$ SELECT public.gryt_reserve_payment_order(payload || jsonb_build_object('environment','sandbox')) $$;
REVOKE ALL ON FUNCTION public.gryt_test_catalog(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.gryt_test_catalog(text) TO anon,authenticated,service_role;
REVOKE ALL ON FUNCTION public.gryt_reserve_test_order(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.gryt_reserve_test_order(jsonb) TO service_role;
COMMENT ON FUNCTION public.gryt_reserve_test_order(jsonb) IS 'Legacy sandbox-only wrapper. Environment-aware checkout uses gryt_reserve_payment_order.';