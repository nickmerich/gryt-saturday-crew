CREATE TABLE public.runner_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL CHECK (char_length(first_name) BETWEEN 1 AND 40),
  email text CHECK (email IS NULL OR char_length(email) <= 255),
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text NOT NULL CHECK (char_length(body) BETWEEN 10 AND 600),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','hidden')),
  consent_at timestamptz NOT NULL,
  consent_version text NOT NULL DEFAULT 'review-2026-11',
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);
CREATE INDEX runner_reviews_status_idx ON public.runner_reviews (status, created_at DESC);
CREATE INDEX runner_reviews_email_idx ON public.runner_reviews (email, created_at);
GRANT ALL ON public.runner_reviews TO service_role;
ALTER TABLE public.runner_reviews ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.runner_reviews_daily_limit() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.email IS NOT NULL AND (SELECT count(*) FROM public.runner_reviews WHERE email = NEW.email AND created_at > now() - interval '1 day') >= 2 THEN
    RAISE EXCEPTION 'review_daily_limit' USING ERRCODE = 'P0001';
  END IF;
  IF (SELECT count(*) FROM public.runner_reviews WHERE created_at > now() - interval '1 day') >= 100 THEN
    RAISE EXCEPTION 'review_daily_limit' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER runner_reviews_daily_limit BEFORE INSERT ON public.runner_reviews FOR EACH ROW EXECUTE FUNCTION public.runner_reviews_daily_limit();