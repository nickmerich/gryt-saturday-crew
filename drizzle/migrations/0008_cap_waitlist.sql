CREATE TABLE public.cap_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL UNIQUE CHECK (length(email) BETWEEN 3 AND 255),
  product text NOT NULL DEFAULT 'founding-member-cap'
);
GRANT ALL ON public.cap_waitlist TO service_role;
ALTER TABLE public.cap_waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service manages cap waitlist" ON public.cap_waitlist FOR ALL TO service_role USING (true) WITH CHECK (true);