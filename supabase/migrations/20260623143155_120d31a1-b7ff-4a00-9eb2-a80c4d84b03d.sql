CREATE TABLE public.recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  category text NOT NULL,
  message text NOT NULL,
  ip_hash text
);

GRANT INSERT ON public.recommendations TO anon, authenticated;
GRANT SELECT ON public.recommendations TO service_role;
GRANT ALL ON public.recommendations TO service_role;

ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a recommendation"
  ON public.recommendations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(btrim(category)) BETWEEN 1 AND 40
    AND length(btrim(message)) BETWEEN 1 AND 500
  );