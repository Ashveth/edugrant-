
CREATE OR REPLACE FUNCTION public.register_as_provider(
  _organization_name text,
  _description text DEFAULT '',
  _website text DEFAULT '',
  _contact_email text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert provider role if not exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'provider')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Insert provider profile
  INSERT INTO public.provider_profiles (user_id, organization_name, description, website, contact_email)
  VALUES (auth.uid(), _organization_name, _description, _website, _contact_email)
  ON CONFLICT (user_id) DO UPDATE SET
    organization_name = EXCLUDED.organization_name,
    description = EXCLUDED.description,
    website = EXCLUDED.website,
    contact_email = EXCLUDED.contact_email,
    updated_at = now();
END;
$$;
