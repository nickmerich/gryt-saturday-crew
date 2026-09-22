-- REVIEW ONLY. No production migration or historical attendance inference.
BEGIN;
CREATE TABLE IF NOT EXISTS public.checkin_sessions (
  event_id text PRIMARY KEY,
  event_snapshot jsonb NOT NULL,
  revision integer NOT NULL DEFAULT 0 CHECK (revision >= 0),
  closed boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.checkin_entries (
  event_id text NOT NULL REFERENCES public.checkin_sessions(event_id),
  participant_id uuid NOT NULL,
  rsvp_id uuid REFERENCES public.rsvps(id),
  name text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 80),
  present boolean NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(event_id,participant_id),
  UNIQUE(event_id,rsvp_id)
);
CREATE TABLE IF NOT EXISTS public.checkin_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id text NOT NULL REFERENCES public.checkin_sessions(event_id),
  participant_id uuid,
  action text NOT NULL CHECK(action IN ('mark','walkin','close','reopen')),
  previous_present boolean,
  present boolean,
  reason text,
  actor_id uuid NOT NULL,
  actor_email text NOT NULL,
  revision integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.checkin_requests (
  request_id uuid PRIMARY KEY,
  payload_hash text NOT NULL,
  actor_id uuid NOT NULL,
  result jsonb NOT NULL
);
ALTER TABLE public.checkin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkin_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkin_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkin_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.checkin_sessions,public.checkin_entries,public.checkin_audit,public.checkin_requests FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.checkin_sessions,public.checkin_entries,public.checkin_audit TO service_role;
CREATE INDEX IF NOT EXISTS checkin_audit_event ON public.checkin_audit(event_id,id DESC);

-- One read statement provides a consistent roster/session/audit snapshot.
CREATE OR REPLACE FUNCTION public.read_gryt_checkin(p_event_id text)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
 SELECT jsonb_build_object(
   'session',(SELECT to_jsonb(s) FROM checkin_sessions s WHERE event_id=p_event_id),
   'rsvps',coalesce((SELECT jsonb_agg(jsonb_build_object('id',id,'name',name,'contact',contact,'event_snapshot',event_snapshot) ORDER BY created_at,id) FROM rsvps WHERE event_id=p_event_id),'[]'::jsonb),
   'entries',coalesce((SELECT jsonb_agg(to_jsonb(e)) FROM checkin_entries e WHERE event_id=p_event_id),'[]'::jsonb),
   'audit',coalesce((SELECT jsonb_agg(to_jsonb(a) ORDER BY id DESC) FROM (SELECT * FROM checkin_audit WHERE event_id=p_event_id ORDER BY id DESC LIMIT 51) a),'[]'::jsonb)
 );
$$;

CREATE OR REPLACE FUNCTION public.write_gryt_checkin(
 p_request uuid,p_hash text,p_actor uuid,p_email text,p_event jsonb,p_expected integer,
 p_action text,p_participant uuid,p_present boolean,p_name text,p_reason text,p_duplicate_reviewed boolean
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE s checkin_sessions%ROWTYPE; old_request checkin_requests%ROWTYPE;
 e checkin_entries%ROWTYPE; r rsvps%ROWTYPE; previous boolean; result jsonb;
 eid text := p_event->>'id';
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(p_request::text,27));
 SELECT * INTO old_request FROM checkin_requests WHERE request_id=p_request;
 IF FOUND THEN
   IF old_request.payload_hash<>p_hash OR old_request.actor_id<>p_actor THEN RAISE EXCEPTION 'CHECKIN_KEY_CONFLICT'; END IF;
   RETURN old_request.result;
 END IF;
 IF p_action NOT IN ('mark','walkin','close','reopen') OR p_actor IS NULL OR nullif(p_email,'') IS NULL THEN
   RAISE EXCEPTION 'CHECKIN_INVALID';
 END IF;
 IF p_event->>'status' NOT IN ('scheduled','modified','completed') OR
    (p_event->>'startsAt')::timestamptz > now()+interval '1 hour' THEN
   RAISE EXCEPTION 'CHECKIN_NOT_OPEN';
 END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(eid,28));
 INSERT INTO checkin_sessions(event_id,event_snapshot) VALUES(eid,p_event) ON CONFLICT DO NOTHING;
 SELECT * INTO s FROM checkin_sessions WHERE event_id=eid FOR UPDATE;
 IF s.event_snapshot<>p_event THEN RAISE EXCEPTION 'CHECKIN_EVENT_CHANGED'; END IF;
 IF s.revision<>p_expected THEN RAISE EXCEPTION 'CHECKIN_REVISION'; END IF;
 IF s.closed AND p_action<>'reopen' THEN RAISE EXCEPTION 'CHECKIN_CLOSED'; END IF;
 IF NOT s.closed AND p_action='reopen' THEN RAISE EXCEPTION 'CHECKIN_REVISION'; END IF;
 IF p_action IN ('close','reopen') OR (p_action='mark' AND p_present=false) THEN
   IF p_reason IS NULL OR length(trim(p_reason)) NOT BETWEEN 3 AND 240 THEN RAISE EXCEPTION 'CHECKIN_REASON'; END IF;
 END IF;
 IF p_action='close' AND (p_event->>'endsAt')::timestamptz > now() THEN RAISE EXCEPTION 'CHECKIN_NOT_ENDED'; END IF;
 IF p_action IN ('mark','walkin') THEN
   IF p_participant IS NULL THEN RAISE EXCEPTION 'CHECKIN_INVALID'; END IF;
   SELECT * INTO e FROM checkin_entries WHERE event_id=eid AND participant_id=p_participant;
   previous := e.present;
   IF p_action='walkin' THEN
     IF e.participant_id IS NOT NULL OR EXISTS(SELECT 1 FROM rsvps WHERE id=p_participant) THEN RAISE EXCEPTION 'CHECKIN_DUPLICATE'; END IF;
     IF p_name IS NULL OR length(trim(p_name)) NOT BETWEEN 1 AND 80 THEN RAISE EXCEPTION 'CHECKIN_INVALID'; END IF;
     IF NOT coalesce(p_duplicate_reviewed,false) AND (
       EXISTS(SELECT 1 FROM rsvps WHERE event_id=eid AND lower(regexp_replace(trim(name),'\s+',' ','g'))=lower(regexp_replace(trim(p_name),'\s+',' ','g'))) OR
       EXISTS(SELECT 1 FROM checkin_entries WHERE event_id=eid AND lower(regexp_replace(trim(name),'\s+',' ','g'))=lower(regexp_replace(trim(p_name),'\s+',' ','g')))
     ) THEN RAISE EXCEPTION 'CHECKIN_DUPLICATE'; END IF;
     INSERT INTO checkin_entries(event_id,participant_id,name,present) VALUES(eid,p_participant,trim(p_name),true);
     p_present := true;
   ELSE
     IF p_present IS NULL THEN RAISE EXCEPTION 'CHECKIN_INVALID'; END IF;
     IF e.participant_id IS NULL THEN
       SELECT * INTO r FROM rsvps WHERE id=p_participant AND event_id=eid;
       IF NOT FOUND THEN RAISE EXCEPTION 'CHECKIN_PERSON'; END IF;
       INSERT INTO checkin_entries(event_id,participant_id,rsvp_id,name,present) VALUES(eid,p_participant,r.id,r.name,p_present);
     ELSE
       UPDATE checkin_entries SET present=p_present,recorded_at=now() WHERE event_id=eid AND participant_id=p_participant;
     END IF;
   END IF;
 ELSE
   UPDATE checkin_sessions SET closed=(p_action='close') WHERE event_id=eid;
 END IF;
 UPDATE checkin_sessions SET revision=revision+1,updated_at=now() WHERE event_id=eid RETURNING * INTO s;
 INSERT INTO checkin_audit(event_id,participant_id,action,previous_present,present,reason,actor_id,actor_email,revision)
 VALUES(eid,p_participant,p_action,previous,p_present,p_reason,p_actor,p_email,s.revision);
 result := jsonb_build_object('success',true,'revision',s.revision);
 INSERT INTO checkin_requests VALUES(p_request,p_hash,p_actor,result);
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.read_gryt_checkin(text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.write_gryt_checkin(uuid,text,uuid,text,jsonb,integer,text,uuid,boolean,text,text,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.read_gryt_checkin(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.write_gryt_checkin(uuid,text,uuid,text,jsonb,integer,text,uuid,boolean,text,text,boolean) TO service_role;
COMMIT;
