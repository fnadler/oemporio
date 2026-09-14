-- Configurações globais do site (tabela singleton — só existe 1 linha,
-- garantido pelo truque de PK boolean com check(id)). Editável só pelo
-- owner, no painel; lida publicamente pelo site (telefone, endereço,
-- horários, link da carta de cervejas, etc. não são sensíveis).
create table public.site_settings (
  id boolean primary key default true check (id),
  external_beer_menu_url text not null default '',
  instagram_handle text not null default '',
  phone_dialcode text not null default '+351',
  phone_number text not null default '',
  address text not null default '',
  hours jsonb not null default '[]'::jsonb,
  map_lat text not null default '',
  map_lng text not null default '',
  google_place_id text not null default '',
  welcome_voucher_pct int not null default 20,
  welcome_voucher_validity_days int not null default 30,
  consent_version text not null default '',
  consent_text text not null default '',
  updated_at timestamptz not null default now()
);

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

create policy "public reads site settings"
  on public.site_settings for select
  using (true);

create policy "owner updates site settings"
  on public.site_settings for update
  using (public.is_owner())
  with check (public.is_owner());

-- Seed da linha única (a migração roda com privilégios que ignoram RLS).
insert into public.site_settings (id, address, phone_dialcode, phone_number)
values (true, 'Rua de Santo António 12B, Ericeira, Portugal', '+351', '000 000 000')
on conflict (id) do nothing;
