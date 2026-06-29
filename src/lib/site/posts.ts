/**
 * Novidades (CMS) — dados e helpers da v2.
 *
 * Portado de Prototipo Site (Antigravity)/o-emporio-site/js/novidades.js + data/novidades.json.
 * Futuramente isto será alimentado por um CMS/back-end (ver item 3).
 */

export type PostBody = string | { video: string } | { gallery: string[] }

export interface Post {
  slug: string
  eyebrow: string
  cat: string
  titulo: string
  sub: string
  /** ISO date (YYYY-MM-DD) */
  data: string
  /** chave do mapa de imagens, ou null (usa fundo cinza) */
  foto: string | null
  /** classe extra do rótulo de categoria (ex.: 'coral') */
  rot?: string
  /** tom de cinza do card quando não há foto ('g1' | 'g2' | 'g3') */
  tone?: string
  corpo: PostBody[]
}

/** Mapa de chaves de imagem → caminho público (/v2/img). */
export const IMG: Record<string, string> = {
  lockup_neg: '/v2/img/logo-oemporio-branco.png',
  symbol_o: '/v2/img/simbolo-o-branco.svg',
  hero_photo: '/v2/img/ambiente-fachada-poente.jpg',
  amb_balcao_tap: '/v2/img/ambiente-balcao-tap.jpg',
  amb_balcao_view: '/v2/img/ambiente-balcao-torneiras.jpg',
  amb_outsite_noite: '/v2/img/ambiente-fachada-noite.jpg',
  amb_freezer: '/v2/img/cervejas-freezer.jpg',
  food_burger: '/v2/img/comida-burger-beef.jpg',
  food_costela: '/v2/img/comida-costela-na-cerveja.jpg',
  food_kafta: '/v2/img/comida-kafta.jpg',
  food_provoleta: '/v2/img/comida-provoleta.jpg',
  food_porquinhos: '/v2/img/comida-3-porquinhos.jpg',
  food_peru: '/v2/img/comida-peru-panado.jpg',
}

/** Resolve uma chave de imagem para o caminho público (ou null). */
export function img(key: string | null | undefined): string | null {
  return key ? IMG[key] ?? null : null
}

export const POSTS: Post[] = [
  {
    slug: 'cervejaria-do-mes-dois-corvos',
    eyebrow: 'Cervejaria do mês',
    cat: 'Mostra de cerveja',
    titulo: 'Dois Corvos na torneira',
    sub: 'Quatro rótulos exclusivos da cervejaria lisboeta durante todo o mês de outubro.',
    data: '2025-10-02',
    foto: 'amb_balcao_tap',
    corpo: [
      'Em outubro, as nossas torneiras vestem-se de Dois Corvos. Trouxemos quatro rótulos da icónica cervejaria de Marvila, de uma Pale Ale fácil a uma Imperial Stout encorpada.',
      '## O que esperar',
      'Cada cerveja foi escolhida a dedo pela equipa para acompanhar o nosso cardápio de comfort food. Pergunte ao staff pela harmonização recomendada do dia.',
      'A seleção é limitada e roda enquanto durarem os barris — venha cedo para provar todas.',
    ],
  },
  {
    slug: 'novo-burger-beef',
    eyebrow: 'Novo no cardápio',
    cat: 'Cardápio',
    titulo: 'Chegou o Burger BEEF',
    sub: 'Hambúrguer de vaca no pão da casa com a marca “O”, bacon e queijo derretido.',
    data: '2025-09-28',
    foto: 'food_burger',
    corpo: [
      'O nosso novo Burger BEEF chega com um pão assinado: estampado com o símbolo do O Empório, feito localmente.',
      'Carne de vaca suculenta, bacon estaladiço, queijo derretido e o molho da casa. Acompanha na perfeição uma das nossas craft beers locais.',
    ],
  },
  {
    slug: 'beericeira-2025',
    eyebrow: 'Estamos no',
    cat: 'Evento · Ericeira',
    titulo: 'BEERiceira 2025',
    sub: 'O O Empório marca presença no maior encontro de cerveja artesanal da vila — três dias de torneiras especiais, collabs e muita gente boa.',
    data: '2025-10-05',
    foto: 'amb_outsite_noite',
    rot: 'coral',
    corpo: [
      'O maior festival de cerveja artesanal da Ericeira está de volta — e o O Empório não podia ficar de fora. Durante três dias, a vila enche-se de cervejeiros, música de rua e o melhor que a cena craft portuguesa tem para oferecer.',
      'Este ano preparámos algo especial: uma collab exclusiva criada a quatro mãos com uma cervejaria parceira, disponível apenas durante o festival e, enquanto durar, nas nossas torneiras.',
      '## A nossa collab exclusiva',
      'Uma cerveja pensada para a Ericeira: leve, cítrica e com um toque salino que lembra o mar. Foi desenhada para acompanhar o nosso comfort food e para se beber à mesa, sem pressa, entre amigos.',
      'Veja como foi a edição do ano passado:',
      { video: 'aqz-KE-bpKQ' },
      '## O ambiente do festival',
      'Da fachada à noite ao balcão a postos, é assim que vivemos o BEERiceira. Um registo dos momentos que tornam estes dias únicos.',
      {
        gallery: [
          'amb_outsite_noite',
          'amb_balcao_tap',
          'amb_balcao_view',
          'food_costela',
          'food_burger',
          'food_kafta',
        ],
      },
      '## Onde nos encontrar',
      'Estaremos com um espaço próprio durante todo o evento, além das torneiras especiais aqui no pub. Siga o nosso Instagram para o mapa, os horários e a programação completa — e venha brindar connosco.',
    ],
  },
  {
    slug: 'workshop-prova-as-cegas',
    eyebrow: 'Workshop cervejeiro',
    cat: 'Workshop',
    titulo: 'Prova às cegas de IPAs',
    sub: 'Uma noite para treinar o paladar e descobrir o que distingue cada estilo de IPA.',
    data: '2025-09-21',
    foto: null,
    tone: 'g2',
    corpo: [
      'Conduzido pela nossa equipa, este workshop leva-o por uma viagem às cegas pelo universo das IPAs — da West Coast à Hazy.',
      'Vagas limitadas. Inclui provas, fichas de degustação e um petisco para acompanhar.',
    ],
  },
  {
    slug: 'costela-na-cerveja',
    eyebrow: 'Novo no cardápio',
    cat: 'Cardápio',
    titulo: 'Costela na Cerveja',
    sub: 'Costela desfiada, cozida lentamente na nossa cerveja, servida com pão.',
    data: '2025-09-15',
    foto: 'food_costela',
    corpo: [
      'Horas de cozedura lenta na nossa cerveja para uma costela que se desfaz ao toque do garfo.',
      'Servida com pão fresco para não desperdiçar nem uma gota do molho. Um clássico de conforto da casa.',
    ],
  },
  {
    slug: 'horario-feriado-outubro',
    eyebrow: 'Comunicado',
    cat: 'Comunicado',
    titulo: 'Horário especial de feriado',
    sub: 'Confira os nossos horários durante a semana do feriado.',
    data: '2025-10-04',
    foto: null,
    tone: 'g3',
    corpo: [
      'Durante a semana do feriado, ajustamos o nosso horário para receber melhor quem nos visita.',
      '## Funcionamento',
      'Abrimos mais cedo nos dias de maior movimento. Recomendamos reserva para grupos. Qualquer dúvida, fale connosco pelo Instagram.',
    ],
  },
  {
    slug: 'wine-tasting-ribeirinha',
    eyebrow: 'Evento',
    cat: 'Evento',
    titulo: 'Wine Tasting: Quinta da Ribeirinha',
    sub: 'Uma noite dedicada aos vinhos da região, para variar do lúpulo.',
    data: '2025-11-08',
    foto: 'amb_balcao_view',
    corpo: [
      'Nem só de cerveja vive o O Empório. Recebemos a Quinta da Ribeirinha para uma prova guiada de vinhos da região.',
      'Lugares limitados, com harmonização de petiscos incluída.',
    ],
  },
  {
    slug: 'tap-takeover-fermentage',
    eyebrow: 'Tap takeover',
    cat: 'Mostra de cerveja',
    titulo: 'Fermentage assume as torneiras',
    sub: 'Por uma noite, a cervejaria do Porto toma conta de todas as torneiras da casa.',
    data: '2025-09-12',
    foto: null,
    tone: 'g1',
    corpo: [
      'Um tap takeover completo: todas as torneiras dedicadas à Fermentage por uma só noite.',
      'Da Sea Salt Gose a edições especiais, é a oportunidade de provar a cervejaria em profundidade.',
    ],
  },
  {
    slug: 'kafta-no-menu',
    eyebrow: 'Novo no cardápio',
    cat: 'Cardápio',
    titulo: 'Kafta do Empório',
    sub: 'Espetadas de kafta grelhada sobre rúcula, com queijo fresco.',
    data: '2025-08-30',
    foto: 'food_kafta',
    corpo: [
      'Tempero da casa, grelha no ponto e uma cama de rúcula fresca com queijo. O nosso novo petisco para partilhar.',
      'Pede uma cerveja local e está feito o par perfeito.',
    ],
  },
  {
    slug: 'aniversario-o-emporio',
    eyebrow: 'Festa',
    cat: 'Evento',
    titulo: '1 ano de O Empório',
    sub: 'Celebramos o nosso primeiro aniversário com uma noite especial. Venha brindar connosco.',
    data: '2025-11-22',
    foto: null,
    tone: 'g2',
    rot: 'coral',
    corpo: [
      'Um ano a juntar gente boa à volta de boa cerveja. Para celebrar, preparámos uma noite especial com surpresas na torneira e na cozinha.',
      '## Como participar',
      'Entrada livre. Siga o nosso Instagram para os detalhes da programação e das edições comemorativas.',
    ],
  },
]

const MES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
const MESL = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

/** Parse de YYYY-MM-DD sem fuso horário (evita off-by-one). */
function parts(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split('-').map(Number)
  return { y, m: (m || 1) - 1, d: d || 1 }
}

/** Chip de data: "OUT" + dia. */
export function dateChip(iso: string): { mes: string; dia: number } {
  const { m, d } = parts(iso)
  return { mes: MES[m], dia: d }
}

/** Data por extenso: "2 de outubro de 2025". */
export function dateFull(iso: string): string {
  const { y, m, d } = parts(iso)
  return `${d} de ${MESL[m]} de ${y}`
}

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug)
}

/** Tom de fundo do card quando não há foto. */
export function cardTone(p: Post, i: number): string {
  return p.foto ? '' : p.tone || ['g1', 'g2', 'g3'][i % 3]
}
