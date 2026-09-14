-- Fidelidade: cartela de selos por item de consumo. Programas e itens são
-- configuráveis pelo owner; staff registra selos/resgates no dia a dia.
-- Um cliente participa de no máximo 1 programa por vez, mas trocar de
-- programa preserva o histórico de cartelas/selos anteriores (decisão
-- validada) — nada aqui é apagado numa troca, só o `program_id` atual do
-- cartão muda.

create table public.loyalty_programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  points_required int not null check (points_required >= 1),
  is_active boolean not null default true,
  activated_at timestamptz not null default now(),
  deactivated_at timestamptz
);

create table public.loyalty_program_items (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.loyalty_programs(id) on delete cascade,
  label text not null,
  sort_order int not null default 0
);

create table public.loyalty_cards (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade unique,
  program_id uuid not null references public.loyalty_programs(id),
  created_at timestamptz not null default now()
);

-- Só é possível atribuir (ou trocar para) um programa ativo — programa
-- inativo não aparece como opção para atribuição de cliente novo nem para
-- troca de programa (mas continua registrando selos para quem já estava
-- nele, ver trigger de loyalty_stamps mais abaixo).
create or replace function public.enforce_active_program_on_assign()
returns trigger
language plpgsql
as $$
declare
  program_active boolean;
  changed boolean;
begin
  -- OLD não existe num trigger de INSERT — nunca referenciar OLD nesse caminho.
  if tg_op = 'INSERT' then
    changed := true;
  else
    changed := (new.program_id <> old.program_id);
  end if;

  if changed then
    select is_active into program_active
    from public.loyalty_programs where id = new.program_id;

    if not coalesce(program_active, false) then
      raise exception 'PROGRAM_INACTIVE: só é possível atribuir um programa ativo';
    end if;
  end if;
  return new;
end;
$$;

create trigger loyalty_cards_enforce_active_program
  before insert or update on public.loyalty_cards
  for each row execute function public.enforce_active_program_on_assign();

create table public.loyalty_cartelas (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.loyalty_cards(id) on delete cascade,
  item_id uuid not null references public.loyalty_program_items(id),
  redeemed_at timestamptz,
  redeemed_by uuid references public.profiles(id)
);

-- Garante "uma cartela ativa por item": só pode haver 1 linha sem
-- redeemed_at por (card_id, item_id) ao mesmo tempo.
create unique index loyalty_cartelas_one_active_per_item
  on public.loyalty_cartelas (card_id, item_id)
  where redeemed_at is null;

-- redeemed_by nunca vem do client — sempre o usuário da sessão, no
-- instante em que a cartela é marcada como resgatada.
create or replace function public.stamp_cartela_redemption()
returns trigger
language plpgsql
as $$
begin
  if new.redeemed_at is not null and old.redeemed_at is null then
    new.redeemed_at := now();
    new.redeemed_by := auth.uid();
  end if;
  return new;
end;
$$;

create trigger loyalty_cartelas_stamp_redemption
  before update on public.loyalty_cartelas
  for each row execute function public.stamp_cartela_redemption();

create table public.loyalty_stamps (
  id uuid primary key default gen_random_uuid(),
  cartela_id uuid not null references public.loyalty_cartelas(id) on delete cascade,
  recorded_by uuid references public.profiles(id),
  recorded_at timestamptz not null default now()
);

-- recorded_by/recorded_at também nunca vêm do client.
create or replace function public.stamp_loyalty_stamp()
returns trigger
language plpgsql
as $$
begin
  new.recorded_by := auth.uid();
  new.recorded_at := now();
  return new;
end;
$$;

create trigger loyalty_stamps_stamp
  before insert on public.loyalty_stamps
  for each row execute function public.stamp_loyalty_stamp();

alter table public.loyalty_programs enable row level security;
alter table public.loyalty_program_items enable row level security;
alter table public.loyalty_cards enable row level security;
alter table public.loyalty_cartelas enable row level security;
alter table public.loyalty_stamps enable row level security;

-- Programas e itens: qualquer membro da equipe lê (precisa ver
-- points_required e os itens para marcar selos); só o owner configura.
create policy "staff reads loyalty programs"
  on public.loyalty_programs for select
  using (public.is_active_profile());
create policy "owner manages loyalty programs"
  on public.loyalty_programs for all
  using (public.is_owner())
  with check (public.is_owner());

create policy "staff reads loyalty program items"
  on public.loyalty_program_items for select
  using (public.is_active_profile());
create policy "owner manages loyalty program items"
  on public.loyalty_program_items for all
  using (public.is_owner())
  with check (public.is_owner());

-- Cartões, cartelas e selos: operação do dia a dia — staff e owner podem
-- atribuir programa, marcar/desfazer selo e resgatar.
create policy "staff manages loyalty cards"
  on public.loyalty_cards for all
  using (public.is_active_profile())
  with check (public.is_active_profile());

create policy "staff manages loyalty cartelas"
  on public.loyalty_cartelas for all
  using (public.is_active_profile())
  with check (public.is_active_profile());

create policy "staff manages loyalty stamps"
  on public.loyalty_stamps for all
  using (public.is_active_profile())
  with check (public.is_active_profile());
