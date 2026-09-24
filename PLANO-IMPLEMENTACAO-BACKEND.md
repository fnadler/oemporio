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

## Fase 3 — Migração dos dados legados (`leads` → `customers` + `vouchers`) ✅ validada em staging

- [x] Escrito `scripts/migrate-leads.mjs` — lê `leads` de produção (só leitura, nunca escreve lá) e grava em `customers`/`vouchers` no destino (staging por padrão, `--target=prod` quando for a hora). Idempotente (pula e-mail já migrado) e com `--dry-run` por padrão (só grava com `--apply`).
- [x] Rodado contra staging: **25 leads → 25 customers + 25 vouchers** (17 `issued`, 4 `redeemed`, 4 `expired` — calculado retroativamente a partir de `welcome_voucher_validity_days`, já que `leads` nunca guardou validade).
- [x] Validado: contagem bate (25/25), sem erro de e-mail duplicado, todo voucher tem `customer_id` válido (garantido pela FK). Rodei o script uma 2ª vez para confirmar idempotência: 0 migrados, 25 pulados — sem duplicar.
- [ ] Rodar em **produção só depois da Fase 1 aplicar as migrações lá** (hoje o banco de produção ainda não tem as tabelas `customers`/`vouchers` — só staging tem). Fica alinhado com a Fase 7 (corte para produção): aplicar schema em prod → rodar `migrate-leads.mjs --apply --target=prod` → só então trocar as variáveis de ambiente do site para os novos endpoints.

**Nota:** os dados pessoais dos 25 clientes (nome, e-mail, telefone) agora também existem no projeto de staging — mesma política de acesso (RLS) se aplica lá, mas vale lembrar ao dar acesso de staging a alguém.

## Fase 4 — Edge Functions / rotas de API ✅ implementadas e testadas em staging

Implementadas como Next.js API Routes (consistente com o que já está em produção). Lógica de negócio separada em `src/lib/backend/*.ts` (funções puras, recebem o client Supabase já pronto) das rotas em `src/app/api/**/route.ts` (só cuidam de HTTP/sessão) — dá pra testar contra qualquer projeto sem subir o servidor Next, que foi como validei tudo contra staging (15/15 asserções passaram).

- [x] **`submit-lead`** (`src/lib/backend/submitLead.ts` + `POST /api/submit-lead`) — zod → honeypot → CAPTCHA (score ≥0.5, ação `submit_lead`) → rate limit → grava em `customers` (agora persistindo `pais_nascimento`/`vive_portugal`/`distrito`, que o `/api/leads` legado descartava) → gera `voucher` com % e validade lidos de `site_settings` → envia e-mail em processo. Testado: sucesso, e-mail duplicado, honeypot, payload inválido, captcha reprovado.
- [x] **`redeem-voucher`** (`redeemVoucher.ts` + `POST /api/redeem-voucher`) — estendido para as 3 ações do Manager (`redeem`/`cancel`/`reactivate`, não só resgate). Usa o client **autenticado do chamador** (nunca service_role) para que RLS + o trigger `stamp_voucher_redemption` carimbem `redeemed_by`/`redeemed_at` de verdade a partir da sessão. Testado com login real do owner: redeem, re-redeem bloqueado, cancel, reactivate (nova validade lida de `site_settings`), chamada sem sessão.
- [x] **`invite-admin`** (`inviteAdmin.ts` + `POST /api/invite-admin`) — confirma que quem chama é owner ativo (via RLS no próprio client do chamador) antes de usar `service_role` para convidar (Auth Admin API) e criar o perfil. Testado: convite + perfil criados com `invited_by` correto, e bloqueio quando o chamador não é owner.
- [x] Job diário **`expire-vouchers`** (`expireVouchers.ts` + `GET /api/cron/expire-vouchers`) — marca `issued` vencido como `expired`. Testado com um voucher vencido de propósito.
- [x] **`refresh-instagram`** e **`refresh-google-reviews`** — implementadas (`GET /api/cron/refresh-instagram` e `.../refresh-google-reviews`), mas ainda não testáveis de ponta a ponta: faltam credenciais reais (`INSTAGRAM_ACCESS_TOKEN`/`INSTAGRAM_BUSINESS_ACCOUNT_ID`, `GOOGLE_PLACES_API_KEY`), que não temos configuradas em nenhum ambiente ainda. O código já trata a ausência com um erro claro (`CONFIG_MISSING`) em vez de quebrar.
- [x] Todos os endpoints de cron protegidos por `CRON_SECRET` (`src/lib/security/cronAuth.ts`) — a Vercel injeta esse header automaticamente nas chamadas de cron quando a env var está configurada no projeto. **Pendência:** definir `CRON_SECRET` nas env vars do Vercel antes de ir pra produção (por enquanto, sem a variável, os endpoints recusam por padrão — "fail closed").
- [x] `vercel.json` com os 3 crons agendados (expire-vouchers diário, refresh-instagram a cada 6h, refresh-google-reviews 2x/dia) — só passa a valer quando essa branch virar produção (Vercel só roda cron em deployments de produção).
- [ ] Trocar `/api/leads` (legado) pelo novo `/api/submit-lead` na Fase 5, quando o `CouponModal.tsx` for integrado de verdade.
- [ ] Job diário (cron) que marca `vouchers` vencidos como `expired`.

Documentar o contrato (payload de entrada, resposta, códigos de erro) de cada uma antes de implementar — evita retrabalho quando o frontend for integrar.

## Fase 5 — Integração do frontend ✅ concluída (site público + Manager)

**Site público:**
- [x] `CouponModal.tsx` passa a chamar `/api/submit-lead` (novo contrato) em vez do `/api/leads` legado.
- [x] **Cardápio e Novidades convertidos para ler do Supabase**, com o schema estendido (`meta`, `is_featured`, `variant` de tag — ver commit `2d789be`) para cobrir os campos específicos do design (ficha técnica, "Cervejaria do Mês", cores de tag) sem perder fidelidade visual.
- [x] `scripts/seed-menu-and-posts.mjs`: migra o conteúdo hoje fixo no código (4 categorias, 10 tags, 21 itens, 6 categorias de novidade, 10 posts) para registros reais — idempotente, com `--dry-run` por padrão. Aplicado em staging.
- [x] `createPublicClient()` novo em `src/lib/supabase/server.ts` — client anon/sem cookies pra páginas server component que só leem conteúdo público.
- [x] `src/lib/manager/mock.ts` → `src/lib/site/posts.ts` e `.../postsData.ts`: mesma estratégia da store do Manager — tipos/helpers puros de um lado, adaptação Supabase→shape-que-a-UI-já-esperava do outro (`NovidadesList`/`PostCard`/página de detalhe não precisaram mudar sua lógica de exibição, só passaram a receber `posts` via prop em vez de importar um array estático).
- [x] Testado com Playwright contra staging + screenshots: Taps, Comidas (fotos reais carregando), Vinhos, Bebidas, destaque "Cervejaria do Mês", badge "Esgotada", 7 novidades publicadas (3 rascunhos corretamente ocultos), post com vídeo do YouTube e galeria de imagens, navegação lista→detalhe.
- [ ] Seção do mapa/avaliações (`google_reviews_cache`/`site_settings`) — adiada: depende de credenciais reais do Google Places, que ainda não temos (mesma pendência da Fase 4).

**Nota sobre fotos:** `photo_path`/`cover_path` hoje guardam caminhos públicos existentes em `public/v2/img/` (não Storage do Supabase). Upload real de imagem pelo Manager (`PhotoUploader`/`GalleryUploader` ainda usam blob URLs que não persistem) fica como pendência separada — funciona para o conteúdo semeado, mas a equipe ainda não consegue trocar uma foto pelo Manager e ver persistir.

**Autenticação do Manager (concluída):**
- [x] Middleware real em `/manager/:path*` (mesmo padrão do `/admin`), mas checando `profiles.is_active` em vez de e-mail fixo.
- [x] Login real (`supabase.auth.signInWithPassword`) e fluxo de "definir senha" a partir do link de convite (`#access_token=...&type=invite`) — a lacuna identificada na Fase 2 está fechada.
- [x] Corrigidos 3 pontos que só *navegavam* para `/manager/login` sem encerrar a sessão de verdade (Topbar, Sidebar, Meu Perfil) — agora chamam `supabase.auth.signOut()`.
- [x] "Meu perfil" → alterar senha agora é real (reautentica com a senha atual via `signInWithPassword`, depois `updateUser`), não mais mock.
- [x] Removido o seletor de papel (owner/staff) que existia na Topbar como recurso de demonstração do protótipo — o papel real virá do perfil autenticado quando a store for trocada.
- [x] Testado de ponta a ponta com Playwright (instalado como devDependency): acesso não autenticado bloqueado, credenciais erradas mostram erro, login correto entra no dashboard, sessão persiste ao recarregar, sign-out realmente encerra a sessão (tentativa de voltar pra `/manager` é bloqueada de novo).

**Manager — store real (concluída):**
- [x] `src/lib/manager/store.tsx` reescrita por completo: carrega tudo do Supabase (15 queries em paralelo) e monta a mesma forma de dados que as 17 telas já esperavam (`MockData`) — nenhuma tela precisou mudar sua lógica de leitura. Todas as 27 funções de mutação (`redeemVoucher`, `saveItem`, `markStamp`, `inviteProfile` etc.) viraram chamadas reais ao Supabase (ou às Edge Functions da Fase 4, no caso de vouchers/convites), seguidas de um recarregamento completo (`loadAll()`) — simples e sempre consistente com o que os triggers do banco realmente aplicaram.
- [x] `src/lib/manager/mock.ts` reduzido a tipos + helpers puros de formatação (os dados fictícios/seed foram removidos — não são mais usados).
- [x] **Achado corrigido antes de testar:** 5 lugares na UI geravam IDs falsos no formato `prefixo-abc123` (`fidelidade/novo`, `MenuCategoryManager`, `MenuTagManager`, `PostEditor`, `ProgramForm`) — como as colunas do banco são `uuid`, o Postgres teria rejeitado todo insert vindo desses formulários. Trocados para `crypto.randomUUID()`.
- [x] Fechadas 2 pontas que ficaram pendentes de decisões anteriores: campo **Google Place ID** adicionado à tela de Configurações (decisão #18 só tinha entrado no schema, não na UI), e **"Validado por"** agora aparece na ficha do voucher e na listagem (decisão #9).
- [x] Testado: dados reais carregando (25 clientes/vouchers migrados na Fase 3, paginação ok), criação de programa de fidelidade com UUID real gravado no banco, atribuição de cliente a programa gravando o vínculo real — confirmado direto no banco de staging, não só na tela. As demais mutações (cardápio, novidades, tags, categorias, perfis) seguem exatamente o mesmo padrão já testado (upsert por existência de id) e passaram no type-check, mas não foram clicadas uma a uma nesta rodada.
- [x] Autenticação real (middleware + login) — ver bloco acima.
- [ ] Verificar papel (`owner`/`staff`) nas rotas que hoje só checam `role !== 'owner'` no client (Configurações, Perfis) — a checagem client-side já existe (`<Restricted/>`), mas vale confirmar que RLS bloqueia mesmo uma chamada direta de um `staff` (as policies já fazem isso — `owner manages loyalty programs`, `owner updates site settings` etc. — falta só um teste dedicado logado como staff, deixado para a Fase 6).

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
