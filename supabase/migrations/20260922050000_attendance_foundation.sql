-- Review migration only. Apply in staging before enabling the new RSVP endpoint.
-- No historical attendance is created or inferred. Existing waivers are untouched.
BEGIN;
ALTER TABLE public.rsvps
  ADD COLUMN IF NOT EXISTS event_id text,
  ADD COLUMN IF NOT EXISTS event_version integer,
  ADD COLUMN IF NOT EXISTS event_snapshot jsonb,
  ADD COLUMN IF NOT EXISTS capture_key text,
  ADD COLUMN IF NOT EXISTS contact_kind text,
  ADD COLUMN IF NOT EXISTS attribution jsonb NOT NULL DEFAULT '{}'::jsonb;
CREATE UNIQUE INDEX IF NOT EXISTS rsvps_capture_key_unique ON public.rsvps(capture_key) WHERE capture_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.rsvp_requests (
  key uuid PRIMARY KEY,
  payload_hash text NOT NULL,
  rsvp_id uuid NOT NULL REFERENCES public.rsvps(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.attendance_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rsvp_id uuid NOT NULL REFERENCES public.rsvps(id),
  kind text NOT NULL CHECK (kind IN ('confirmation','owner_notification','notion')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','accepted','suppressed','succeeded','failed','needs_review','cancelled')),
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  lease_until timestamptz,
  claim_token uuid,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(rsvp_id,kind)
);
ALTER TABLE public.rsvp_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_jobs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rsvp_requests, public.attendance_jobs FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.rsvp_requests, public.attendance_jobs TO service_role;
-- Force RSVP writes through the validated server path. Existing server code uses service_role.
REVOKE INSERT ON public.rsvps FROM anon, authenticated;
CREATE INDEX IF NOT EXISTS attendance_jobs_due ON public.attendance_jobs(next_attempt_at) WHERE status='pending';

CREATE OR REPLACE FUNCTION public.capture_gryt_rsvp(
  p_key uuid, p_hash text, p_capture_key text, p_name text, p_contact text,
  p_kind text, p_source text, p_variant text, p_event jsonb, p_attribution jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE existing_request public.rsvp_requests%ROWTYPE; existing_id uuid; new_record boolean := false;
BEGIN
  -- Serialize logical contact writes, including alternate idempotency keys.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_key::text, 1));
  PERFORM pg_advisory_xact_lock(hashtextextended(p_contact, 0));
  SELECT * INTO existing_request FROM public.rsvp_requests WHERE key=p_key;
  IF FOUND THEN
    IF existing_request.payload_hash <> p_hash THEN RAISE EXCEPTION 'RSVP_KEY_CONFLICT'; END IF;
    RETURN jsonb_build_object('id',existing_request.rsvp_id,'created',false);
  END IF;
  SELECT id INTO existing_id FROM public.rsvps WHERE capture_key=p_capture_key;
  IF existing_id IS NOT NULL AND EXISTS(
    SELECT 1 FROM public.rsvps WHERE id=existing_id AND event_version<>(p_event->>'version')::int
  ) THEN RAISE EXCEPTION 'RSVP_EVENT_CHANGED'; END IF;
  IF (SELECT count(*) FROM public.rsvp_requests q JOIN public.rsvps r ON r.id=q.rsvp_id
      WHERE r.contact=p_contact AND q.created_at>now()-interval '1 hour') >= 60 THEN
    RAISE EXCEPTION 'RSVP_RATE_LIMIT';
  END IF;
  IF existing_id IS NULL THEN
    IF (SELECT count(*) FROM public.rsvps WHERE contact=p_contact AND created_at > now()-interval '1 hour') >= 10 THEN
      RAISE EXCEPTION 'RSVP_RATE_LIMIT';
    END IF;
    INSERT INTO public.rsvps(name,contact,source,hero_variant,event_label,event_id,event_version,event_snapshot,capture_key,contact_kind,attribution)
    VALUES(p_name,p_contact,p_source,p_variant,p_event->>'label',p_event->>'id',(p_event->>'version')::int,p_event,p_capture_key,p_kind,p_attribution)
    RETURNING id INTO existing_id;
    new_record := true;
    INSERT INTO public.attendance_jobs(rsvp_id,kind) VALUES(existing_id,'notion'),(existing_id,'owner_notification');
    IF p_kind='email' THEN INSERT INTO public.attendance_jobs(rsvp_id,kind) VALUES(existing_id,'confirmation'); END IF;
  END IF;
  INSERT INTO public.rsvp_requests(key,payload_hash,rsvp_id) VALUES(p_key,p_hash,existing_id);
  RETURN jsonb_build_object('id',existing_id,'created',new_record);
END $$;
REVOKE ALL ON FUNCTION public.capture_gryt_rsvp(uuid,text,text,text,text,text,text,text,jsonb,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.capture_gryt_rsvp(uuid,text,text,text,text,text,text,text,jsonb,jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.claim_attendance_job()
RETURNS SETOF public.attendance_jobs LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE chosen uuid;
BEGIN
  -- A single short batch runs at a time, avoiding concurrent Notion identity creates.
  PERFORM pg_advisory_xact_lock(723992205);
  -- Crashed/ambiguous sends are not automatically replayed: verify external result first.
  UPDATE public.attendance_jobs SET status='needs_review',last_error='Worker lease expired; verify provider result before replay.',updated_at=now()
    WHERE status='processing' AND lease_until < now();
  IF EXISTS(SELECT 1 FROM public.attendance_jobs WHERE status='processing') THEN RETURN; END IF;
  SELECT id INTO chosen FROM public.attendance_jobs WHERE status='pending' AND next_attempt_at<=now()
    ORDER BY created_at,id FOR UPDATE SKIP LOCKED LIMIT 1;
  IF chosen IS NULL THEN RETURN; END IF;
  RETURN QUERY UPDATE public.attendance_jobs SET status='processing',attempts=attempts+1,
    lease_until=now()+interval '5 minutes',claim_token=gen_random_uuid(),updated_at=now()
    WHERE id=chosen RETURNING *;
END $$;
REVOKE ALL ON FUNCTION public.claim_attendance_job() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_attendance_job() TO service_role;
COMMIT;
