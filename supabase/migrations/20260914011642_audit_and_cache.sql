-- Auditoria e caches de integrações externas. Todas as escritas aqui vêm
-- de Edge Functions/cron usando service_role (que ignora RLS) — nenhuma
-- policy de insert/update é dada ao papel `authenticated`.

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  table_name text not null,
  record_id uuid,
  diff jsonb,
  ip text,
  created_at timestamptz not null default now()
);

create table public.instagram_cache (
  id uuid primary key default gen_random_uuid(),
  fetched_at timestamptz not null default now(),
  payload jsonb not null default '[]'::jsonb
);

create table public.google_reviews_cache (
  id uuid primary key default gen_random_uuid(),
  fetched_at timestamptz not null default now(),
  rating numeric(2,1),
  reviews_count int,
  reviews jsonb not null default '[]'::jsonb
);

create table public.email_log (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  email citext not null,
  status text not null,
  provider_id text,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;
alter table public.instagram_cache enable row level security;
alter table public.google_reviews_cache enable row level security;
alter table public.email_log enable row level security;

-- Auditoria: só o owner consulta.
create policy "owner reads audit log"
  on public.audit_log for select
  using (public.is_owner());

-- Caches: leitura pública (o site lê direto, sem autenticação).
create policy "public reads instagram cache"
  on public.instagram_cache for select
  using (true);

create policy "public reads google reviews cache"
  on public.google_reviews_cache for select
  using (true);

-- Log de e-mail: dado operacional interno, só o owner consulta.
create policy "owner reads email log"
  on public.email_log for select
  using (public.is_owner());
