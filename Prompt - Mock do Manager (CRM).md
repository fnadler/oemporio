# Prompt — Protótipo mockado do Manager (CRM) · O Empório

> Cole este prompt no Google Antigravity (ou em outra ferramenta de geração com Claude) para criar um **protótipo clicável e mockado** do painel administrativo (Manager/CRM) do O Empório, **só para validação visual** — com **dados fictícios em memória, sem backend, sem chamadas de API**.

---

## PROMPT (copiar a partir daqui)

Você é um(a) engenheiro(a) de frontend sênior com forte senso de design. Crie um **protótipo navegável e mockado** do painel administrativo ("Manager / CRM") do **O Empório — Comfort Food & Craft Beer** (um pub em Ericeira, Portugal). O objetivo é **validação visual** do sistema: tudo deve ser **clicável e navegável**, mas com **dados fictícios em memória (mock)**, **sem backend, sem banco, sem autenticação real e sem chamadas de rede**.

### Stack e formato
- **React + Tailwind CSS** (preferencial) num projeto simples, ou HTML/CSS/JS estático se for mais direto. Sem dependências de backend.
- Estado e dados **mockados em arquivos locais** (arrays/JSON em memória). Ações (criar, editar, validar, ativar/inativar) atualizam apenas o estado local e mostram **toasts** de confirmação.
- Navegação entre telas funcionando (router ou troca de views). **Desktop-first** (o Manager é usado no computador), mas que não quebre no tablet.

### Identidade visual (seguir à risca — é o mesmo design system do site)
- **Estética monocromática e angular.** Interface em **tons de cinza quentes**; **border-radius: 0 em tudo** (sem cantos arredondados).
- **Paleta:**
  - Papel/fundo claro: `#F7F4EF`; superfícies/cartões: `#FFFFFF`; fundo sutil: `#EFEAE1`.
  - Tinta/charcoal: `#221E1F`; quase-preto: `#14100F`.
  - Cinzas: `#6A635C` (texto secundário), `#8A8076`/`#9A9087` (terciário), `#CFC6B6` (borda forte), `#E4DED2` (borda).
  - A sidebar pode usar fundo escuro charcoal (`#221E1F`/`#14100F`) com texto claro `#F1ECE4`.
  - **Acentos quentes existem na marca (coral `#CA4F49`, tijolo `#971D20`) mas use com MUITA parcimônia** — de preferência mantenha a interface em cinzas; use cor só para estados de alerta/sucesso se necessário.
  - Estados semânticos discretos: sucesso `#4C7A52`, aviso `#C77A12`, perigo `#971D20`.
- **Tipografia:**
  - Títulos, rótulos, badges, botões e itens de menu: **Bourton** (caixa-alta). Se a fonte Bourton não estiver disponível, use **Oswald** (Google Fonts) como substituta. Mantenha sempre **CAIXA ALTA** nesses elementos.
  - Corpo de texto, tabelas e formulários: **Work Sans** (Google Fonts).
  - Atenção à acentuação do Português de Portugal — se usar a Bourton em palavras acentuadas, garanta que os acentos apareçam (caso a Bourton não tenha acentos, use Oswald nesses textos).
- **Componentes:** retangulares, traços finos (bordas 1–1.5px), tabelas limpas, badges de status como retângulos sólidos ou outline, botões sólidos charcoal para ação primária. Nada de sombras exageradas nem gradientes coloridos.

### Layout geral
- **Sidebar fixa à esquerda** (escura) com o logo "O Empório" no topo e a navegação dos módulos. Indicar o item ativo.
- **Topbar**: nome da página, busca global, seletor de papel (Owner/Staff) só para demonstração, e avatar/usuário fictício ("Vinícius Lobato — Owner").
- **Área de conteúdo** com título da seção, filtros e a lista/forma do módulo.
- **Seletor de idioma de conteúdo PT/EN** onde houver campos bilíngues (abas "PT" e "EN" nos formulários de Novidades e Cardápio).

### Papéis (mostrar a diferença visualmente)
- **Owner**: vê tudo, incluindo Configurações e Gestão de Perfis.
- **Staff**: vê operação (Contatos, Vouchers, Fidelidade, Novidades, Cardápio) mas **Configurações** e **Perfis** aparecem bloqueados/ocultos. Use o seletor de papel da topbar para alternar e demonstrar.

### Módulos / telas (criar todas)

1. **Login** (tela inicial mock): logo, campos e-mail/senha, botão "Entrar", menção a "MFA" (só visual). Botão entra direto no Dashboard.

2. **Dashboard** (visão geral) com cards de métricas (números fictícios): leads no mês, vouchers emitidos vs. utilizados, cervejas registadas (fidelidade), novidades publicadas. Uma lista "Últimos cadastros" e "Próximos eventos da agenda". Tudo mock.

3. **Contatos (Clientes/Leads)**
   - Tabela: Nome, E-mail, Telefone (DDI+número), Idioma, Onde nasceu, Vive em Portugal, Distrito, Consentimento marketing, Data de cadastro, Status do voucher.
   - Filtros (idioma, vive em PT, consentimento) e busca. Clique abre o **detalhe do cliente** (dados + histórico de voucher + cartão fidelidade).
   - ~12–15 registros fictícios realistas (nomes PT/estrangeiros).

4. **Vouchers (Cupão 20%)**
   - Tabela: Código, Cliente, Status (Emitido / Utilizado / Expirado / Cancelado — badges), Emitido em, Expira em, Utilizado em.
   - Ação **"Validar/Utilizar"** (muda status para Utilizado com toast). Filtro por status e busca por código/e-mail.

5. **Cartão Fidelidade**
   - **Configuração do programa (regra configurável):** formulário para definir produto/categoria elegível, **quantidade de pontos** necessária, **benefício** (ex.: "1 cerveja grátis"), ativo/inativo, validade. (Owner edita.)
   - **Registar consumo:** buscar cliente → adicionar selos (qty). Mostrar saldo de selos e, ao atingir a meta, botão **"Resgatar benefício"**.
   - Lista de cartões com saldo/posição (ex.: 7/10).

6. **Novidades (CMS)**
   - Lista de posts: Título, Categoria, Status (Rascunho/Publicado), Data, Idiomas (PT/EN). Ações: Novo, Editar, Publicar/Despublicar.
   - **Editor** com abas **PT / EN**: eyebrow, categoria, título, subheadline, data, imagem de capa (upload mock), e **blocos de corpo** (parágrafo, subtítulo, vídeo embed, galeria) que podem ser adicionados/reordenados. Botão "Traduzir automaticamente para EN" (mock que preenche os campos EN).

7. **Cardápio (CMS)**
   - Abas por categoria: **Taps, Comidas, Vinhos, Bebidas**. (Cervejas é uma carta externa — mostrar apenas um campo de **URL da carta online** em Configurações.)
   - Tabela/cards de itens: Nome (PT/EN), Descrição, Preço, Tags, **Ativo (toggle ativar/inativar)**, **Esgotado**, ordem. Comidas com miniatura de foto. Ações: Novo item, Editar, arrastar para ordenar (pode ser visual).

8. **Configurações do site** (apenas Owner)
   - URL da carta de cervejas online, @ do Instagram, endereço, horários, coordenadas do mapa, **% e validade do voucher de boas-vindas** (configuráveis), textos de consentimento (versão).

9. **Gestão de Perfis** (apenas Owner)
   - Lista de usuários admin: Nome, E-mail, Papel (Owner/Staff), Ativo, Último acesso. Ações: **Convidar** (modal com e-mail + papel), alterar papel, ativar/desativar. Demonstrar a regra "não é possível desativar o último Owner".

### Dados mockados
- Reutilize nomes coerentes com a marca: clientes variados (PT e estrangeiros), vouchers em estados diversos, posts como "Cervejaria do Mês: Dois Corvos", "BEERiceira 2025", "Workshop cervejeiro"; itens de cardápio como "Burger BEEF", "Costela na Cerveja", "Provoleta", "Kafta", "Peru Panado", "3 Porquinhos" (Comidas); taps, vinhos e bebidas de exemplo.
- Preços em **euro (€)**. Datas em formato PT (dd/mm/aaaa).

### Comportamento
- Tudo clicável: navegação, abrir detalhes, abrir modais de criar/editar, alternar toggles, validar voucher, registar selos, convidar perfil — **atualizando o estado local** e mostrando **toasts**.
- Sem persistência real (recarregar volta ao mock inicial) — deixe isso claro com um pequeno aviso "Protótipo · dados fictícios".

### Entregável
Um **protótipo clicável** organizado e bonito, fiel ao design system acima, pronto para apresentação e validação visual com o cliente. Priorize clareza, consistência e a sensação de um produto real.

## (fim do prompt)

---

### Notas para você (Fabiano)
- Este prompt é **só do Manager**; o site público já está prototipado separadamente.
- Se o Antigravity permitir anexar arquivos, anexe também o **design system** (`o-emporio-design-system.html`) e a **Especificação Técnica do Backend** para reforçar tokens e o modelo de dados — o prompt já é autossuficiente, mas os anexos ajudam a aderência.
- Depois da validação visual, o passo seguinte é ligar este Manager às tabelas reais do Supabase (conforme a spec) e às Edge Functions.
