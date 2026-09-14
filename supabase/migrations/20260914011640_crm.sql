-- CRM: clientes/leads e vouchers. Nenhuma escrita anônima é permitida —
-- o cadastro (insert em customers + geração do voucher) só acontece via
-- Edge Function com service_role, que ignora RLS. A equipe (staff/owner)
-- só lê e atualiza (nunca insere/apaga cliente ou voucher pela UI).

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  phone_dialcode text not null,
  phone_number text not null,
  email citext not null unique,
  language text not null default 'pt' check (language in ('pt', 'en')),
  birth_country text not null default '',
  lives_in_portugal text not null default 'na' check (lives_in_portugal in ('sim', 'freq', 'nao', 'na')),
  district text not null default '',
  consent_coupon boolean not null default false,
  consent_marketing boolean not null default false,
  consent_version text,
  consent_at timestamptz,
  source text not null default 'site_form',
  created_at timestamptz not null default now()
);

create table public.vouchers (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  code text not null unique,
  type text not null default 'welcome_20',
  discount_pct int not null default 20,
  status text not null default 'issued' check (status in ('issued', 'redeemed', 'expired', 'cancelled')),
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  redeemed_at timestamptz,
  redeemed_by uuid references public.profiles(id)
);

-- redeemed_by/redeemed_at nunca vêm do client: sempre que o status muda
-- para 'redeemed', o servidor sobrescreve com o usuário da sessão e o
-- instante atual — ver regra de segurança validada na Especificação Técnica §6.
create or replace function public.stamp_voucher_redemption()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'redeemed' and old.status <> 'redeemed' then
    new.redeemed_at := now();
    new.redeemed_by := auth.uid();
  end if;
  return new;
end;
$$;

create trigger vouchers_stamp_redemption
  before update on public.vouchers
  for each row execute function public.stamp_voucher_redemption();

alter table public.customers enable row level security;
alter table public.vouchers enable row level security;

create policy "staff reads customers"
  on public.customers for select
  using (public.is_active_profile());
create policy "staff updates customers"
  on public.customers for update
  using (public.is_active_profile())
  with check (public.is_active_profile());

create policy "staff reads vouchers"
  on public.vouchers for select
  using (public.is_active_profile());
create policy "staff updates vouchers"
  on public.vouchers for update
  using (public.is_active_profile())
  with check (public.is_active_profile());
