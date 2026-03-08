
ALTER TABLE public.scholarships
  ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS funding_type text NOT NULL DEFAULT 'Partial',
  ADD COLUMN IF NOT EXISTS university text DEFAULT '',
  ADD COLUMN IF NOT EXISTS eligibility_criteria text DEFAULT '',
  ADD COLUMN IF NOT EXISTS application_process text DEFAULT '',
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
