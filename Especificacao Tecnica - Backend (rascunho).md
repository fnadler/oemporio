# O Empório — Especificação Técnica do Backend (RASCUNHO para validação)

> Documento técnico para o backend do site + CRM/Manager do **O Empório — Comfort Food & Craft Beer** (Ericeira, PT).
> Base no escopo da **proposta comercial** (site institucional + CRM) e nas **telas do protótipo/Manager** (Home, Cardápio, Novidades no site; e no Manager: Contatos, Vouchers, Fidelidade, Novidades, Cardápio, Configurações e Perfis — com telas dedicadas de cadastro/edição).
> **Stack alvo:** Banco/Backend em **Supabase** · Hospedagem em **Vercel**.
> Status: **rascunho** — revisar e validar antes de implementar.

---

## 1. Visão geral

O sistema tem duas faces sobre a mesma base de dados:

- **Site público (PT/EN):** apresenta o pub, cardápio (Taps, Comidas, Vinhos, Bebidas; Cervejas via carta online externa), área de novidades, feed do Instagram, mapa/avaliações e o **formulário de cadastro do cupão de 20%**.
- **CRM/Manager (área administrativa):** gestão de contatos e vouchers, programa de **cartão fidelidade configurável**, gestão de **novidades** (CMS) e de **cardápio** (ativar/inativar itens), com login da equipe.

Princípio condutor: **tudo o que é dinâmico no site é gerido pelo CRM** e servido pela mesma base, com segurança por padrão (RLS) e priorizando serviços **gratuitos ou de baixo custo**.

---

## 2. Arquitetura e stack

| Camada | Tecnologia | Observações |
|---|---|---|
| Frontend | **Next.js** (React) na Vercel | Converter o protótipo HTML/CSS/JS para componentes. SSR/ISR para SEO e cache. |
| Banco de dados | **Supabase Postgres** | Fonte única de verdade. RLS habilitado em todas as tabelas. |
| Autenticação | **Supabase Auth** | Apenas para a equipe (admin). Convite/invite-only, MFA. |
| Armazenamento de mídia | **Supabase Storage** | Fotos do cardápio, capas e galerias de novidades. |
| Lógica de servidor | **Supabase Edge Functions** e/ou **Next.js API Routes** | Submissão do formulário, emissão de voucher, caches de integrações. |
| Agendamentos | **Supabase Cron (pg_cron)** ou **Vercel Cron** | Atualizar caches (Instagram/Reviews), expirar vouchers, e **manter o projeto ativo** (ver §10). |

> ✅ **Decisão (validada):** hospedagem em **Vercel Pro (~US$20/mês)** — o plano Hobby é apenas não‑comercial e não serve para um negócio. Banco em **Supabase Pro (~US$25/mês)** (sem pausa por inatividade, backups automáticos). Ver §9.

### Ambientes
- **dev** (local) → **preview** (deploy automático por branch) → **produção**.
- Dois projetos Supabase no mínimo recomendados: um de **staging** e um de **produção** (o free tier permite 2 projetos ativos).
- Segredos por ambiente em variáveis de ambiente (Vercel) e **Supabase Vault** (chaves de API).

---

## 3. Modelo de dados (tabelas)

Convenções: `id uuid default gen_random_uuid() primary key`, `created_at timestamptz default now()`, `updated_at timestamptz` (via trigger). Textos bilíngues usam colunas `*_pt` e `*_en` (canônico PT + EN gerado/curado).

### 3.1 Conteúdo do site (CMS)

**`menu_categories`** — categorias do cardápio (**gerenciáveis** no painel: criar, editar, reordenar, ativar/inativar)
| coluna | tipo | notas |
|---|---|---|
| id | uuid | PK |
| slug | text unique | âncora no site (ex.: `comidas`) — opcional, derivável do nome |
| name_pt / name_en | text | rótulo exibido (bilíngue) |
| text_pt / text_en | text | texto/descrição da categoria (subtítulo no site, bilíngue) |
| with_photo | boolean | se `true`, os produtos exigem **foto** e são exibidos como **cards** no site (ex.: Comidas); se `false`, lista simples |
| sort_order | int | **ordem de exibição no site** (reordenável no painel via ↑/↓) |
| is_active | boolean | controla exibição no site |

**`menu_items`** — itens do cardápio
| coluna | tipo | notas |
|---|---|---|
| id | uuid | PK |
| category_id | uuid FK → menu_categories | |
| name_pt / name_en | text | bilíngue |
| description_pt / description_en | text | bilíngue |
| price | numeric(8,2) | valor (compartilhado entre idiomas) |
| price_unit / price_unit_en | text | unidade bilíngue (ex.: `copo`/`glass`, `a partir de`/`from`, `/ 33cl`) |
| meta | text | ex.: "LETRA · VILA VERDE — 5,0% ABV" (ou colunas próprias: brewery, origin, abv, ibu) |
| photo_path | text | caminho no Storage (**obrigatório** quando a categoria tem `with_photo = true`) |
| is_active | boolean | **ativar/inativar** (controla exibição no site) |
| sold_out | boolean | estado "Esgotada" |
| is_new | boolean | **destaque "Novo"** no cardápio |
| sort_order | int | |

**`menu_tags`** — tags do cardápio (**gerenciáveis**: nome PT/EN)
| coluna | tipo | notas |
|---|---|---|
| id | uuid | PK |
| label_pt / label_en | text | rótulo da tag (bilíngue) |

**`menu_item_tags`** — relação N:N entre itens e tags (multiseleção no cadastro do item)
| coluna | tipo | notas |
|---|---|---|
| item_id | uuid FK → menu_items | |
| tag_id | uuid FK → menu_tags | PK composta (`item_id`, `tag_id`) |

> **Cervejas (carta completa)** não fica nesta tabela: é uma **carta online externa** (link dinâmico). Guardar a URL em `site_settings`. Os **Taps** (torneiras do momento) ficam em `menu_items` (categoria `taps`).

**`posts`** — novidades/agenda (CMS)
| coluna | tipo | notas |
|---|---|---|
| id | uuid | PK |
| slug | text unique | rota `/novidades/{slug}` (gerado do título) |
| eyebrow_pt / eyebrow_en | text | sobre-título |
| category_id | uuid FK → post_categories | categoria (badge) — **gerenciável** |
| title_pt / title_en | text | |
| subtitle_pt / subtitle_en | text | subheadline/lede |
| cover_path | text | imagem de capa (opcional) |
| body | jsonb | blocos bilíngues: `{type:'paragraph'|'heading'|'video'|'gallery', ...}`. **Parágrafo guarda HTML** (editor WYSIWYG: negrito/itálico/lista/link); **galeria** com múltiplas imagens (Storage) |
| status | text | `draft` / `published` (botão **Publicar** define `published`) |
| published_at | timestamptz | |
| event_date | timestamptz | para agenda/eventos |
| author_id | uuid FK → profiles | |

**`post_categories`** — categorias de novidades (**gerenciáveis**: nome PT/EN)
| coluna | tipo | notas |
|---|---|---|
| id | uuid | PK |
| label_pt / label_en | text | rótulo da categoria (bilíngue) |

**`site_settings`** — chave/valor para configurações globais (uma linha por chave, ou JSONB único)
- `external_beer_menu_url`, `instagram_handle`, `phone_dialcode` (ex.: `+351`), `phone_number`, `address`, `map_lat`, `map_lng`, `google_place_id`, `welcome_voucher_pct` (20), `welcome_voucher_validity_days`.
- `hours` (jsonb) — **lista de dias da semana**, cada um com `{ day, open (bool), hours (text) }`; ao ativar o dia, informa-se o horário (ex.: `"16:00 – 00:00"`); dia inativo = fechado.
- `consent_version` (versão do texto) **e** `consent_text` — o **texto de consentimento** exibido no formulário do site (o carimbo por cliente fica em `customers.consent_version`/`consent_at`).

### 3.2 CRM — clientes, vouchers e fidelidade

**`customers`** — leads/clientes (campos exatamente como o modal do protótipo)
| coluna | tipo | notas |
|---|---|---|
| id | uuid | PK |
| first_name / last_name | text | |
| phone_dialcode | text | ex.: `+351` |
| phone_number | text | |
| email | citext **unique** | evita duplicados (idempotência) |
| language | text | `pt` / `en` |
| birth_country | text | |
| lives_in_portugal | enum | `sim` / `freq` / `nao` / `na` |
| district | text | preenchido só se `lives_in_portugal = sim` |
| consent_coupon | boolean | obrigatório true |
| consent_marketing | boolean | opcional |
| consent_version | text | versão do texto de consentimento aceito |
| consent_at | timestamptz | carimbo de consentimento (RGPD) |
| source | text | `site_form` |
| created_at | timestamptz | |

**`vouchers`** — controle do cupão de 20%
| coluna | tipo | notas |
|---|---|---|
| id | uuid | PK |
| customer_id | uuid FK → customers | |
| code | text unique | código único do cupão |
| type | text | `welcome_20` |
| discount_pct | int | 20 |
| status | enum | `issued` / `redeemed` / `expired` / `cancelled` |
| issued_at / expires_at / redeemed_at | timestamptz | |
| redeemed_by | uuid FK → profiles | quem validou no balcão |

> **Ações no painel:** resgatar (→ `redeemed`), cancelar (→ `cancelled`) e **reativar** um `expired`/`cancelled` (→ `issued` com nova `expires_at`). Toda ação destrutiva (cancelar, apagar, inativar, excluir) pede **confirmação** no painel.

O programa funciona como **cartela de selos por item de consumo** (espelha a cartela física: categorias de pint à esquerda, quantidades até o resgate à direita). Podem existir **vários programas**; cada cliente participa de **no máximo um** por vez.

**`loyalty_programs`** — programa de fidelidade (**gerenciável**: criar, editar, inativar/reativar)
| coluna | tipo | notas |
|---|---|---|
| id | uuid | PK |
| name | text | ex.: "Cartão Cerveja" |
| points_required | int | **selos necessários para o resgate** (ex.: 5) |
| is_active | boolean | ao salvar/criar fica ativo; pode ser inativado/reativado |
| activated_at | timestamptz | data de ativação |
| deactivated_at | timestamptz | data de inativação (null quando ativo) |

**`loyalty_program_items`** — **itens de consumo** do programa (N, configuráveis; ex.: `56`, `33`, `28`)
- `id`, `program_id` FK, `label` (rótulo do item), `sort_order`.

**`loyalty_cards`** — cartão do cliente (**1 por cliente**; atribuído a um programa)
- `id`, `customer_id` FK **unique**, `program_id` FK, `created_at`. Atribuição explícita no painel ("Atribuir programa").

**`loyalty_cartelas`** — cartela (linha) por item; acumula selos até o resgate
- `id`, `card_id` FK, `item_id` FK → `loyalty_program_items`, `redeemed_at` timestamptz, `redeemed_by` FK profiles.
- Existe **uma cartela ativa por item** (`redeemed_at is null`). Ao atingir `points_required` selos e resgatar, ela é marcada como resgatada e **abre-se uma nova cartela zerada** do mesmo item.

**`loyalty_stamps`** — selos (1 registro por selo, com histórico de data/hora e operador)
- `id`, `cartela_id` FK, `recorded_by` FK profiles, `recorded_at` timestamptz.
- **Consumidos** = contagem de selos; **resgatados** = cartelas com `redeemed_at`. Permite **desfazer o último** selo da cartela ativa (correção).

### 3.3 Administração e auditoria

**`profiles`** — usuários da equipe (1:1 com `auth.users`) — **com gestão de perfis no painel**
- `id` (= auth.uid), `name`, `email`, `role` enum (`owner`, `staff`), `is_active`, `invited_by` FK→profiles, `invited_at`, `last_login_at`.
- **Papéis:** `owner` (sócios/gestor) configura regras, programa de fidelidade, configurações do site **e gere os perfis admin** (convidar, alterar papel, ativar/desativar). `staff` opera o dia a dia (validar voucher, registar consumo, gerir cardápio/novidades) mas **não** gere usuários nem configurações sensíveis.
- O owner **não pode rebaixar/remover a si próprio** se for o último owner ativo (regra de proteção).
- **Meu perfil (self-service):** qualquer usuário logado vê os próprios dados (nome, e-mail, papel, último acesso) e **altera a própria senha** (via Supabase Auth `updateUser`). Acesso pelo menu do usuário na topbar.

**`audit_log`** — trilha de auditoria de ações sensíveis
- `id`, `actor_id`, `action`, `table_name`, `record_id`, `diff` jsonb, `ip`, `created_at`.

### 3.4 Caches de integrações (evitam chamadas/custos e protegem chaves)
- **`instagram_cache`**: `id`, `fetched_at`, `payload` jsonb (últimos posts).
- **`google_reviews_cache`**: `id`, `fetched_at`, `rating`, `reviews_count`, `reviews` jsonb.
- **`email_log`** (opcional): envios de voucher (status, provider id).

### 3.5 i18n (PT/EN)
Idiomas: **Português de Portugal (pt-PT)** + **Inglês (en)**. Estratégia: **colunas `*_pt` e `*_en`**. **Decisão atualizada:** a **tradução é manual** — o administrador de conteúdo preenche PT e EN em cada campo (o editor tem abas PT/EN). **Não** há tradução automática por IA (a Edge Function `translate` foi removida do escopo). O seletor de idioma do site serve o conteúdo conforme o locale; se o EN estiver vazio, recomenda-se **fallback para o PT**.

---

## 4. Esboço de DDL + RLS (exemplos)

```sql
-- Extensões úteis
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "citext";     -- email case-insensitive

-- Exemplo: customers
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name  text not null,
  phone_dialcode text not null,
  phone_number   text not null,
  email citext not null unique,
  language text not null default 'pt' check (language in ('pt','en')),
  birth_country text,
  lives_in_portugal text check (lives_in_portugal in ('sim','freq','nao','na')),
  district text,
  consent_coupon boolean not null default false,
  consent_marketing boolean not null default false,
  consent_version text,
  consent_at timestamptz,
  source text default 'site_form',
  created_at timestamptz not null default now()
);
alter table public.customers enable row level security;

-- NINGUÉM acessa diretamente pelo cliente anônimo:
-- inserções passam por Edge Function com service_role (validação + captcha + rate limit).
-- Admin (equipe) pode ler:
create policy "admin reads customers"
  on public.customers for select
  using ( exists (select 1 from public.profiles p
                  where p.id = auth.uid() and p.is_active) );

-- Exemplo: posts — leitura pública só do que está publicado
alter table public.posts enable row level security;
create policy "public reads published posts"
  on public.posts for select
  using ( status = 'published' );
create policy "admin manages posts"
  on public.posts for all
  using ( exists (select 1 from public.profiles p where p.id = auth.uid()) )
  with check ( exists (select 1 from public.profiles p where p.id = auth.uid()) );
```

> Regra de ouro: **RLS habilitado em TODAS as tabelas**, negando por padrão. Conteúdo público (cardápio ativo, posts publicados) tem policy de `select` público; **toda escrita** exige admin autenticado ou passa por Edge Function com `service_role` (nunca exposto ao browser).

---

## 5. Funcionalidades → fluxo técnico

1. **Cadastro do cupão de 20%** (modal do site)
   - Frontend valida (campos obrigatórios, distrito condicional) → envia para **Edge Function** `submit-lead`.
   - A função: valida (zod) → checa **CAPTCHA (Turnstile)** + honeypot → **rate limit** por IP/e-mail → `upsert` em `customers` (e-mail único, idempotente) → gera `vouchers` (código único, `expires_at`) → **envia e-mail** (Resend) com o cupão → grava `email_log` → retorna sucesso.
   - Anti-abuso: e-mail único, rate limit, captcha, honeypot; nunca confiar no cliente.

2. **Validação/uso do voucher** (balcão)
   - Admin busca por código/e-mail → marca `redeemed` (`redeemed_at`, `redeemed_by`). Estado controla "usado/não usado". Job diário expira vencidos.
   - **Validade configurável pelo admin:** a duração do cupão (`welcome_voucher_validity_days`) e a % de desconto ficam em `site_settings`, editáveis no painel — sem precisar de deploy.

3. **Cartão fidelidade (cartela de selos)**
   - Admin cria/edita `loyalty_programs` (nome, selos p/ resgate, **itens de consumo**), inativa/reativa (com confirmação; datas de ativação/inativação registradas).
   - Cliente é **atribuído** a um programa (cria `loyalty_cards`, 1 por cliente). Equipe **marca selos** por item — cada selo vira um `loyalty_stamps` (com operador e data/hora); permite **desfazer o último**.
   - Ao completar `points_required` selos numa cartela → habilita **resgate** (com confirmação) → marca `loyalty_cartelas.redeemed_at`/`redeemed_by` e **abre nova cartela** zerada do item.

4. **CMS de novidades** — CRUD em `posts` (**tela dedicada**, não modal), **categorias gerenciáveis** (`post_categories`), blocos `body` (parágrafo em **HTML/WYSIWYG** com negrito/itálico/lista/link, subtítulo, vídeo, **galeria com múltiplas imagens**), upload no Storage, `status` `draft`/`published` (botão **Publicar**). PT e EN manuais.

5. **CMS de cardápio** — CRUD em `menu_items` (**tela dedicada**), **categorias e tags gerenciáveis** (`menu_categories` com ordem, `with_photo` e texto; `menu_tags` em **multiseleção**). Toggles `is_active`, `sold_out` e `is_new` (destaque). **Foto obrigatória** quando a categoria tem `with_photo = true`. Cervejas via carta externa.

6. **i18n PT/EN** — conteúdo bilíngue preenchido **manualmente** pelo admin (abas/campos PT e EN). Site serve o idioma conforme o seletor, com **fallback para PT** quando o EN estiver vazio.

7. **Feed do Instagram** — ⚠️ a *Basic Display API* foi **descontinuada (dez/2024)**. Usar a **Instagram API com Instagram Login / Graph API**, que exige **conta profissional (Business/Creator)**. Edge Function + **cron** busca e grava em `instagram_cache`; o site lê o cache (protege o token e evita rate limits). Alternativa de baixo custo: widget (Behold/EmbedSocial — free tier).

8. **Avaliações e nota do Google (dinâmicas)** — Edge Function + **cron** busca via **Places API** a nota média, o nº de avaliações e os textos, e grava em `google_reviews_cache`; o site lê do cache (atualizar 1–2×/dia mantém "dinâmico" com custo mínimo). Mapa via embed com `map_lat/lng` de `site_settings`.

9. **Gestão de perfis admin** — owner convida membros por e-mail (Supabase Auth **invite**), define papel (`owner`/`staff`), ativa/desativa e vê último acesso. Fluxo: owner cria convite → e-mail com link → novo membro define senha + **ativa MFA** → entra com papel atribuído. Todas as ações ficam no `audit_log`.

---

## 6. Segurança (proteção contra invasões)

**Acesso a dados (o mais importante):**
- **RLS habilitado em todas as tabelas**, política "deny by default"; liberar apenas leitura pública do conteúdo publicado.
- **Nunca expor a `service_role key`** no frontend. No browser só a **anon key** (limitada por RLS). `service_role` só em Edge Functions / servidor.
- Escritas sensíveis (leads, vouchers, fidelidade) **somente via Edge Function** validada — não permitir `insert` anônimo direto.

**Aplicação:**
- **Validação de entrada** (zod/schema) em todas as rotas; rejeitar payloads inesperados.
- **Consultas parametrizadas** (cliente Supabase / queries preparadas) → previne **SQL injection**.
- **Sanitização/escape** de conteúdo do CMS para evitar **XSS** (especialmente blocos de corpo e HTML embed de vídeo: usar allowlist de domínios de embed).
- **CAPTCHA (Cloudflare Turnstile, grátis)** + **honeypot** no formulário público.
- **Rate limiting** (Upstash Redis free, ou limites nativos) em formulário e login.
- **CORS** restrito ao domínio do site; **CSRF** protegido nas rotas autenticadas.
- **Cabeçalhos de segurança** (via middleware/headers do Next): `Content-Security-Policy`, `Strict-Transport-Security` (HSTS), `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`.
- **HTTPS** sempre (TLS automático na Vercel/Cloudflare).

**Autenticação/admin:**
- Supabase Auth **invite-only** (desabilitar signup público). **MFA/TOTP** para a equipe; senha forte.
- Verificação de papel (`profiles.role`) nas policies e nas rotas do painel.
- Proteção contra brute-force no login (rate limit + captcha).
- **Princípio do menor privilégio** por papel (owner vs staff).

**Privacidade / RGPD (UE/Portugal):**
- Base legal: **consentimento** (cupão/marketing) com **carimbo e versão** do texto aceito.
- Minimização de dados, **política de privacidade** e **consentimento de cookies**, direito ao **esquecimento** (rota de exclusão), retenção definida.
- Tratar PII com cuidado (não logar dados sensíveis; acesso restrito por RLS).

**Operação:**
- **Auditoria** (`audit_log`) de ações sensíveis.
- **Backups** do banco (Supabase free tem retenção limitada → agendar `pg_dump` para Storage/externo ou avaliar upgrade).
- **Monitoramento/alertas**: logs Supabase/Vercel + **Sentry (free)** para erros.
- **Dependências**: `npm audit` + **Dependabot** (grátis no GitHub).
- Segredos em **env vars / Supabase Vault**; rotação de chaves; jamais commitar `.env`.

---

## 7. Soluções específicas (grátis / baixo custo)

| Necessidade | Solução recomendada | Custo |
|---|---|---|
| E-mail do voucher (transacional) | **Resend** | Grátis 3.000 e-mails/mês (100/dia) |
| Anti-bot no formulário | **Cloudflare Turnstile** | Grátis |
| Rate limiting | **Upstash Redis** | Free tier |
| Agendamentos (caches, expiração, keep-alive) | **Supabase Cron / Vercel Cron** | Grátis |
| Monitoramento de erros | **Sentry** | Free tier |
| Analytics | **Umami/Plausible (self-host)** ou Vercel Analytics | Grátis / baixo |
| Instagram | **Graph API** (conta profissional) + cache | Grátis (requer conta business) |
| Avaliações Google | **Places API** + cache agressivo | Baixo (cachear!) |
| Tradução PT→EN | **Manual** (admin preenche PT e EN) | — (sem custo de IA) |
| Imagens | Supabase Storage + `next/image` | Grátis no free tier |

---

## 8. Esquema de permissões (resumo)

| Recurso | Anônimo (site) | Staff | Owner |
|---|---|---|---|
| Cardápio/Posts publicados | leitura | leitura+gestão | total |
| Enviar formulário (lead) | via Edge Function | — | — |
| Customers/Vouchers | sem acesso | ler/validar | total |
| Fidelidade (registrar consumo) | — | registrar | configurar regra |
| Configurações do site | — | — | editar |

---

## 9. Custos e free tier (resumo verificado)

- **Supabase Free:** 500 MB de banco, 1 GB de Storage, 5 GB de egress, 50.000 usuários ativos/mês, **pausa após ~7 dias de inatividade** (mitigar com cron keep-alive), 2 projetos ativos. Para produção séria, considerar **Pro (US$25/mês)** (sem pausa, backups, mais recursos).
- **Vercel:** Hobby (grátis) tem 100 GB de banda e 1M invocações, **mas é só uso não‑comercial** → para produção comercial usar **Pro (~US$20/mês)** ou hospedar grátis em **Cloudflare Pages/Netlify** (permitem uso comercial).
- **Resend:** grátis até 3.000 e-mails/mês — suficiente para o volume de um pub.

**Cenário escolhido (robusto):** **Vercel Pro (~US$20)** + **Supabase Pro (~US$25)** + serviços de apoio em free tier (Resend, Turnstile, Upstash, Sentry, Cron) → **~US$45/mês**. Custos variáveis adicionais marginais: tradução por IA (centavos) e Google Places (mantido baixo com cache). Este cenário remove a pausa por inatividade do Supabase, garante backups automáticos e mantém a stack pedida (Vercel + Supabase) em conformidade comercial.

---

## 10. Riscos e atenções

- ~~Supabase Free pausa por inatividade~~ → **resolvido** com Supabase Pro (sem pausa, com backups).
- ~~Vercel Hobby é não‑comercial~~ → **resolvido** com Vercel Pro.
- **Instagram exige conta profissional** e tokens com renovação → encapsular em Edge Function + cache.
- **Google Places** pode gerar custo → cachear avaliações (atualizar 1–2×/dia).
- **RGPD** é obrigatório (clientes na UE) → política de privacidade, consentimento e exclusão desde o início.
- **Backups** no free tier são limitados → rotina própria de backup.

---

## 11. Decisões validadas

| # | Tema | Decisão |
|---|---|---|
| 1 | Hospedagem | **Vercel Pro** |
| 2 | Orçamento | **Cenário robusto** (~US$45/mês: Vercel Pro + Supabase Pro) |
| 3 | Instagram | Conta **já profissional** → feed via **Instagram Graph API** + cache |
| 4 | Google | **Avaliações e nota dinâmicas** via Places API + cache (1–2×/dia) |
| 5 | Idiomas | **pt-PT** + **Inglês**, ambos preenchidos **manualmente** pelo admin (sem tradução automática); fallback para PT |
| 6 | Perfis admin | **Gestão de perfis** com dois papéis: **owner** e **staff** (convite, papel, ativar/desativar) + **Meu perfil** self-service (trocar senha) |
| 7 | Validade do voucher / fidelidade | **Configuráveis pelo admin** (em `site_settings` e `loyalty_programs`); voucher pode ser **reativado** |
| 8 | Fidelidade | Modelo de **cartela de selos** por item; **1 programa por cliente**; programas e itens de consumo **configuráveis**; selos com histórico (operador + data/hora) |
| 9 | Cardápio | **Categorias e tags gerenciáveis**; categoria com `with_photo` (produtos em cards) e **ordem** reordenável; item com destaque `is_new` e campos PT/EN (nome, descrição, unidade) |
| 10 | Ações destrutivas | Sempre exigem **confirmação** no painel |

### Próximos passos
1. Eu transformo este rascunho na **versão final** da spec (sem marcações de rascunho).
2. Gerar o **script SQL completo** de criação do schema + policies RLS + triggers (migração inicial Supabase).
3. Definir as **Edge Functions** (contratos de entrada/saída): `submit-lead`, `redeem-voucher`, `refresh-instagram`, `refresh-google-reviews`, `invite-admin`. *(A `translate` foi removida — tradução é manual.)*
4. Mapear as **telas do painel** (CRM/Manager) a partir destas tabelas e papéis.

---

### Fontes (dados de free tier / APIs verificados em jun/2026)
- Instagram Basic Display — descontinuação: https://developers.facebook.com/blog/post/2024/09/04/update-on-instagram-basic-display-api/
- Supabase — preços e limites: https://supabase.com/pricing
- Vercel — plano Hobby (uso não-comercial): https://vercel.com/docs/plans/hobby
- Resend — preços/free tier: https://resend.com/pricing
