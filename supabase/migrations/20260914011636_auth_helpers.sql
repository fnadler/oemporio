-- Funções auxiliares de autorização, usadas nas policies de RLS de todo o
-- schema. `security definer` evita recursão de RLS (uma policy da própria
-- tabela `profiles` que precisasse consultar `profiles` via RLS entraria
-- em loop); aqui a função roda com os privilégios do dono (bypassa RLS
-- internamente), mas só expõe um boolean — nunca dados crus.

create or replace function public.is_active_profile()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_active
  );
$$;

create or replace function public.is_owner()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_active and p.role = 'owner'
  );
$$;

-- Owner enxerga e gere todos os perfis (convite, papel, ativar/desativar).
create policy "owner reads all profiles"
  on public.profiles for select
  using (public.is_owner());

create policy "owner inserts profiles"
  on public.profiles for insert
  with check (public.is_owner());

create policy "owner updates profiles"
  on public.profiles for update
  using (public.is_owner())
  with check (public.is_owner());

-- Regra de proteção: nunca deixar o sistema sem nenhum owner ativo.
-- Reforçada no banco (além da checagem já feita na UI do Manager) porque
-- é a única garantia real quando a escrita vem de um script ou do
-- service_role, que ignora RLS.
create or replace function public.protect_last_owner()
returns trigger
language plpgsql
as $$
declare
  remaining_owners int;
  losing_owner_status boolean;
begin
  -- NEW não existe num trigger de DELETE — os dois caminhos (DELETE e
  -- UPDATE) são resolvidos separadamente, sem nunca referenciar NEW no
  -- caminho de DELETE nem OLD faltando no de INSERT (esta trigger não
  -- roda em INSERT).
  if tg_op = 'DELETE' then
    losing_owner_status := (old.role = 'owner' and old.is_active);
  else
    losing_owner_status := (old.role = 'owner' and old.is_active)
      and (new.role <> 'owner' or new.is_active = false);
  end if;

  if losing_owner_status then
    select count(*) into remaining_owners
    from public.profiles
    where role = 'owner' and is_active and id <> old.id;

    if remaining_owners = 0 then
      raise exception 'LAST_OWNER: não é possível rebaixar/desativar/remover o último owner ativo';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_last_owner
  before update or delete on public.profiles
  for each row execute function public.protect_last_owner();
