CREATE TABLE public.story_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT,
  story TEXT NOT NULL,
  why_interview TEXT NOT NULL,
  links TEXT,
  consent_contact BOOLEAN NOT NULL DEFAULT true,
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.story_submissions TO anon;
GRANT INSERT ON public.story_submissions TO authenticated;
GRANT ALL ON public.story_submissions TO service_role;

ALTER TABLE public.story_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a story"
  ON public.story_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(name)) > 0
    AND length(name) <= 120
    AND length(email) <= 255
    AND length(story) BETWEEN 1 AND 4000
    AND length(why_interview) BETWEEN 1 AND 2000
    AND (location IS NULL OR length(location) <= 160)
    AND (links IS NULL OR length(links) <= 600)
  );