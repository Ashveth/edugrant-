
-- Student profiles table (academic/personal data for matching)
CREATE TABLE public.student_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  age INTEGER NOT NULL DEFAULT 18,
  gender TEXT NOT NULL DEFAULT 'Male',
  category TEXT NOT NULL DEFAULT 'General',
  annual_family_income INTEGER NOT NULL DEFAULT 300000,
  academic_percentage NUMERIC NOT NULL DEFAULT 75,
  education_level TEXT NOT NULL DEFAULT 'Undergraduate',
  field_of_study TEXT NOT NULL DEFAULT 'Engineering',
  state TEXT NOT NULL DEFAULT 'Maharashtra',
  target_course_cost INTEGER NOT NULL DEFAULT 500000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own student profile" ON public.student_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own student profile" ON public.student_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own student profile" ON public.student_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Saved scholarships table
CREATE TABLE public.saved_scholarships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scholarship_id TEXT NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, scholarship_id)
);

ALTER TABLE public.saved_scholarships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved scholarships" ON public.saved_scholarships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved scholarships" ON public.saved_scholarships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved scholarships" ON public.saved_scholarships FOR DELETE USING (auth.uid() = user_id);

-- Application tracking table
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scholarship_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT DEFAULT '',
  applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, scholarship_id)
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications" ON public.applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON public.applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own applications" ON public.applications FOR DELETE USING (auth.uid() = user_id);
