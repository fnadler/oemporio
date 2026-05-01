-- Create leads table
CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    primeiro_nome text NOT NULL,
    sobrenome text NOT NULL,
    email text UNIQUE NOT NULL,
    telefone text NOT NULL,
    idioma_preferido text NOT NULL CHECK (idioma_preferido IN ('pt_PT', 'en')),
    aceitou_cupom boolean NOT NULL,
    aceitou_marketing boolean DEFAULT false,
    cupom_utilizado boolean DEFAULT false,
    criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts (public can insert via API route)
CREATE POLICY "Allow public inserts" ON public.leads
    FOR INSERT TO public
    WITH CHECK (true);

-- Create policy to allow authenticated users to view all leads
CREATE POLICY "Allow authenticated users to select" ON public.leads
    FOR SELECT TO authenticated
    USING (true);

-- Create policy to allow authenticated users to update leads
CREATE POLICY "Allow authenticated users to update" ON public.leads
    FOR UPDATE TO authenticated
    USING (true);

-- Ensure mkt@oemporio.pt is registered in Supabase Auth and can login.
