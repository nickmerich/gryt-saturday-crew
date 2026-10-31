-- Saturday Soundtrack: one optional song per RSVP, plus an explicit opt-in
-- for crediting the runner's first name next to it in a public run report.
-- Additive only. Existing RSVP rows and policies are untouched; writes come
-- from the service-role RSVP handler.
ALTER TABLE public.rsvps
  ADD COLUMN IF NOT EXISTS song text,
  ADD COLUMN IF NOT EXISTS song_credit boolean NOT NULL DEFAULT false;

ALTER TABLE public.rsvps
  DROP CONSTRAINT IF EXISTS rsvps_song_length;
ALTER TABLE public.rsvps
  ADD CONSTRAINT rsvps_song_length CHECK (song IS NULL OR length(song) BETWEEN 2 AND 120);
