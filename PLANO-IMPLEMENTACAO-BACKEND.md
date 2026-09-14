# Plano de Implementação — Backend O Empório

> Sequência de tarefas para construir o backend descrito em
> [`Especificacao Tecnica - Backend.md`](<Especificacao Tecnica - Backend.md>) e integrá-lo ao frontend
> (site v2 + Manager). Cada fase pressupõe a anterior concluída e testada.
> Trabalhar sempre em um **projeto Supabase de staging** primeiro — nunca aplicar
> schema/migração direto em produção sem ter testado.

---

## Fase 0 — Preparação do ambiente

- [x] Criar um **segundo projeto Supabase** dedicado a staging (`oemporio-staging`, região eu-west-3). O free tier permite 2 projetos ativos.
- [x] Instalar o Supabase CLI (`npm i -D supabase`) e rodar `supabase init` na raiz do repo.
- [x] Conectar ao banco de staging — não via `supabase link` (exige login OAuth/access token, que não temos nesta sessão), mas via `db push --db-url` apontando para a **connection string do pooler** (IPv4; a conexão direta só aceita IPv6 e falhou aqui). Guardada em `.env.staging` (gitignorado) como `SUPABASE_STAGING_DB_URL`.
- [x] Definir que **todo schema vive como migração versionada** em `supabase/migrations/*.sql`, aplicada via `supabase db push --db-url "$SUPABASE_STAGING_DB_URL"` — não colar SQL solto no dashboard.
- [x] Credenciais de staging (URL, anon key, service_role key, connection string) salvas em `.env.staging` (padrão `.env*` já gitignorado) para reuso nas próximas fases.

## Fase 1 — Schema, RLS e triggers ✅ concluída e testada em staging

As 10 migrações já estão escritas em `supabase/migrations/` (ordem real, ajustada durante a escrita: as funções auxiliares de RLS precisam existir antes das políticas que as usam, e antes de `profiles` ganhar as políticas de owner):

1. `..._extensions.sql` — `pgcrypto`, `citext`.
2. `..._updated_at_fn.sql` — função genérica `set_updated_at()` (sem dependência de tabela, pode vir primeiro).
3. `..._profiles.sql` — `profiles` (1:1 com `auth.users`) + política mínima (cada um lê o próprio registro).
4. `..._auth_helpers.sql` — funções `is_active_profile()`/`is_owner()` (security definer) + políticas de owner em `profiles` + trigger `protect_last_owner` (não deixa o sistema sem nenhum owner ativo).
5. `..._site_settings.sql` — `site_settings` (singleton, inclui `google_place_id`) + seed de 1 linha.
6. `..._menu.sql` — `menu_categories` → `menu_items` (FK `ON DELETE RESTRICT` + trigger `enforce_menu_item_photo`) → `menu_tags` → `menu_item_tags`.
7. `..._posts.sql` — `post_categories` → `posts` (único campo de data, `published_at`).
8. `..._crm.sql` — `customers` → `vouchers` (trigger `stamp_voucher_redemption`: `redeemed_by`/`redeemed_at` sempre do servidor, nunca do client).
9. `..._loyalty.sql` — `loyalty_programs` → `loyalty_program_items` → `loyalty_cards` (trigger que só permite atribuir programa ativo) → `loyalty_cartelas` (índice único "uma cartela ativa por item" + trigger de resgate) → `loyalty_stamps` (trigger de autoria do selo).
10. `..._audit_and_cache.sql` — `audit_log`, `instagram_cache`, `google_reviews_cache`, `email_log`.

RLS habilitado e com policy em toda tabela, na mesma migração que a cria. Duas triggers tinham um bug de referenciar `OLD`/`NEW` no caminho errado (INSERT/DELETE) — já corrigido antes de aplicar.

- [x] Escrever as 10 migrações.
- [x] Aplicar em staging (`supabase db push`) — as 10 rodaram sem erro.
- [x] Confirmado via query direta: **19/19 tabelas** com RLS habilitado e pelo menos 1 policy; todas as funções (`is_owner`, `is_active_profile`, `enforce_menu_item_photo`, `enforce_active_program_on_assign`, `protect_last_owner`, `stamp_voucher_redemption`, `stamp_cartela_redemption`, `stamp_loyalty_stamp`, `set_updated_at`) e triggers presentes; `site_settings` com a linha seed.
- [x] Testado funcionalmente (dentro de uma transação com rollback — nada ficou gravado): foto obrigatória bloqueia sem `photo_path` e libera com; exclusão de categoria com item vinculado é bloqueada pela FK; segunda cartela ativa do mesmo item viola o índice único; atribuir ou trocar para programa inativo é bloqueado. 13/13 casos passaram.
- [ ] O que ainda não foi testado (depende de sessão autenticada real via PostgREST, não dá pra simular com conexão direta): os triggers que carimbam `redeemed_by`/`recorded_by` a partir de `auth.uid()` — validar isso na Fase 5, com login real.
- [ ] Aplicar as mesmas migrações em **produção**, só depois que a Fase 5 (integração) estiver validada em staging de ponta a ponta.

## Fase 2 — Autenticação e perfis da equipe

- [x] Criar o primeiro usuário `owner` — Fabiano Nadler (`fabiano@fdndesign.com.br`), convidado via Admin API (`/auth/v1/invite`), com a linha correspondente em `profiles` (`role = 'owner'`).
- [x] Testar login (password grant) e confirmar que a RLS reconhece a sessão: criado um 2º perfil (`staff`) de teste, o owner autenticado leu os 2 (policy "owner reads all profiles" confirmada, não é só self-select); um pedido anônimo sem login leu 0. Perfil de teste removido depois.
- [ ] Desabilitar cadastro público no Supabase Auth (dashboard: Authentication → Sign In / Providers → desligar "Allow new users to sign up") — pendente, só dá pelo dashboard.
- [ ] MFA/TOTP não precisa de toggle de projeto — fica disponível para qualquer usuário ativar (`auth.mfa.enroll`); a tela para isso é construída na Fase 5.
- [ ] **Pendência:** o link de convite por e-mail levou para a home do site (`#access_token=...`) sem nenhuma página tratando o token — porque a tela de "definir senha" ainda não existe (é trabalho da Fase 5). Por ora a senha do owner foi definida direto via Admin API para permitir o teste; ele deve trocá-la assim que o login real do Manager existir.

## Fase 3 — Migração dos dados legados (`leads` → `customers` + `vouchers`)

- [ ] Escrever um script de ETL (Node, usando o `service_role` client) que lê `leads` e grava em `customers`/`vouchers`, seguindo o mapeamento de campos já documentado na spec (§2, "Migração dos dados legados").
- [ ] Rodar o script contra **staging** primeiro, com uma cópia dos dados de produção (export/import, não apontar staging direto pra base viva).
- [ ] Validar: contagem de linhas bate, e-mails únicos preservados, nenhum `voucher` órfão sem `customer`.
- [ ] Só então rodar em produção, num horário de baixo tráfego, com backup prévio do banco.

## Fase 4 — Edge Functions / rotas de API

Implementar (como Next.js API Routes, seguindo o padrão que já existe em `/api/leads`, ou como Supabase Edge Functions — manter consistência com o que já está em produção):

- [ ] **`submit-lead`** — substitui o `/api/leads` atual: valida (zod) → honeypot → CAPTCHA (score ≥0.5) → rate limit → `upsert` em `customers` → gera `voucher` → chama o envio de e-mail em processo (nunca endpoint público — regra já em vigor desde a correção de segurança).
- [ ] **`redeem-voucher`** — recebe código/e-mail, exige sessão autenticada, seta `redeemed_at`/`redeemed_by` a partir do usuário da sessão (nunca do payload).
- [ ] **`refresh-instagram`** — cron periódico, grava em `instagram_cache`.
- [ ] **`refresh-google-reviews`** — cron periódico, usa `site_settings.google_place_id`, grava em `google_reviews_cache`.
- [ ] **`invite-admin`** — dispara o convite via Supabase Auth e cria a linha em `profiles`.
- [ ] Job diário (cron) que marca `vouchers` vencidos como `expired`.

Documentar o contrato (payload de entrada, resposta, códigos de erro) de cada uma antes de implementar — evita retrabalho quando o frontend for integrar.

## Fase 5 — Integração do frontend

**Site público:**
- [ ] Cardápio e Novidades passam a ler de `menu_items`/`posts` (Supabase) em vez de dados estáticos/mock.
- [ ] `CouponModal.tsx` passa a chamar `submit-lead` (novo contrato) em vez do `/api/leads` legado.
- [ ] Seção do mapa/avaliações passa a ler `google_reviews_cache` e `site_settings`.

**Manager:**
- [ ] Substituir `src/lib/manager/store.tsx` (mock em memória) por um client real do Supabase — mesma interface (`useManager()`) por trás, mas as funções (`saveItem`, `redeemVoucher`, `markStamp` etc.) passam a fazer queries/mutations reais, preservando o contrato que a UI já espera. Isso minimiza mudança nas 17 telas já construídas.
- [ ] Adicionar **middleware de autenticação real** em `/manager/:path*`, no mesmo padrão do que já protege `/admin/:path*` hoje.
- [ ] Trocar a tela de login decorativa por `supabase.auth.signInWithPassword` de verdade.
- [ ] Verificar papel (`owner`/`staff`) nas rotas que hoje só checam no client (Configurações, Perfis).

## Fase 6 — QA de segurança e regras de negócio

- [ ] Testar RLS logado como `staff` e como `owner` — confirmar que `staff` não acessa Configurações/Perfis mesmo forçando a URL.
- [ ] Testar as regras de negócio decididas: exclusão de categoria com itens vinculados é bloqueada (constraint `ON DELETE RESTRICT`); item sem foto obrigatória é bloqueado (trigger); troca de programa de fidelidade preserva histórico; programa inativo permite novo selo com alerta na tela.
- [ ] Rodar o checklist de segurança do §6 da spec (CAPTCHA, honeypot, rate limit, headers) contra os novos endpoints.
- [ ] Testar o último-owner-não-pode-ser-rebaixado em `profiles`.

## Fase 7 — Corte para produção

- [ ] Deploy completo em staging, teste end-to-end (cadastro de voucher → validação no Manager → fidelidade → CMS).
- [ ] Rodar a migração de dados legados em produção (Fase 3).
- [ ] Apontar as variáveis de ambiente de produção (Vercel) para o projeto Supabase definitivo.
- [ ] Depois de confirmado estável por alguns dias, desativar a tabela `leads` legada (manter só como arquivo histórico, sem novas escritas) e remover o `/api/leads` antigo.

---

Cada fase deve ser fechada (testada) antes de abrir a próxima — em especial a Fase 1 (schema/RLS), já que as demais fases todas dependem dela.
