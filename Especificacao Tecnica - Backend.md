# O Empório — Especificação Técnica do Backend

> Documento técnico para o backend do site + CRM/Manager do **O Empório — Comfort Food & Craft Beer** (Ericeira, PT).
> Base na proposta comercial (site institucional + CRM), nas telas do protótipo/Manager (Home, Cardápio, Novidades no site; e no Manager: Contatos, Vouchers, Fidelidade, Novidades, Cardápio, Configurações e Perfis — com telas dedicadas de cadastro/edição) e na revisão de segurança realizada sobre o código em produção.
> **Stack alvo:** Banco/Backend em **Supabase** · Hospedagem em **Vercel**.
> Status: **validado — pronto para implementação**.

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
| E-mail transacional | **Brevo** (já integrado em produção) | Envio do cupão e notificação interna. Chamado apenas em processo, nunca como endpoint público (ver §6). |
| Agendamentos | **Supabase Cron (pg_cron)** ou **Vercel Cron** | Atualizar caches (Instagram/Reviews), expirar vouchers, e **manter o projeto ativo** (ver §9). |

> ✅ **Decisão (validada):** hospedagem em **Vercel Pro (~US$20/mês)** — o plano Hobby é apenas não‑comercial e não serve para um negócio. Banco em **Supabase Pro (~US$25/mês)** (sem pausa por inatividade, backups automáticos). Ver §9.

### Ambientes
- **dev** (local) → **preview** (deploy automático por branch) → **produção**.
- Dois projetos Supabase no mínimo recomendados: um de **staging** e um de **produção** (o free tier permite 2 projetos ativos).
- Segredos por ambiente em variáveis de ambiente (Vercel) e **Supabase Vault** (chaves de API).

### Migração dos dados legados
O site atual (v1) já grava leads na tabela `leads` (achatada: nome/telefone únicos, `cupom_utilizado` boolean, sem separação entre contato e cupão). O backend novo substitui esse modelo por `customers` + `vouchers` (§3.2), estruturalmente diferente. A virada para o backend novo inclui uma **migração/ETL explícita** dos dados de `leads` para `customers`/`vouchers` — não é só trocar credenciais de conexão. Mapeamento de campos:

| `leads` (atual) | `customers` (novo) | Observação |
|---|---|---|
| `primeiro_nome` / `sobrenome` | `first_name` / `last_name` | direto |
| `telefone` (único campo) | `phone_dialcode` + `phone_number` | requer split (DDI + número) |
| `email` | `email` | direto |
| `idioma_preferido` (`pt_PT`/`en`) | `language` (`pt`/`en`) | requer normalização de valor |
| `aceitou_cupom` | `consent_coupon` | direto |
| `aceitou_marketing` | `consent_marketing` | direto |
| — | `birth_country`, `lives_in_portugal`, `district` | **não existem em `leads`** — o formulário do site v2 já coleta esses campos, mas a API atual os descarta (ver nota abaixo); ficam nulos/"na" para os registros migrados |
| `cupom_utilizado` (boolean) | `vouchers.status` (enum) | 1 lead → 1 `customer` + 1 `voucher` (status `redeemed` se `cupom_utilizado = true`, senão `issued`, sem `code` retroativo se não existir) |

> Nota: o `CouponModal.tsx` do site v2 já envia `pais_nascimento`/`vive_portugal`/`distrito` para `/api/leads`, mas a rota atual descarta esses campos porque `leads` não os tem — esses dados vêm sendo perdidos desde que o formulário v2 entrou no ar. Isso reforça a prioridade da tabela `customers` nova.

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
| category_id | uuid FK → menu_categories **ON DELETE RESTRICT** | ver regra de negócio abaixo |
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

> **Regra de negócio — exclusão de categoria:** uma categoria com itens vinculados **não pode ser excluída**. A tentativa deve ser bloqueada com uma mensagem de erro clara na UI ("Esta categoria tem N itens vinculados — mova ou remova os itens antes de excluir"), e reforçada no banco pela FK `ON DELETE RESTRICT` (o Postgres recusa a exclusão mesmo se alguém tentar direto na API/SQL).

> **Regra de negócio — foto obrigatória:** ao salvar um item cuja categoria tem `with_photo = true`, a ausência de `photo_path` deve **bloquear o salvamento** e exibir um alerta claro ao usuário. Essa checagem existe tanto no client (feedback imediato) quanto no servidor/Edge Function (gatekeeper real — ver §4 para o trigger de banco).

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
| published_at | timestamptz | **único campo de data do post** — usado tanto para exibição quanto para ordenação na agenda/novidades. (Decisão: não há campo separado de "data do evento" — um post sobre um evento futuro usa `published_at` como a data a exibir.) |
| author_id | uuid FK → profiles | |

**`post_categories`** — categorias de novidades (**gerenciáveis**: nome PT/EN)
| coluna | tipo | notas |
|---|---|---|
| id | uuid | PK |
| label_pt / label_en | text | rótulo da categoria (bilíngue) |

**`site_settings`** — chave/valor para configurações globais (uma linha por chave, ou JSONB único)
- `external_beer_menu_url`, `instagram_handle`, `phone_dialcode` (ex.: `+351`), `phone_number`, `address`, `map_lat`, `map_lng`, `google_place_id` (necessário para a integração de avaliações do Google — §5.8), `welcome_voucher_pct` (20), `welcome_voucher_validity_days`.
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
| redeemed_by | uuid FK → profiles | quem validou no balcão — **preenchido pelo servidor a partir da sessão autenticada, nunca aceito do client** |

> **Ações no painel:** resgatar (→ `redeemed`), cancelar (→ `cancelled`) e **reativar** um `expired`/`cancelled` (→ `issued` com nova `expires_at`, calculada a partir de `site_settings.welcome_voucher_validity_days` — nunca um valor fixo no código). Toda ação destrutiva (cancelar, apagar, inativar, excluir) pede **confirmação** no painel.
>
> **Exibição na UI:** a listagem/ficha de voucher mostra **quem validou e quando** (`redeemed_by` + `redeemed_at`) para todo voucher `redeemed`.

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

> **Regra de negócio — programa inativado:** inativar um programa **não bloqueia** o registro de novos selos para clientes já atribuídos a ele — a equipe continua marcando normalmente. A UI exibe um alerta visível na tela do cartão: *"Este programa foi encerrado em dd/mm/aaaa"*. O que muda é só a **atribuição**: um programa inativo não aparece como opção ao atribuir um cliente novo.

**`loyalty_program_items`** — **itens de consumo** do programa (N, configuráveis; ex.: `56`, `33`, `28`)
- `id`, `program_id` FK, `label` (rótulo do item), `sort_order`.

**`loyalty_cards`** — cartão do cliente (**1 por cliente**; atribuído a um programa)
- `id`, `customer_id` FK **unique**, `program_id` FK (**programa atual**), `created_at`. Atribuição explícita no painel ("Atribuir programa").

> **Regra de negócio — troca de programa:** ao atribuir um cliente a um programa diferente do atual, o cartão passa a apontar para o novo `program_id`, mas **as cartelas e selos do programa anterior são preservados** (nunca zerados/apagados) — ficam retidos no histórico do cliente para consulta completa, mesmo que não recebam mais selos novos (os itens de um programa anterior não aparecem mais na grade ativa, só no histórico).

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
Idiomas: **Português de Portugal (pt-PT)** + **Inglês (en)**. Estratégia: **colunas `*_pt` e `*_en`**. A **tradução é manual** — o administrador de conteúdo preenche PT e EN em cada campo (o editor tem abas PT/EN). **Não** há tradução automática por IA. O seletor de idioma do site serve o conteúdo conforme o locale; se o EN estiver vazio, recomenda-se **fallback para o PT**.

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

-- Exemplo: bloqueio de exclusão de categoria com itens vinculados (defesa em profundidade —
-- a UI já impede a ação, mas a constraint garante que nem uma chamada direta à API contorne a regra).
alter table public.menu_items
  add constraint menu_items_category_fk
  foreign key (category_id) references public.menu_categories(id)
  on delete restrict;

-- Exemplo: foto obrigatória quando a categoria exige (with_photo = true).
-- CHECK não pode referenciar outra tabela — a checagem entra via trigger.
create or replace function public.enforce_menu_item_photo()
returns trigger language plpgsql as $$
declare
  requires_photo boolean;
begin
  select with_photo into requires_photo
  from public.menu_categories where id = new.category_id;

  if requires_photo and (new.photo_path is null or new.photo_path = '') then
    raise exception 'PHOTO_REQUIRED: categoria exige foto do produto';
  end if;
  return new;
end;
$$;

create trigger menu_items_photo_check
  before insert or update on public.menu_items
  for each row execute function public.enforce_menu_item_photo();
```

> Regra de ouro: **RLS habilitado em TODAS as tabelas**, negando por padrão. Conteúdo público (cardápio ativo, posts publicados) tem policy de `select` público; **toda escrita** exige admin autenticado ou passa por Edge Function com `service_role` (nunca exposto ao browser).

---

## 5. Funcionalidades → fluxo técnico

1. **Cadastro do cupão de 20%** (modal do site)
   - Frontend valida (campos obrigatórios, distrito condicional) → envia para **Edge Function** `submit-lead`.
   - A função: valida (zod) → checa **honeypot** (campo oculto — preenchido = bot, responde sucesso falso sem gravar) → checa **CAPTCHA** (score mínimo 0.5, ação `submit_lead`) → **rate limit** por IP/e-mail → `upsert` em `customers` (e-mail único, idempotente) → gera `vouchers` (código único, `expires_at` calculado de `site_settings.welcome_voucher_validity_days`) → **envia e-mail** (Brevo) chamado **em processo** (nunca como endpoint HTTP público — ver §6) → grava `email_log` → retorna sucesso.
   - Anti-abuso: e-mail único, rate limit, captcha, honeypot; nunca confiar no cliente.

2. **Validação/uso do voucher** (balcão)
   - Admin busca por código/e-mail → marca `redeemed` (`redeemed_at`, `redeemed_by` — preenchido pelo servidor a partir da sessão do usuário logado). Estado controla "usado/não usado", exibido junto com quem validou e quando. Job diário expira vencidos.
   - **Validade configurável pelo admin:** a duração do cupão (`welcome_voucher_validity_days`) e a % de desconto ficam em `site_settings`, editáveis no painel — sem precisar de deploy. A reativação de um voucher expirado/cancelado **sempre lê esse valor** para calcular a nova `expires_at` (nunca um número fixo hardcoded).

3. **Cartão fidelidade (cartela de selos)**
   - Admin cria/edita `loyalty_programs` (nome, selos p/ resgate, **itens de consumo**), inativa/reativa (com confirmação; datas de ativação/inativação registradas).
   - Cliente é **atribuído** a um programa (cria `loyalty_cards`, 1 por cliente). Trocar de programa **preserva o histórico** de cartelas/selos do programa anterior — nada é apagado.
   - Equipe **marca selos** por item — cada selo vira um `loyalty_stamps` (com operador e data/hora); permite **desfazer o último**. Isso continua funcionando mesmo se o programa do cliente tiver sido inativado (a UI só avisa que o programa foi encerrado numa data, sem bloquear o registro).
   - Ao completar `points_required` selos numa cartela → habilita **resgate** (com confirmação) → marca `loyalty_cartelas.redeemed_at`/`redeemed_by` e **abre nova cartela** zerada do item.

4. **CMS de novidades** — CRUD em `posts` (**tela dedicada**, não modal), **categorias gerenciáveis** (`post_categories`), blocos `body` (parágrafo em **HTML/WYSIWYG** com negrito/itálico/lista/link, subtítulo, vídeo, **galeria com múltiplas imagens**), upload no Storage, `status` `draft`/`published` (botão **Publicar**). Um único campo de data (`published_at`), usado tanto para exibição quanto ordenação. PT e EN manuais.

5. **CMS de cardápio** — CRUD em `menu_items` (**tela dedicada**), **categorias e tags gerenciáveis** (`menu_categories` com ordem, `with_photo` e texto; `menu_tags` em **multiseleção**). Toggles `is_active`, `sold_out` e `is_new` (destaque). **Foto obrigatória** quando a categoria tem `with_photo = true` — bloqueia o salvamento com alerta, no client e no servidor. **Exclusão de categoria com itens vinculados é bloqueada**, com mensagem de erro. Cervejas via carta externa.

6. **i18n PT/EN** — conteúdo bilíngue preenchido **manualmente** pelo admin (abas/campos PT e EN). Site serve o idioma conforme o seletor, com **fallback para PT** quando o EN estiver vazio.

7. **Feed do Instagram** — ⚠️ a *Basic Display API* foi **descontinuada (dez/2024)**. Usar a **Instagram API com Instagram Login / Graph API**, que exige **conta profissional (Business/Creator)**. Edge Function + **cron** busca e grava em `instagram_cache`; o site lê o cache (protege o token e evita rate limits). Alternativa de baixo custo: widget (Behold/EmbedSocial — free tier).

8. **Avaliações e nota do Google (dinâmicas)** — Edge Function + **cron** busca via **Places API** (usando `site_settings.google_place_id`) a nota média, o nº de avaliações e os textos, e grava em `google_reviews_cache`; o site lê do cache (atualizar 1–2×/dia mantém "dinâmico" com custo mínimo). Mapa via embed com `map_lat/lng` de `site_settings`.

9. **Gestão de perfis admin** — owner convida membros por e-mail (Supabase Auth **invite**), define papel (`owner`/`staff`), ativa/desativa e vê último acesso. Fluxo: owner cria convite → e-mail com link → novo membro define senha + **ativa MFA** → entra com papel atribuído. Todas as ações ficam no `audit_log`.

---

## 6. Segurança (proteção contra invasões)

**Acesso a dados (o mais importante):**
- **RLS habilitado em todas as tabelas**, política "deny by default"; liberar apenas leitura pública do conteúdo publicado.
- **Nunca expor a `service_role key`** no frontend. No browser só a **anon key** (limitada por RLS). `service_role` só em Edge Functions / servidor.
- Escritas sensíveis (leads, vouchers, fidelidade) **somente via Edge Function** validada — não permitir `insert` anônimo direto.
- Campos de auditoria/atribuição (`redeemed_by`, `recorded_by`, `actor_id` etc.) são **sempre preenchidos pelo servidor a partir da sessão autenticada** — nunca aceitos como valor vindo do payload do client. Um payload que tentar informar esses campos deve ser ignorado silenciosamente ou rejeitado.
- Regras de negócio com impacto de integridade (bloqueio de exclusão de categoria com itens, foto obrigatória) são reforçadas **no banco** (constraint `ON DELETE RESTRICT`, trigger) além da validação na UI — a UI dá feedback rápido, o banco é quem garante de fato.

**Endpoints públicos (formulário de cadastro e afins):**
- Nenhuma rota de envio de e-mail (ou qualquer ação sensível) deve ser **publicamente alcançável** por si só. O envio de e-mail é uma função interna chamada em processo pela Edge Function que já validou a submissão — nunca um endpoint HTTP separado que aceite `POST` de qualquer origem sem autenticação. (Isso corrigiu uma falha real encontrada em produção: `/api/send-email` funcionava como relay de e-mail aberto, sem autenticação, rate limit ou escaping de HTML nos campos interpolados.)
- **CAPTCHA obrigatório e efetivamente verificado no servidor** — não basta gerar o token no client; o servidor precisa validar `tokenProperties.valid` e um **score mínimo** (0.5) junto ao provedor, e rejeitar a submissão se a validação falhar ou as chaves não estiverem configuradas. (Corrigido: a verificação estava implementada mas comentada/desativada em produção.)
- **Honeypot** — campo oculto no formulário público; preenchido, é sinal de bot. A resposta ao bot deve ser um "sucesso" falso, sem gravar nada, para não sinalizar que a armadilha foi detectada.
- **Rate limiting** por IP (e por e-mail, via constraint de unicidade) em todo endpoint público de escrita e no login. Um limitador simples em memória serve como primeira barreira; para produção multi-instância, migrar para **Upstash Redis** (free tier).
- **Validação de entrada com schema (zod)** em toda rota/Edge Function pública — rejeitar payloads que não batem exatamente com o formato esperado, e nunca confiar em campos "extra" enviados pelo client.
- Todo HTML gerado a partir de dados enviados pelo usuário (nome, telefone etc.) e interpolado em e-mails ou páginas deve ser **escapado** antes da interpolação.

**Aplicação:**
- **Consultas parametrizadas** (cliente Supabase / queries preparadas) → previne **SQL injection**.
- **Sanitização/escape** de conteúdo do CMS para evitar **XSS** (especialmente blocos de corpo e HTML embed de vídeo: usar allowlist de domínios de embed).
- **CORS** restrito ao domínio do site; **CSRF** protegido nas rotas autenticadas.
- **Cabeçalhos de segurança** (via `next.config.ts` → `headers()`, aplicados a todas as rotas): `Content-Security-Policy` (allowlist explícita de domínios usados de fato: reCAPTCHA, Google Fonts, Supabase, Google Maps embed, YouTube nocookie — sem wildcard genérico), `Strict-Transport-Security` (HSTS), `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- **HTTPS** sempre (TLS automático na Vercel).

**Autenticação/admin:**
- Supabase Auth **invite-only** (desabilitar signup público). **MFA/TOTP** para a equipe; senha forte.
- Verificação de papel (`profiles.role`) nas policies e nas rotas do painel.
- O Manager (`/manager/*`) precisa de **middleware de autenticação real** — nos mesmos moldes do que já protege `/admin/*` hoje — antes de ir para produção. O protótipo atual não tem autenticação nenhuma (papel fixo no client, tela de login decorativa); isso é aceitável só enquanto for protótipo mockado.
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
| E-mail do voucher (transacional) | **Brevo** (já integrado) | Free tier (300 e-mails/dia) — suficiente para o volume de um pub |
| Anti-bot no formulário | **Google reCAPTCHA Enterprise** (já integrado) + honeypot | Free tier |
| Rate limiting | Em memória (interino) → **Upstash Redis** (produção multi-instância) | Free tier |
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
- **Brevo:** free tier cobre o volume esperado de um pub (300 e-mails/dia).

**Cenário escolhido (robusto):** **Vercel Pro (~US$20)** + **Supabase Pro (~US$25)** + serviços de apoio em free tier (Brevo, reCAPTCHA, Upstash, Sentry, Cron) → **~US$45/mês**. Custos variáveis adicionais marginais: Google Places (mantido baixo com cache). Este cenário remove a pausa por inatividade do Supabase, garante backups automáticos e mantém a stack pedida (Vercel + Supabase) em conformidade comercial.

---

## 10. Riscos e atenções

- ~~Supabase Free pausa por inatividade~~ → **resolvido** com Supabase Pro (sem pausa, com backups).
- ~~Vercel Hobby é não‑comercial~~ → **resolvido** com Vercel Pro.
- **Instagram exige conta profissional** e tokens com renovação → encapsular em Edge Function + cache.
- **Google Places** pode gerar custo → cachear avaliações (atualizar 1–2×/dia).
- **RGPD** é obrigatório (clientes na UE) → política de privacidade, consentimento e exclusão desde o início.
- **Backups** no free tier são limitados → rotina própria de backup.
- **Migração de dados legados** (`leads` → `customers`+`vouchers`) precisa de ETL cuidadoso — ver seção "Migração dos dados legados" em §2.

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
| 7 | Validade do voucher / fidelidade | **Configuráveis pelo admin** (em `site_settings` e `loyalty_programs`); voucher pode ser **reativado**, sempre lendo a validade configurada |
| 8 | Fidelidade | Modelo de **cartela de selos** por item; **1 programa por cliente**; programas e itens de consumo **configuráveis**; selos com histórico (operador + data/hora) |
| 9 | Cardápio | **Categorias e tags gerenciáveis**; categoria com `with_photo` (produtos em cards) e **ordem** reordenável; item com destaque `is_new` e campos PT/EN (nome, descrição, unidade) |
| 10 | Ações destrutivas | Sempre exigem **confirmação** no painel |
| 11 | Migração de dados legados | ETL de `leads` → `customers`+`vouchers` na virada para o backend novo (não é troca simples de credenciais) |
| 12 | Exclusão de categoria do cardápio | **Bloqueada** quando há itens vinculados, com mensagem de erro na UI e `ON DELETE RESTRICT` no banco |
| 13 | Troca de programa de fidelidade | **Preserva o histórico completo** — cartelas/selos do programa anterior nunca são apagados |
| 14 | Programa de fidelidade inativado | Equipe **continua podendo marcar selos** para clientes já atribuídos; a UI mostra alerta com a data de encerramento |
| 15 | Data das novidades | **Um único campo** (`published_at`) — sem distinção entre data de publicação e data de evento |
| 16 | Foto obrigatória no cardápio | **Bloqueia o salvamento** com alerta quando a categoria exige foto e ela está ausente (client + servidor) |
| 17 | Validação de voucher | UI exibe **quem validou e quando** (`redeemed_by` + `redeemed_at`) |
| 18 | Configurações do site | Inclui `google_place_id`, necessário para a integração de avaliações do Google |
| 19 | Segurança do formulário público | CAPTCHA verificado no servidor (score ≥ 0.5), honeypot, rate limit, validação zod e nenhum endpoint de e-mail publicamente alcançável — já corrigido no código atual (ver §6) |

### Próximos passos
1. ~~Transformar o rascunho na versão final da spec~~ — **feito neste documento**.
2. Gerar o **script SQL completo** de criação do schema + policies RLS + triggers (migração inicial Supabase), incluindo o script de **ETL dos dados legados**.
3. Definir as **Edge Functions** (contratos de entrada/saída): `submit-lead`, `redeem-voucher`, `refresh-instagram`, `refresh-google-reviews`, `invite-admin`.
4. Mapear as **telas do painel** (CRM/Manager) a partir destas tabelas e papéis, incluindo a troca do protótipo mockado por autenticação real (Supabase Auth + middleware em `/manager/*`).

---

### Fontes (dados de free tier / APIs verificados em jun/2026)
- Instagram Basic Display — descontinuação: https://developers.facebook.com/blog/post/2024/09/04/update-on-instagram-basic-display-api/
- Supabase — preços e limites: https://supabase.com/pricing
- Vercel — plano Hobby (uso não-comercial): https://vercel.com/docs/plans/hobby
- Brevo — preços/free tier: https://www.brevo.com/pricing/
