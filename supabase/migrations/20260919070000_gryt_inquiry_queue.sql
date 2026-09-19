-- New, isolated intake store. No writes to RSVPs, attendance, members or email systems.
create table public.gryt_inquiries (
  id uuid primary key default gen_random_uuid(),
  idempotency_key uuid not null unique,
  kind text not null check (kind in ('attendee', 'vendor', 'brand')),
  payload jsonb not null,
  stage text not null default 'New',
  owner text not null default '',
  next_action text not null default '',
  due date,
  notes jsonb not null default '[]'::jsonb,
  history jsonb not null default '[]'::jsonb,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inquiry_stage_matches_kind check (
    (kind = 'attendee' and stage in ('New','Reviewed','Follow-up due','Closed')) or
    (kind = 'vendor' and stage in ('New','Reviewing','Needs info','Shortlisted','Closed')) or
    (kind = 'brand' and stage in ('New','Reviewing','Needs info','Qualified','Proposal','Closed'))
  ),
  constraint due_requires_action check (due is null or length(trim(next_action)) > 0)
);
alter table public.gryt_inquiries enable row level security;
-- No anonymous or authenticated client grants/policies. Server authorizes every admin request.
revoke all on public.gryt_inquiries from anon, authenticated;
grant select, insert, update on public.gryt_inquiries to service_role;
create index gryt_inquiries_created on public.gryt_inquiries(created_at desc, id desc);
create index gryt_inquiries_followup on public.gryt_inquiries(due) where stage <> 'Closed';
create index gryt_inquiries_email_rate on public.gryt_inquiries((payload->>'email'), created_at);

-- Atomic duplicate-safe intake + per-contact throttling across all app instances.
create function public.submit_gryt_inquiry(p_key uuid, p_kind text, p_payload jsonb)
returns uuid language plpgsql security invoker set search_path = public as $$
declare existing public.gryt_inquiries; result_id uuid; saved_payload jsonb;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_key::text, 0));
  select * into existing from public.gryt_inquiries where idempotency_key = p_key;
  if found then
    if existing.kind <> p_kind or
      (existing.payload - 'consent_recorded_at' - 'consent_version') <> p_payload then
      raise exception 'INQUIRY_KEY_CONFLICT';
    end if;
    return existing.id;
  end if;
  perform pg_advisory_xact_lock(hashtextextended(lower(p_payload->>'email'), 1));
  if (select count(*) from public.gryt_inquiries
      where payload->>'email' = lower(p_payload->>'email')
      and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'INQUIRY_RATE_LIMIT';
  end if;
  saved_payload := p_payload || jsonb_build_object('consent_version', 'gryt-inquiry-v1', 'consent_recorded_at', now());
  insert into public.gryt_inquiries(idempotency_key, kind, payload, history)
    values (p_key, p_kind, saved_payload,
      jsonb_build_array(jsonb_build_object('at', now(), 'actor', 'Inquiry form', 'action', 'Inquiry received')))
    returning id into result_id;
  return result_id;
end;
$$;
revoke all on function public.submit_gryt_inquiry(uuid,text,jsonb) from public, anon, authenticated;
grant execute on function public.submit_gryt_inquiry(uuid,text,jsonb) to service_role;
