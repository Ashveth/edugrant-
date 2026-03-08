
CREATE TABLE public.scholarship_doc_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  scholarship_id text NOT NULL,
  document_name text NOT NULL,
  is_completed boolean NOT NULL DEFAULT false,
  file_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, scholarship_id, document_name)
);

ALTER TABLE public.scholarship_doc_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checklist" ON public.scholarship_doc_checklist FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checklist" ON public.scholarship_doc_checklist FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checklist" ON public.scholarship_doc_checklist FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own checklist" ON public.scholarship_doc_checklist FOR DELETE TO authenticated USING (auth.uid() = user_id);
