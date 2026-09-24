-- Bucket público para fotos de itens do cardápio e capas/galerias de
-- novidades. Upload só acontece via nossa rota autenticada (service_role,
-- depois de checar staff/owner) — não há policy de insert/update/delete
-- para `authenticated`/`anon`, então ninguém escreve direto no bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;
