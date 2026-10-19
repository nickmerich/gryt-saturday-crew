-- Apply to isolated staging first. Never put OAuth secrets in public settings.
create table if not exists public.strava_club_connections (
  club_id bigint primary key,
  encrypted_tokens text not null,
  member_count integer check (member_count >= 0),
  verified_at timestamptz,
  refresh_lease uuid,
  refresh_lease_until timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.strava_club_connections enable row level security;
revoke all on public.strava_club_connections from public, anon, authenticated;
grant select, insert, update, delete on public.strava_club_connections to service_role;

-- Atomic cross-worker lease prevents concurrent refresh-token rotation.
create or replace function public.claim_strava_club_refresh(p_club_id bigint, p_lease uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare claimed integer;
begin
  update public.strava_club_connections
  set refresh_lease = p_lease, refresh_lease_until = now() + interval '60 seconds'
  where club_id = p_club_id
    and (refresh_lease_until is null or refresh_lease_until < now());
  get diagnostics claimed = row_count;
  return claimed = 1;
end;
$$;
revoke all on function public.claim_strava_club_refresh(bigint, uuid) from public, anon, authenticated;
grant execute on function public.claim_strava_club_refresh(bigint, uuid) to service_role;
