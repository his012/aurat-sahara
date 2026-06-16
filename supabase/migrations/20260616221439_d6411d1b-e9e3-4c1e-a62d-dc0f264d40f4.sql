ALTER TABLE public.certificate_requests
ADD COLUMN IF NOT EXISTS cnic_image_urls TEXT[] NOT NULL DEFAULT '{}'::text[];