
-- 1. User roles table for provider access
CREATE TYPE public.app_role AS ENUM ('admin', 'provider', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Users can view their own roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 2. Scholarships table (migrated from static data)
CREATE TABLE public.scholarships (
  id text PRIMARY KEY,
  name text NOT NULL,
  provider text NOT NULL,
  provider_user_id uuid,
  amount integer NOT NULL DEFAULT 0,
  deadline text NOT NULL,
  description text NOT NULL DEFAULT '',
  max_income integer,
  min_percentage numeric DEFAULT 0,
  categories text[] DEFAULT '{}',
  education_levels text[] DEFAULT '{}',
  fields_of_study text[] DEFAULT '{}',
  states text[] DEFAULT '{}',
  genders text[] DEFAULT '{}',
  application_url text DEFAULT '',
  required_documents text[] DEFAULT '{}',
  competition_level text NOT NULL DEFAULT 'Medium',
  provider_type text NOT NULL DEFAULT 'Government',
  is_active boolean NOT NULL DEFAULT true,
  accepts_direct_apply boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

-- Anyone can view active scholarships
CREATE POLICY "Anyone can view active scholarships" ON public.scholarships
  FOR SELECT USING (is_active = true);

-- Providers can manage their own scholarships
CREATE POLICY "Providers can insert own scholarships" ON public.scholarships
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'provider') AND provider_user_id = auth.uid());

CREATE POLICY "Providers can update own scholarships" ON public.scholarships
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'provider') AND provider_user_id = auth.uid());

-- Admins can manage all
CREATE POLICY "Admins can manage all scholarships" ON public.scholarships
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Enhance applications table with direct apply fields
ALTER TABLE public.applications
  ADD COLUMN phone text,
  ADD COLUMN date_of_birth date,
  ADD COLUMN institution_name text,
  ADD COLUMN statement_of_purpose text,
  ADD COLUMN country text DEFAULT 'India',
  ADD COLUMN full_name text,
  ADD COLUMN email text,
  ADD COLUMN education_level text,
  ADD COLUMN field_of_study text,
  ADD COLUMN gpa_percentage numeric,
  ADD COLUMN is_direct_apply boolean DEFAULT false;

-- 4. Application documents junction table
CREATE TABLE public.application_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  document_id uuid REFERENCES public.user_documents(id) ON DELETE SET NULL,
  document_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;

-- Users can manage their own application documents
CREATE POLICY "Users can view own app docs" ON public.application_documents
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.applications a WHERE a.id = application_id AND a.user_id = auth.uid()));

CREATE POLICY "Users can insert own app docs" ON public.application_documents
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.applications a WHERE a.id = application_id AND a.user_id = auth.uid()));

-- Providers can view application docs for their scholarships
CREATE POLICY "Providers can view app docs" ON public.application_documents
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'provider') AND
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.scholarships s ON s.id = a.scholarship_id
      WHERE a.id = application_id AND s.provider_user_id = auth.uid()
    )
  );

-- 5. Provider profiles table
CREATE TABLE public.provider_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  organization_name text NOT NULL,
  description text DEFAULT '',
  website text DEFAULT '',
  contact_email text,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can view own profile" ON public.provider_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Providers can update own profile" ON public.provider_profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Providers can insert own profile" ON public.provider_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Public can view provider profiles for scholarship listings
CREATE POLICY "Anyone can view provider profiles" ON public.provider_profiles
  FOR SELECT USING (true);

-- 6. Allow providers to view and update applications for their scholarships
CREATE POLICY "Providers can view applications for their scholarships" ON public.applications
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'provider') AND
    EXISTS (SELECT 1 FROM public.scholarships s WHERE s.id = scholarship_id AND s.provider_user_id = auth.uid())
  );

CREATE POLICY "Providers can update applications for their scholarships" ON public.applications
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'provider') AND
    EXISTS (SELECT 1 FROM public.scholarships s WHERE s.id = scholarship_id AND s.provider_user_id = auth.uid())
  );
