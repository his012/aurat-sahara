ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS full_name_ur text,
  ADD COLUMN IF NOT EXISTS skill_ur text;