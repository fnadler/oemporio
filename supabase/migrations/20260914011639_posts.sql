-- Novidades (CMS): categorias e posts. Um único campo de data
-- (published_at) — decisão validada, sem distinção entre data de
-- publicação e data de evento.

create table public.post_categories (
  id uuid primary key default gen_random_uuid(),
  label_pt text not null,
  label_en text not null default ''
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  eyebrow_pt text not null default '',
  eyebrow_en text not null default '',
  category_id uuid references public.post_categories(id) on delete set null,
  title_pt text not null,
  title_en text not null default '',
  subtitle_pt text not null default '',
  subtitle_en text not null default '',
  cover_path text,
  body jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz not null default now(),
  author_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

alter table public.post_categories enable row level security;
alter table public.posts enable row level security;

create policy "public reads post categories"
  on public.post_categories for select
  using (true);
create policy "staff manages post categories"
  on public.post_categories for all
  using (public.is_active_profile())
  with check (public.is_active_profile());

create policy "public reads published posts"
  on public.posts for select
  using (status = 'published');
create policy "staff manages posts"
  on public.posts for all
  using (public.is_active_profile())
  with check (public.is_active_profile());
