-- READ ONLY. Run only after an isolated staging project is identified.
-- Catalog checks only: no runner records, tokens, auth users or secrets returned.
-- This does not verify that the selected project is staging or test real login.
WITH wanted_tables(name) AS (
  VALUES ('checkin_sessions'),('checkin_entries'),('checkin_audit'),('checkin_requests')
), wanted_functions(signature) AS (
  VALUES
    ('public.read_gryt_checkin(text)'),
    ('public.write_gryt_checkin(uuid,text,uuid,text,jsonb,integer,text,uuid,boolean,text,text,boolean)')
), table_checks AS (
  SELECT 'table_exists_and_rls:'||w.name AS gate,
    coalesce(c.relrowsecurity,false) AS passed
  FROM wanted_tables w LEFT JOIN pg_class c ON c.oid=to_regclass('public.'||w.name)
), role_checks AS (
  SELECT 'no_direct_mutation:'||role||':'||name AS gate,
    CASE WHEN to_regclass('public.'||name) IS NULL THEN false ELSE
      NOT has_table_privilege(role,'public.'||name,'INSERT')
      AND NOT has_table_privilege(role,'public.'||name,'UPDATE')
      AND NOT has_table_privilege(role,'public.'||name,'DELETE')
      AND NOT has_table_privilege(role,'public.'||name,'TRUNCATE')
    END AS passed
  FROM wanted_tables CROSS JOIN (VALUES ('anon'),('authenticated'),('service_role')) roles(role)
), private_checks AS (
  SELECT 'no_public_read:'||role||':'||name AS gate,
    CASE WHEN to_regclass('public.'||name) IS NULL THEN false ELSE
      NOT has_table_privilege(role,'public.'||name,'SELECT') END AS passed
  FROM wanted_tables CROSS JOIN (VALUES ('anon'),('authenticated')) roles(role)
), function_checks AS (
  SELECT 'rpc_guard:'||signature AS gate,
    coalesce(p.prosecdef AND p.proconfig @> ARRAY['search_path=public']
      AND has_function_privilege('service_role',p.oid,'EXECUTE')
      AND NOT has_function_privilege('anon',p.oid,'EXECUTE')
      AND NOT has_function_privilege('authenticated',p.oid,'EXECUTE'),false) AS passed
  FROM wanted_functions w LEFT JOIN pg_proc p ON p.oid=to_regprocedure(w.signature)
)
SELECT * FROM table_checks
UNION ALL SELECT * FROM role_checks
UNION ALL SELECT * FROM private_checks
UNION ALL SELECT * FROM function_checks
ORDER BY gate;
