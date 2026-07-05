CREATE TABLE public.plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  price_inr integer NOT NULL DEFAULT 0,
  interval text NOT NULL DEFAULT 'month',
  description text NOT NULL DEFAULT '',
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  highlighted boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.plans TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plans TO authenticated;
GRANT ALL ON public.plans TO service_role;

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can view active plans" ON public.plans FOR SELECT TO anon, authenticated USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage plans" ON public.plans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.plans (name, price_inr, interval, description, features, highlighted, sort_order)
VALUES (
  'Full Access',
  999,
  'month',
  'One plan. Every AI tool, unlimited — for the entire month.',
  '["Unlimited generations across all AI tools","Complete Brand Strategy & Identity builder","Visual identity, logos & website copy","Marketing, social & launch planning","AI Brand Coach & competitor analysis","Unlimited saved projects","Priority AI models"]'::jsonb,
  true,
  0
);