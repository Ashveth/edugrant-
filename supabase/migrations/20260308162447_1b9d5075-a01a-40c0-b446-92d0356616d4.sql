
CREATE TABLE public.scholarship_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  scholarship_id text NOT NULL,
  email text NOT NULL,
  remind_7_days boolean NOT NULL DEFAULT true,
  remind_3_days boolean NOT NULL DEFAULT true,
  remind_1_day boolean NOT NULL DEFAULT true,
  last_reminded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, scholarship_id)
);

ALTER TABLE public.scholarship_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders" ON public.scholarship_reminders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reminders" ON public.scholarship_reminders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reminders" ON public.scholarship_reminders FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reminders" ON public.scholarship_reminders FOR DELETE TO authenticated USING (auth.uid() = user_id);
