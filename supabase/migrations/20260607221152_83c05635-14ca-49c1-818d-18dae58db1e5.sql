ALTER TABLE public.notifications
ADD COLUMN request_id uuid REFERENCES public.certificate_requests(id) ON DELETE SET NULL;