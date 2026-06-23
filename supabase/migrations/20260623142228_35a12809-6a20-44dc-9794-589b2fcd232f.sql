CREATE TABLE public.waiver_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  season smallint NOT NULL DEFAULT 2026,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  date_of_birth date NOT NULL,
  emergency_contact_name text NOT NULL,
  emergency_contact_phone text NOT NULL,
  signature_text text NOT NULL,
  signed_on date NOT NULL DEFAULT current_date,
  waiver_version text NOT NULL DEFAULT 'gryt-run-club-2026-v1',
  user_agent text,
  ip_hash text
);

GRANT INSERT ON public.waiver_signatures TO anon, authenticated;
GRANT ALL ON public.waiver_signatures TO service_role;

ALTER TABLE public.waiver_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a valid 2026 waiver"
  ON public.waiver_signatures
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    season = 2026
    AND length(btrim(full_name)) BETWEEN 1 AND 120
    AND length(btrim(email)) BETWEEN 3 AND 200
    AND length(btrim(signature_text)) BETWEEN 1 AND 120
    AND length(btrim(emergency_contact_name)) BETWEEN 1 AND 120
    AND length(btrim(emergency_contact_phone)) BETWEEN 3 AND 40
  );

CREATE OR REPLACE FUNCTION public.validate_waiver_signature()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.date_of_birth > current_date - interval '18 years' THEN
    RAISE EXCEPTION 'Signer must be at least 18 years old';
  END IF;
  IF NEW.season <> 2026 THEN
    RAISE EXCEPTION 'Only the 2026 season waiver is accepted';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER waiver_signatures_validate
  BEFORE INSERT ON public.waiver_signatures
  FOR EACH ROW EXECUTE FUNCTION public.validate_waiver_signature();