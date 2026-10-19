CREATE TABLE public.site_partners (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 name text NOT NULL, slug text NOT NULL UNIQUE, category text NOT NULL CHECK (category IN ('national','local','public')), role text NOT NULL,
 description text NOT NULL DEFAULT '', city text NOT NULL DEFAULT '', website_url text NOT NULL DEFAULT '', logo text NOT NULL DEFAULT '',
 is_affiliate boolean NOT NULL DEFAULT false, approved_to_show boolean NOT NULL DEFAULT false, featured_on_home boolean NOT NULL DEFAULT false, sort_order integer NOT NULL DEFAULT 0
);
GRANT ALL ON public.site_partners TO service_role;
ALTER TABLE public.site_partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service manages partners" ON public.site_partners FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE FUNCTION public.read_approved_partners(home_only boolean DEFAULT false)
RETURNS TABLE(name text,category text,role text,description text,city text,website_url text,logo text,is_affiliate boolean,sort_order integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT name,category,role,CASE WHEN description LIKE '%[%' OR description LIKE '%]%' THEN '' ELSE description END,city,website_url,logo,is_affiliate,sort_order
 FROM public.site_partners WHERE approved_to_show AND (NOT home_only OR featured_on_home) ORDER BY sort_order,name
$$;
REVOKE ALL ON FUNCTION public.read_approved_partners(boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.read_approved_partners(boolean) TO anon, authenticated, service_role;
ALTER TABLE public.partner_inquiries ADD COLUMN city text NOT NULL DEFAULT '', ADD COLUMN status text NOT NULL DEFAULT 'new' CHECK(status IN ('new','talking','partnered','declined')), ADD COLUMN source text NOT NULL DEFAULT 'legacy';
GRANT ALL ON public.partner_inquiries TO service_role;
CREATE FUNCTION public.limit_directory_partner_inquiry() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.source='partners' THEN
  NEW.email := lower(btrim(NEW.email));
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.email,0));
  IF EXISTS(SELECT 1 FROM public.partner_inquiries WHERE source='partners' AND lower(btrim(email))=NEW.email AND (created_at AT TIME ZONE 'America/New_York')::date=(now() AT TIME ZONE 'America/New_York')::date) THEN
   RAISE EXCEPTION 'PARTNER_DAILY_LIMIT';
  END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER directory_partner_daily_limit BEFORE INSERT ON public.partner_inquiries FOR EACH ROW EXECUTE FUNCTION public.limit_directory_partner_inquiry();