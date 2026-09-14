-- Cardápio: categorias (com ordem e a flag with_photo), itens, tags e a
-- relação N:N entre item e tag.

create table public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name_pt text not null,
  name_en text not null default '',
  text_pt text not null default '',
  text_en text not null default '',
  with_photo boolean not null default false,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger menu_categories_set_updated_at
  before update on public.menu_categories
  for each row execute function public.set_updated_at();

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  -- ON DELETE RESTRICT: uma categoria com itens vinculados não pode ser
  -- excluída (regra de negócio validada) — a UI já bloqueia, isto é a
  -- garantia real no banco.
  category_id uuid not null references public.menu_categories(id) on delete restrict,
  name_pt text not null,
  name_en text not null default '',
  description_pt text not null default '',
  description_en text not null default '',
  price numeric(8,2) not null default 0,
  price_unit text not null default '',
  price_unit_en text not null default '',
  meta text not null default '',
  photo_path text,
  is_active boolean not null default true,
  sold_out boolean not null default false,
  is_new boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger menu_items_set_updated_at
  before update on public.menu_items
  for each row execute function public.set_updated_at();

-- Foto obrigatória quando a categoria exige (with_photo = true). CHECK não
-- pode referenciar outra tabela — a checagem entra via trigger, que
-- bloqueia o insert/update com uma mensagem clara (regra de negócio
-- validada: bloquear e alertar, não só a UI).
create or replace function public.enforce_menu_item_photo()
returns trigger
language plpgsql
as $$
declare
  requires_photo boolean;
begin
  select with_photo into requires_photo
  from public.menu_categories where id = new.category_id;

  if requires_photo and (new.photo_path is null or new.photo_path = '') then
    raise exception 'PHOTO_REQUIRED: categoria exige foto do produto';
  end if;
  return new;
end;
$$;

create trigger menu_items_photo_check
  before insert or update on public.menu_items
  for each row execute function public.enforce_menu_item_photo();

create table public.menu_tags (
  id uuid primary key default gen_random_uuid(),
  label_pt text not null,
  label_en text not null default ''
);

create table public.menu_item_tags (
  item_id uuid not null references public.menu_items(id) on delete cascade,
  tag_id uuid not null references public.menu_tags(id) on delete cascade,
  primary key (item_id, tag_id)
);

alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.menu_tags enable row level security;
alter table public.menu_item_tags enable row level security;

-- Leitura pública do que está ativo; equipe (staff/owner) lê e gere tudo.
create policy "public reads active menu categories"
  on public.menu_categories for select
  using (is_active);
create policy "staff manages menu categories"
  on public.menu_categories for all
  using (public.is_active_profile())
  with check (public.is_active_profile());

create policy "public reads active menu items"
  on public.menu_items for select
  using (is_active);
create policy "staff manages menu items"
  on public.menu_items for all
  using (public.is_active_profile())
  with check (public.is_active_profile());

create policy "public reads menu tags"
  on public.menu_tags for select
  using (true);
create policy "staff manages menu tags"
  on public.menu_tags for all
  using (public.is_active_profile())
  with check (public.is_active_profile());

create policy "public reads menu item tags"
  on public.menu_item_tags for select
  using (true);
create policy "staff manages menu item tags"
  on public.menu_item_tags for all
  using (public.is_active_profile())
  with check (public.is_active_profile());
