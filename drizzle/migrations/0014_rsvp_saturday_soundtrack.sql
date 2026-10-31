-- Saturday Soundtrack: one optional song per RSVP, plus an explicit opt-in
-- before a first name can be credited next to it on the weekly playlist.
ALTER TABLE public.rsvps
  ADD COLUMN IF NOT EXISTS song text,
  ADD COLUMN IF NOT EXISTS song_credit_ok boolean NOT NULL DEFAULT false;

ALTER TABLE public.rsvps DROP CONSTRAINT IF EXISTS rsvps_song_length;
ALTER TABLE public.rsvps
  ADD CONSTRAINT rsvps_song_length CHECK (song IS NULL OR length(btrim(song)) BETWEEN 1 AND 200);

-- A credit without a song means nothing; never store one.
ALTER TABLE public.rsvps DROP CONSTRAINT IF EXISTS rsvps_song_credit_needs_song;
ALTER TABLE public.rsvps
  ADD CONSTRAINT rsvps_song_credit_needs_song CHECK (song_credit_ok = false OR song IS NOT NULL);

CREATE INDEX IF NOT EXISTS rsvps_event_id_song_idx ON public.rsvps (event_id) WHERE song IS NOT NULL;
