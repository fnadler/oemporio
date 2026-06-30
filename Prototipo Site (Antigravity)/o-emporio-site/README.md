# O Empório — Protótipo do Site (export para conversão)

Protótipo estático de alta fidelidade do site do **O Empório — Comfort Food & Craft Beer** (Ericeira, PT).
Feito em **HTML + CSS + JavaScript puro** (sem build/bundler), com arquivos separados e imagens/fontes como
ficheiros reais — pronto para ser convertido na stack técnica final (ex.: React/Next, Vue/Nuxt, Astro, etc.)
no Google Antigravity.

## Como abrir
Abra `index.html` no navegador. Para garantir caminhos/fontes corretos, o ideal é servir a pasta:
```
python3 -m http.server 8080      # depois abra http://localhost:8080
```
Não há etapa de build nem dependências externas (apenas Google Fonts via `<link>`).

## Estrutura
```
o-emporio-site/
├── index.html          # Home
├── cardapio.html       # Cardápio (Taps, Cervejas↗, Comidas, Vinhos, Bebidas)
├── novidades.html      # Novidades (lista + detalhe, busca, paginação)
├── css/
│   └── styles.css      # Todos os estilos + @font-face (Bourton)
├── js/
│   ├── main.js         # Idioma (PT/EN) + modal de cadastro (cupão 20%)
│   ├── cardapio.js     # Navegação por âncoras + scrollspy (categorias)
│   └── novidades.js    # Listagem, busca, paginação e detalhe (CMS-driven)
├── fonts/
│   ├── BourtonDropShadow.ttf   # display / títulos grandes
│   └── BourtonBaseDrop.ttf     # títulos curtos, labels, botões
├── assets/img/         # Fotos do pub, logo (PNG branco) e símbolo "O" (SVG)
└── data/
    └── novidades.json  # Modelo de dados das novidades (referência p/ CMS)
```

## Sistema de design (tokens)
- **Cores:** identidade monocromática — escala de cinzas quentes do charcoal `#221E1F` ao papel `#F7F4EF`
  (variáveis `--g-950 … --g-0`, `--bg`, `--ink`, `--muted`, `--border`…). Acentos quentes (coral/tijolo)
  existem na paleta mas **não são usados na interface** (apenas tons de cinza).
- **Tipografia:** `BourtonDropShadow` (display) + `BourtonBaseDrop` (títulos curtos/labels/botões),
  `Work Sans` (corpo/parágrafos), `Oswald` (fallback de título e textos acentuados, pois a Bourton
  não tem acentuação completa), `JetBrains Mono` (metadados).
- **Cantos:** `border-radius: 0` em tudo (identidade angular).

## Páginas e componentes
- **Nav-bar** (desktop): logo (lockup oficial) + links com item ativo destacado por página.
- **Bottom nav** (mobile/tablet ≤1024px): barra fixa com Início, Cardápio, Novidades, Visite-nos e **Cupão (20% OFF)**.
- **Hero**: foto de fundo (Home) / fundo escuro com marca-d'água do símbolo "O" (Cardápio).
- **Cards "máscara"**: o padrão visual da marca (moldura + rótulo de categoria + título Bourton + scrim),
  usado em Comidas e nos cards de Novidades.
- **Modal de cadastro (cupão 20%)**: aberto por qualquer CTA "20% OFF". Campos: primeiro nome, sobrenome,
  telefone (DDI com bandeira + número), e-mail, idioma, onde nasceu (países), vive em Portugal?,
  **distrito** (condicional, só se "Sim"), checkbox do cupão (obrigatório) e de marketing (opcional).

## Modelo de dados (CMS)
### Novidades — `data/novidades.json` (e array `POSTS` em `js/novidades.js`)
Cada post:
| campo | tipo | uso |
|---|---|---|
| `slug` | texto | id da rota (`#/slug`) |
| `eyebrow` | texto | sobre-título |
| `cat` | texto | rótulo de categoria (badge) |
| `titulo` | texto | título principal |
| `sub` | texto | subheadline / lede |
| `data` | ISO date | data (lista mostra dia/mês; detalhe por extenso) |
| `foto` | chave de imagem ou `null` | se `null`, o card usa um tom de cinza |
| `corpo` | lista | blocos do conteúdo: `"parágrafo"`, `"## subtítulo"`, `{ "video": "<youtube-id>" }`, `{ "gallery": ["chaveImg", …] }` |

A listagem tem **busca por palavra-chave** e **paginação** (6/página). O **detalhe** abre por rota hash,
com partilha (copiar link, WhatsApp, Facebook, X, e-mail), galeria (lightbox) e "Mais novidades".

### Cardápio — `cardapio.html`
- Categorias na ordem: **Taps · Cervejas↗ · Comidas · Vinhos · Bebidas** (navegação âncora sticky com scrollspy).
- **Taps / Vinhos / Bebidas**: formato de **lista** (nome, tags, meta, preço; estado "Esgotada" possível).
- **Comidas**: **cards com foto** (nome, descritivo, preço, rótulo).
- **Cervejas**: NÃO é uma seção — é um **link externo** para a carta online (lista sempre dinâmica),
  reforçado pelo bloco de destaque com a foto do freezer.

## A configurar na conversão (placeholders)
- **Carta de cervejas online**: o link `https://oemporio.pt/cervejas` é **placeholder** — substituir pela URL real
  (aparece no chip "Cervejas ↗" e no botão do destaque, em `cardapio.html`).
- **Feed do Instagram** (Home) e **mapa do Google** (Visite-nos): hoje são representações estáticas; integrar APIs reais.
- **Formulário do cupão**: hoje só valida no cliente e mostra confirmação demo — ligar a endpoint/CRM
  (controle do voucher 20% e do cartão fidelidade, conforme escopo do projeto).
- **Bilíngue PT/EN**: o seletor de idioma é visual; implementar i18n na conversão.

## Notas
- **Fontes Bourton**: são as fontes da marca (uso de logo/identidade). Incluídas para o protótipo —
  confirmar licenciamento para produção.
- **Imagens**: fotos reais do pub fornecidas pela marca; logo em PNG branco e símbolo "O" em **SVG** (vetorial).
