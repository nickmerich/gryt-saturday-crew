-- SYNTHETIC, TRANSACTIONAL TEST ONLY.
-- Approved target: gryt-attendance-staging / ccyejgyootpqnhfblffi.
-- Refuse production outside this script by checking project identity before invocation.
-- Fixture actor UUIDs are not real Auth accounts. This is a DB/RPC test, not login QA.
-- All synthetic records roll back. No workers or outbound providers are invoked.
BEGIN;
SET LOCAL ROLE service_role;
DO $test$
DECLARE
  run jsonb := '{"id":"gryt-saturday-2026-09-19","version":1,"localDate":"2026-09-19","timezone":"America/New_York","startsAt":"2026-09-19T11:00:00.000Z","endsAt":"2026-09-19T12:00:00.000Z","number":20,"label":"GRYT Run #20 · Sat, Sep 19, 2026 · 7:00 AM","timeLabel":"7:00 AM","status":"scheduled","notice":"","location":"212 Valley Brook Road, McMurray, PA","route":"Montour / Peters Trail"}';
  actor uuid := gen_random_uuid();
  attendee uuid;
  walkin uuid := gen_random_uuid();
  request uuid := gen_random_uuid();
  receipt jsonb;
  board jsonb;
  before_jobs integer;
BEGIN
  SELECT count(*) INTO before_jobs FROM attendance_jobs;
  receipt := capture_gryt_rsvp(gen_random_uuid(),'synthetic-capture-hash','staging-'||gen_random_uuid(),
    'STAGING Fixture Runner','staging-fixture@example.invalid','email',NULL,NULL,run,'{}');
  attendee := (receipt->>'id')::uuid;
  ASSERT attendee IS NOT NULL, 'RSVP capture did not return a receipt';
  board := read_gryt_checkin(run->>'id');
  ASSERT jsonb_array_length(board->'entries')=0, 'RSVP was incorrectly treated as attendance';
  ASSERT (SELECT count(*) FROM attendance_jobs)=before_jobs+3, 'Unexpected initial job count';

  receipt := write_gryt_checkin(request,'synthetic-checkin-hash',actor,'staging-organizer@example.invalid',
    run,0,'mark',attendee,true,NULL,NULL,false);
  ASSERT (receipt->>'revision')::int=1, 'First check-in revision';
  receipt := write_gryt_checkin(request,'synthetic-checkin-hash',actor,'staging-organizer@example.invalid',
    run,0,'mark',attendee,true,NULL,NULL,false);
  ASSERT (receipt->>'revision')::int=1, 'Idempotent retry changed revision';
  ASSERT jsonb_array_length(read_gryt_checkin(run->>'id')->'audit')=1, 'Retry duplicated audit';

  BEGIN
    PERFORM write_gryt_checkin(gen_random_uuid(),'stale',actor,'staging-organizer@example.invalid',
      run,0,'mark',attendee,true,NULL,NULL,false);
    RAISE EXCEPTION 'Expected revision conflict';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM<>'CHECKIN_REVISION' THEN RAISE; END IF;
  END;
  BEGIN
    PERFORM write_gryt_checkin(gen_random_uuid(),'duplicate',actor,'staging-organizer@example.invalid',
      run,1,'walkin',walkin,true,' staging   FIXTURE Runner ',NULL,false);
    RAISE EXCEPTION 'Expected duplicate-name conflict';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM<>'CHECKIN_DUPLICATE' THEN RAISE; END IF;
  END;
  PERFORM write_gryt_checkin(gen_random_uuid(),'walkin',actor,'staging-organizer@example.invalid',
    run,1,'walkin',walkin,true,'STAGING Distinct Walk-in',NULL,false);
  PERFORM write_gryt_checkin(gen_random_uuid(),'correction',actor,'staging-organizer@example.invalid',
    run,2,'mark',attendee,false,NULL,'Synthetic wrong-runner correction',false);
  PERFORM write_gryt_checkin(gen_random_uuid(),'close',actor,'staging-organizer@example.invalid',
    run,3,'close',NULL,NULL,NULL,'Synthetic headcount reconciled',false);
  BEGIN
    PERFORM write_gryt_checkin(gen_random_uuid(),'closed-write',actor,'staging-organizer@example.invalid',
      run,4,'mark',attendee,true,NULL,NULL,false);
    RAISE EXCEPTION 'Expected closed-session rejection';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM<>'CHECKIN_CLOSED' THEN RAISE; END IF;
  END;
  PERFORM write_gryt_checkin(gen_random_uuid(),'reopen',actor,'staging-organizer@example.invalid',
    run,4,'reopen',NULL,NULL,NULL,'Synthetic reopening for correction',false);
  board := read_gryt_checkin(run->>'id');
  ASSERT (board->'session'->>'revision')::int=5, 'Unexpected final revision';
  ASSERT (board->'session'->>'closed')::boolean=false, 'Reopen failed';
  ASSERT jsonb_array_length(board->'audit')=5, 'Audit count mismatch';
  ASSERT (SELECT count(*) FROM jsonb_array_elements(board->'entries') e WHERE (e->>'present')::boolean)=1,
    'Unrecorded runner became attendance';
  ASSERT (SELECT count(*) FROM attendance_jobs)=before_jobs+3, 'Check-in unexpectedly created jobs';
  ASSERT NOT EXISTS(SELECT 1 FROM attendance_jobs WHERE rsvp_id=attendee AND status<>'pending'),
    'Synthetic jobs were processed unexpectedly';
  BEGIN
    DELETE FROM checkin_audit WHERE event_id=run->>'id';
    RAISE EXCEPTION 'Direct service-role audit mutation was allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $test$;
SET LOCAL ROLE anon;
DO $test$
BEGIN
  BEGIN
    PERFORM read_gryt_checkin('gryt-saturday-2026-09-19');
    RAISE EXCEPTION 'Anonymous RPC read was allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM 1 FROM checkin_entries;
    RAISE EXCEPTION 'Anonymous ledger read was allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $test$;
SET LOCAL ROLE authenticated;
DO $test$
BEGIN
  BEGIN
    PERFORM read_gryt_checkin('gryt-saturday-2026-09-19');
    RAISE EXCEPTION 'Member RPC read was allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    INSERT INTO rsvps(name,contact) VALUES('STAGING Forbidden','blocked@example.invalid');
    RAISE EXCEPTION 'Direct member RSVP write was allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $test$;
ROLLBACK;
SELECT 'hosted_database_smoke_passed' AS result,
  'synthetic fixture transaction rolled back; auth and browser not exercised' AS scope;
