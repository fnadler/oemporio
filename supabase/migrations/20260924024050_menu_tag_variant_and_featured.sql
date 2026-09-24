-- Variante visual da tag (estilos monocromáticos já usados no site: ver
-- site.css .minitag.local/.new/.guest/.tap). Puramente presentacional —
-- quem cria a tag no Manager escolhe qual estilo usar.
alter table public.menu_tags
  add column variant text not null default 'local'
  check (variant in ('local', 'new', 'guest', 'tap'));

-- Destaque especial de um item (ex.: "Cervejaria do Mês" nos Taps).
-- No máximo 1 item em destaque por categoria — o índice único parcial
-- garante isso no banco; a store troca o destaque anterior automaticamente
-- ao marcar um novo (ver saveItem/toggleItem em store.tsx).
alter table public.menu_items
  add column is_featured boolean not null default false;

create unique index menu_items_one_featured_per_category
  on public.menu_items (category_id)
  where is_featured;
