-- Personal invite links and the opt-in "who's going" list.
--
-- invite_code    stable per-person code (first name + short hash), written on
--                every RSVP so a referrer can be resolved without a members table.
-- referred_by    the invite_code of the person whose link brought this RSVP.
-- going_list_ok  explicit opt-in before a first name can appear on the public
--                "who's going" list for this run. Off by default.
ALTER TABLE public.rsvps
  ADD COLUMN IF NOT EXISTS invite_code text,
  ADD COLUMN IF NOT EXISTS referred_by text,
  ADD COLUMN IF NOT EXISTS going_list_ok boolean NOT NULL DEFAULT false;

ALTER TABLE public.rsvps DROP CONSTRAINT IF EXISTS rsvps_invite_code_format;
ALTER TABLE public.rsvps
  ADD CONSTRAINT rsvps_invite_code_format
  CHECK (invite_code IS NULL OR invite_code ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$');

ALTER TABLE public.rsvps DROP CONSTRAINT IF EXISTS rsvps_referred_by_format;
ALTER TABLE public.rsvps
  ADD CONSTRAINT rsvps_referred_by_format
  CHECK (referred_by IS NULL OR referred_by ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$');

-- Nobody brings themselves.
ALTER TABLE public.rsvps DROP CONSTRAINT IF EXISTS rsvps_no_self_referral;
ALTER TABLE public.rsvps
  ADD CONSTRAINT rsvps_no_self_referral
  CHECK (referred_by IS NULL OR invite_code IS NULL OR referred_by <> invite_code);

CREATE INDEX IF NOT EXISTS rsvps_referred_by_idx ON public.rsvps (referred_by) WHERE referred_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS rsvps_invite_code_idx ON public.rsvps (invite_code) WHERE invite_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS rsvps_event_id_going_idx ON public.rsvps (event_id) WHERE going_list_ok;
