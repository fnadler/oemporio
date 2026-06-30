# O Empório — Especificação Técnica do Backend (RASCUNHO para validação)

> Documento técnico para o backend do site + CRM/Manager do **O Empório — Comfort Food & Craft Beer** (Ericeira, PT).
> Base no escopo da **proposta comercial** (site institucional + CRM) e nas **telas do protótipo** (Home, Cardápio, Novidades + modal de cadastro).
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
| Lógica de servidor | **Supabase Edge Functions** e/ou **Next.js API Routes** | Submissão do formulário, emissão de voucher, traduções, caches de integrações. |
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

**`menu_categories`** — categorias do cardápio (Taps, Comidas, Vinhos, Bebidas…)
| coluna | tipo | notas |
|---|---|---|
| id | uuid | PK |
| slug | text unique | `taps`, `comidas`, `vinhos`, `bebidas` |
| name_pt / name_en | text | rótulo exibido |
| layout | text | `list` ou `cards` (comidas = cards) |
| sort_order | int | ordem na navegação |
| is_active | boolean | |

**`menu_items`** — itens do cardápio
| coluna | tipo | notas |
|---|---|---|
| id | uuid | PK |
| category_id | uuid FK → menu_categories | |
| name_pt / name_en | text | |
| description_pt / description_en | text | |
| price | numeric(8,2) | |
| price_unit | text | ex.: `/ 33cl`, `copo` |
| meta | text | ex.: "LETRA · VILA VERDE — 5,0% ABV" (ou colunas próprias: brewery, origin, abv, ibu) |
| tags | text[] | `local`, `convidada`, `novidade`, `tinto`… |
| photo_path | text | caminho no Storage (comidas) |
| is_active | boolean | **ativar/inativar** (controla exibição no site) |
| sold_out | boolean | estado "Esgotada" |
| sort_order | int | |

> **Cervejas (carta completa)** não fica nesta tabela: é uma **carta online externa** (link dinâmico). Guardar a URL em `site_settings`. Os **Taps** (torneiras do momento) ficam em `menu_items` (categoria `taps`).

**`posts`** — novidades/agenda (CMS)
| coluna | tipo | notas |
|---|---|---|
| id | uuid | PK |
| slug | text unique | rota `/novidades/{slug}` |
| eyebrow_pt / eyebrow_en | text | sobre-título |
| category_pt / category_en | text | rótulo (badge) |
| title_pt / title_en | text | |
| subtitle_pt / subtitle_en | text | subheadline/lede |
| cover_path | text | imagem de capa (opcional) |
| body | jsonb | blocos: `{type:'paragraph'|'heading'|'video'|'gallery', ...}` (espelha o protótipo) |
| status | text | `draft` / `published` |
| published_at | timestamptz | |
| event_date | timestamptz | para agenda/eventos |
| author_id | uuid FK → profiles | |

**`site_settings`** — chave/valor para configurações globais (uma linha por chave, ou JSONB único)
- `external_beer_menu_url`, `instagram_handle`, `address`, `hours` (jsonb), `map_lat`, `map_lng`, `google_place_id`, `welcome_voucher_pct` (20), `welcome_voucher_validity_days`, etc.

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

**`loyalty_programs`** — **regra configurável** do cartão fidelidade (definida pelo admin)
| coluna | tipo | notas |
|---|---|---|
| id | uuid | PK |
| name | text | ex.: "Cartão Cerveja" |
| eligible_scope | text | `category` ou `item` |
| eligible_ref | uuid/text | qual categoria/produto acumula |
| points_required | int | ex.: 10 |
| reward_description | text | ex.: "1 cerveja grátis" |
| is_active | boolean | |
| starts_at / ends_at | timestamptz | opcional |

**`loyalty_cards`** — cartão por cliente/programa (saldo derivado das entradas)
- `id`, `customer_id` FK, `program_id` FK, `created_at`. (saldo calculado de `loyalty_entries`)

**`loyalty_entries`** — registro de consumo (selos)
- `id`, `card_id` FK, `qty` int, `recorded_by` FK profiles, `recorded_at`, `note`.

**`loyalty_rewards`** — resgates do benefício
- `id`, `card_id` FK, `program_id` FK, `redeemed_at`, `recorded_by` FK profiles.

### 3.3 Administração e auditoria

**`profiles`** — usuários da equipe (1:1 com `auth.users`) — **com gestão de perfis no painel**
- `id` (= auth.uid), `name`, `email`, `role` enum (`owner`, `staff`), `is_active`, `invited_by` FK→profiles, `invited_at`, `last_login_at`.
- **Papéis:** `owner` (sócios/gestor) configura regras, programa de fidelidade, configurações do site **e gere os perfis admin** (convidar, alterar papel, ativar/desativar). `staff` opera o dia a dia (validar voucher, registar consumo, gerir cardápio/novidades) mas **não** gere usuários nem configurações sensíveis.
- O owner **não pode rebaixar/remover a si próprio** se for o último owner ativo (regra de proteção).

**`audit_log`** — trilha de auditoria de ações sensíveis
- `id`, `actor_id`, `action`, `table_name`, `record_id`, `diff` jsonb, `ip`, `created_at`.

### 3.4 Caches de integrações (evitam chamadas/custos e protegem chaves)
- **`instagram_cache`**: `id`, `fetched_at`, `payload` jsonb (últimos posts).
- **`google_reviews_cache`**: `id`, `fetched_at`, `rating`, `reviews_count`, `reviews` jsonb.
- **`email_log`** (opcional): envios de voucher (status, provider id).

### 3.5 i18n (PT/EN)
Idiomas confirmados: **Português de Portugal (pt-PT)** como canônico + **Inglês (en)** com **tradução automática**. Estratégia recomendada: **colunas `*_pt` (canônico) + `*_en`**. O EN é gerado por IA na publicação (Edge Function) e **fica editável** pelo admin (a tradução automática nunca sobrescreve um EN editado manualmente — usar flag `*_en_locked`). O seletor de idioma do site serve o conteúdo conforme o locale.

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

3. **Cartão fidelidade configurável**
   - Admin cria/edita `loyalty_programs` (produto elegível, pontos necessários, benefício).
   - Equipe registra consumo → `loyalty_entries` (qty). Saldo = soma das entries − resgates.
   - Quando saldo ≥ `points_required` → habilita resgate → grava `loyalty_rewards` e debita.

4. **CMS de novidades** — CRUD em `posts`, upload de mídia no Storage, `status` draft/published, blocos `body` (parágrafo/subtítulo/vídeo/galeria) iguais ao protótipo. Tradução EN sob demanda.

5. **CMS de cardápio** — CRUD em `menu_items`, **ativar/inativar** (`is_active`), `sold_out`, ordenação, foto (Storage) para comidas.

6. **i18n PT/EN** — Edge Function `translate` chama um LLM (baixo custo) ao publicar, preenche `*_en`, admin pode editar. Site serve idioma conforme seletor.

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
| Tradução PT→EN | LLM por API, em lote na publicação | Centavos/mês |
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
| 5 | Idiomas | **Português de Portugal (pt-PT)** + **Inglês** com **tradução automática** (editável) |
| 6 | Perfis admin | **Gestão de perfis** com dois papéis: **owner** e **staff** (convite, papel, ativar/desativar) |
| 7 | Validade do voucher / fidelidade | **Configuráveis pelo admin** (em `site_settings` e `loyalty_programs`) |

### Próximos passos
1. Eu transformo este rascunho na **versão final** da spec (sem marcações de rascunho).
2. Gerar o **script SQL completo** de criação do schema + policies RLS + triggers (migração inicial Supabase).
3. Definir as **Edge Functions** (contratos de entrada/saída): `submit-lead`, `redeem-voucher`, `translate`, `refresh-instagram`, `refresh-google-reviews`, `invite-admin`.
4. Mapear as **telas do painel** (CRM/Manager) a partir destas tabelas e papéis.

---

### Fontes (dados de free tier / APIs verificados em jun/2026)
- Instagram Basic Display — descontinuação: https://developers.facebook.com/blog/post/2024/09/04/update-on-instagram-basic-display-api/
- Supabase — preços e limites: https://supabase.com/pricing
- Vercel — plano Hobby (uso não-comercial): https://vercel.com/docs/plans/hobby
- Resend — preços/free tier: https://resend.com/pricing
