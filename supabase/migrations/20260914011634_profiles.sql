-- Perfis da equipe (1:1 com auth.users). Papéis: owner (total) e staff
-- (opera o dia a dia, sem gerir usuários/configurações sensíveis).
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email citext not null,
  role text not null default 'staff' check (role in ('owner', 'staff')),
  is_active boolean not null default true,
  invited_by uuid references public.profiles(id),
  invited_at timestamptz not null default now(),
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

-- Política mínima (sem depender de funções auxiliares, que só existem a
-- partir da próxima migração): qualquer usuário autenticado vê o próprio
-- registro — suficiente para a tela "Meu perfil". As políticas que dão ao
-- owner acesso aos demais perfis (ler, convidar, alterar papel, ativar/
-- desativar) são adicionadas em 20260914011636_auth_helpers.sql.
create policy "self reads own profile"
  on public.profiles for select
  using (id = auth.uid());
