-- Função genérica de trigger: mantém `updated_at` sempre atual em qualquer
-- tabela que a use. Não depende de nenhuma tabela do domínio — pode ser
-- criada antes de tudo.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
