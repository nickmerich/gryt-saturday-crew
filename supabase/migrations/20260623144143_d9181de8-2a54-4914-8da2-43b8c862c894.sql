CREATE TABLE public.partner_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT,
  involvement TEXT NOT NULL,
  message TEXT,
  ip_hash TEXT
);

GRANT INSERT ON public.partner_inquiries TO anon, authenticated;
GRANT ALL ON public.partner_inquiries TO service_role;

ALTER TABLE public.partner_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a partner inquiry"
  ON public.partner_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);