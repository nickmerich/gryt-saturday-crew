-- REVIEW ONLY. Explicitly remove inherited/default service-role table grants.
-- The RPCs remain SECURITY DEFINER and are the only application write path.
BEGIN;
REVOKE ALL ON public.checkin_sessions,public.checkin_entries,public.checkin_audit,public.checkin_requests FROM service_role;
GRANT SELECT ON public.checkin_sessions,public.checkin_entries,public.checkin_audit TO service_role;
REVOKE ALL ON SEQUENCE public.checkin_audit_id_seq FROM PUBLIC,anon,authenticated,service_role;
COMMIT;
