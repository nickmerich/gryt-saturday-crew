ALTER TABLE public.waiver_signatures
  ADD COLUMN IF NOT EXISTS is_minor boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS guardian_name text,
  ADD COLUMN IF NOT EXISTS guardian_relationship text;

COMMENT ON COLUMN public.waiver_signatures.is_minor IS 'True when the participant is under 18 and a parent/legal guardian signed on their behalf.';
COMMENT ON COLUMN public.waiver_signatures.guardian_name IS 'Full legal name of the signing parent or legal guardian. Required when is_minor is true.';
COMMENT ON COLUMN public.waiver_signatures.guardian_relationship IS 'Relationship of the signer to the minor participant (e.g. Mother, Father, Legal guardian).';

CREATE OR REPLACE FUNCTION public.validate_waiver_signature()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.date_of_birth > current_date - interval '18 years' THEN
    -- Minors are allowed, but only with a named parent or legal guardian signing.
    IF NEW.is_minor IS NOT TRUE
       OR NEW.guardian_name IS NULL
       OR length(btrim(NEW.guardian_name)) < 2
       OR NEW.guardian_relationship IS NULL
       OR length(btrim(NEW.guardian_relationship)) < 2 THEN
      RAISE EXCEPTION 'A participant under 18 requires a parent or legal guardian signature';
    END IF;
  ELSIF NEW.is_minor IS TRUE THEN
    RAISE EXCEPTION 'Participant is 18 or older and cannot be recorded as a minor';
  END IF;

  IF NEW.season <> 2026 THEN
    RAISE EXCEPTION 'Only the 2026 season waiver is accepted';
  END IF;
  RETURN NEW;
END;
$$;