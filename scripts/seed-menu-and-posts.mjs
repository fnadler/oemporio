#!/usr/bin/env node
/**
 * Semente inicial de Cardápio e Novidades: migra o conteúdo hoje fixo em
 * `src/app/(site)/cardapio/page.tsx` e `src/lib/site/posts.ts` para o
 * Supabase (menu_categories/menu_items/menu_tags e post_categories/posts),
 * para o site público sair de dados estáticos sem ficar vazio.
 *
 * Idempotente por chave natural (nome da categoria/tag/item, slug do post)
 * — pula o que já existir no destino, então pode rodar de novo sem duplicar.
 *
 * Uso:
 *   node scripts/seed-menu-and-posts.mjs                # dry-run
 *   node scripts/seed-menu-and-posts.mjs --apply         # aplica em staging
 *   node scripts/seed-menu-and-posts.mjs --apply --target=prod
 */
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const target = (args.find((a) => a.startsWith('--target='))?.split('=')[1]) ?? 'staging'

function parseEnvFile(path) {
  const out = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
  return out
}
const env = parseEnvFile(target === 'prod' ? '.env' : '.env.staging')
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

console.log(`Modo: ${apply ? 'APLICAR' : 'DRY-RUN'} · destino: ${target}\n`)

const IMG = {
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

/* ===================== Cardápio ===================== */

const CATEGORIES = [
  { key: 'taps', slug: 'taps', name_pt: 'Taps', name_en: 'Taps', text_pt: 'Rotativas, sempre frescas.', text_en: 'Rotating, always fresh.', with_photo: false, sort_order: 0 },
  { key: 'comidas', slug: 'comidas', name_pt: 'Comidas', name_en: 'Food', text_pt: 'Comfort food para dividir.', text_en: 'Comfort food to share.', with_photo: true, sort_order: 1 },
  { key: 'vinhos', slug: 'vinhos', name_pt: 'Vinhos', name_en: 'Wines', text_pt: 'Uma curadoria de vinhos portugueses.', text_en: 'A curation of Portuguese wines.', with_photo: false, sort_order: 2 },
  { key: 'bebidas', slug: 'bebidas', name_pt: 'Bebidas', name_en: 'Drinks', text_pt: 'Sem álcool, cafés e destilados.', text_en: 'Non-alcoholic, coffee and spirits.', with_photo: false, sort_order: 3 },
]

const TAGS = [
  { key: 'local', label_pt: 'Local', label_en: 'Local', variant: 'local' },
  { key: 'ontap', label_pt: 'On Tap', label_en: 'On Tap', variant: 'tap' },
  { key: 'novidade', label_pt: 'Novidade', label_en: 'New', variant: 'new' },
  { key: 'convidada', label_pt: 'Convidada', label_en: 'Guest', variant: 'guest' },
  { key: 'branco', label_pt: 'Branco', label_en: 'White', variant: 'local' },
  { key: 'tinto', label_pt: 'Tinto', label_en: 'Red', variant: 'local' },
  { key: 'rose', label_pt: 'Rosé', label_en: 'Rosé', variant: 'local' },
  { key: 'sem_alcool', label_pt: 'Sem álcool', label_en: 'Alcohol-free', variant: 'local' },
  { key: 'destilado', label_pt: 'Destilado', label_en: 'Spirits', variant: 'local' },
  { key: 'premium', label_pt: 'Premium', label_en: 'Premium', variant: 'guest' },
]

const ITEMS = [
  // Taps
  { cat: 'taps', name_pt: 'Finisterra · West Coast IPA', price: 6.5, price_unit: '/ 40cl', meta: 'DOIS CORVOS · LISBOA — 6,2% ABV · 55 IBU', description_pt: 'Amarga na medida, com cítricos do lúpulo americano e final seco. A queridinha da casa neste mês.', tags: [], is_featured: true },
  { cat: 'taps', name_pt: 'Pale Ale da Casa', price: 4.5, price_unit: '/ 33cl', meta: 'LETRA · VILA VERDE — 5,0% ABV · 30 IBU', description_pt: 'Leve, floral e fácil de beber. O ponto de partida perfeito.', tags: ['local', 'ontap'] },
  { cat: 'taps', name_pt: 'Sea Salt Gose', price: 5.0, price_unit: '/ 33cl', meta: 'FERMENTAGE · PORTO — 4,3% ABV · 12 IBU', description_pt: 'Cítrica e levemente salgada, inspirada nas ondas da Ericeira.', tags: ['novidade', 'local'], is_new: true },
  { cat: 'taps', name_pt: 'Imperial Stout Barrel-Aged', price: 7.5, price_unit: '/ 25cl', meta: 'VISTA · ERICEIRA — 9,5% ABV · 60 IBU', description_pt: 'Encorpada, com chocolate, café e um toque de madeira. Para saborear devagar.', tags: ['convidada'] },
  { cat: 'taps', name_pt: 'Hazy NEIPA Tropical', price: 6.0, price_unit: '/ 33cl', meta: 'EQUILIBREW · SINTRA — 6,5% ABV · 40 IBU', description_pt: 'Turva e suculenta, explosão de manga e maracujá. Volta em breve!', tags: [], sold_out: true },
  { cat: 'taps', name_pt: 'Lager Pilsner Clássica', price: 4.0, price_unit: '/ 33cl', meta: 'LOCALS ONLY · ERICEIRA — 4,8% ABV · 25 IBU', description_pt: 'Crocante, dourada e refrescante. A cerveja de todos os dias.', tags: ['local'] },
  // Comidas
  { cat: 'comidas', name_pt: 'Burger BEEF', price: 13.5, price_unit: '', description_pt: 'Hambúrguer de vaca no pão da casa com a marca "O", bacon e queijo derretido.', tags: [], is_new: true, photo: '/v2/img/comida-burger-beef.jpg' },
  { cat: 'comidas', name_pt: 'Costela na Cerveja', price: 13.0, price_unit: '', description_pt: 'Costela desfiada, cozida lentamente na nossa cerveja, servida com pão.', tags: [], photo: '/v2/img/comida-costela-na-cerveja.jpg' },
  { cat: 'comidas', name_pt: 'Kafta do Empório', price: 11.0, price_unit: '', description_pt: 'Espetadas de kafta grelhada sobre rúcula, com queijo fresco.', tags: [], photo: '/v2/img/comida-kafta.jpg' },
  { cat: 'comidas', name_pt: 'Provoleta', price: 9.0, price_unit: '', description_pt: 'Provolone gratinado com tomate confitado e orégãos. Para partilhar.', tags: [], photo: '/v2/img/comida-provoleta.jpg' },
  { cat: 'comidas', name_pt: '3 Porquinhos', price: 8.5, price_unit: '', description_pt: 'Almôndegas de porco mal-passado com cebola roxa em pickles.', tags: [], is_new: true, photo: '/v2/img/comida-3-porquinhos.jpg' },
  { cat: 'comidas', name_pt: 'Peru Panado', price: 9.5, price_unit: '', description_pt: 'Tiras de peru panadas e crocantes, com maionese de ervas da casa.', tags: [], photo: '/v2/img/comida-peru-panado.jpg' },
  // Vinhos
  { cat: 'vinhos', name_pt: 'Vinho Verde da Casa', price: 4.0, price_unit: 'copo · €16 garrafa', meta: 'LOUREIRO · MINHO — fresco & cítrico', description_pt: 'Leve e ligeiramente petillant. Perfeito para começar a noite.', tags: ['branco'] },
  { cat: 'vinhos', name_pt: 'Tinto Alentejo', price: 4.5, price_unit: 'copo · €19 garrafa', meta: 'ARAGONEZ · TRINCADEIRA — encorpado', description_pt: 'Frutado e redondo, com taninos macios. Vai bem com a costela.', tags: ['tinto'] },
  { cat: 'vinhos', name_pt: 'Rosé da Ribeirinha', price: 4.5, price_unit: 'copo · €18 garrafa', meta: 'QUINTA DA RIBEIRINHA · LISBOA', description_pt: 'Seco, fresco e aromático. O favorito do fim de tarde.', tags: ['rose'] },
  { cat: 'vinhos', name_pt: 'Branco Douro', price: 5.0, price_unit: 'copo · €22 garrafa', meta: 'RABIGATO · VIOSINHO — mineral', description_pt: 'Estruturado e elegante, com final longo.', tags: ['branco'] },
  // Bebidas
  { cat: 'bebidas', name_pt: 'Águas & Refrigerantes', price: 2.0, price_unit: 'a partir de', meta: 'ÁGUA · COLA · LIMONADA DA CASA', description_pt: 'Limonada caseira com hortelã e gengibre.', tags: ['sem_alcool'] },
  { cat: 'bebidas', name_pt: 'Kombucha Artesanal', price: 4.0, price_unit: '/ 33cl', meta: 'FERMENTADO LOCAL — gengibre & limão', description_pt: 'Refrescante e probiótica, opção leve sem álcool.', tags: ['novidade'], is_new: true },
  { cat: 'bebidas', name_pt: 'Café & Espresso', price: 1.5, price_unit: 'a partir de', meta: 'TORRA DE ESPECIALIDADE', description_pt: 'Espresso, duplo ou abatanado para fechar a refeição.', tags: [] },
  { cat: 'bebidas', name_pt: 'Gin Tónico', price: 7.0, price_unit: 'a partir de', meta: 'GINS PREMIUM — perguntar ao staff', description_pt: 'Seleção de gins com tónicas e botânicos.', tags: ['destilado'] },
  { cat: 'bebidas', name_pt: 'Whisky & Destilados', price: 6.0, price_unit: 'a partir de', meta: 'SINGLE MALT · RUM · CONHAQUE', description_pt: 'Para saborear devagar, ao balcão.', tags: ['premium'] },
]

/* ===================== Novidades ===================== */

const POST_CATEGORIES = [
  { key: 'Mostra de cerveja', label_pt: 'Mostra de cerveja', label_en: 'Beer showcase' },
  { key: 'Evento · Ericeira', label_pt: 'Evento · Ericeira', label_en: 'Event · Ericeira' },
  { key: 'Workshop', label_pt: 'Workshop', label_en: 'Workshop' },
  { key: 'Cardápio', label_pt: 'Cardápio', label_en: 'Menu' },
  { key: 'Comunicado', label_pt: 'Comunicado', label_en: 'Notice' },
  { key: 'Evento', label_pt: 'Evento', label_en: 'Event' },
]

function block(text) {
  return text.startsWith('## ')
    ? { type: 'heading', text_pt: text.slice(3), text_en: '' }
    : { type: 'paragraph', text_pt: text, text_en: '' }
}

const POSTS = [
  { slug: 'cervejaria-do-mes-dois-corvos', status: 'published', date: '2025-10-02', cover: IMG.amb_balcao_tap, eyebrow_pt: 'Cervejaria do mês', cat: 'Mostra de cerveja', title_pt: 'Dois Corvos na torneira', subtitle_pt: 'Quatro rótulos exclusivos da cervejaria lisboeta durante todo o mês de outubro.', body: [
    'Em outubro, as nossas torneiras vestem-se de Dois Corvos. Trouxemos quatro rótulos da icónica cervejaria de Marvila, de uma Pale Ale fácil a uma Imperial Stout encorpada.',
    '## O que esperar',
    'Cada cerveja foi escolhida a dedo pela equipa para acompanhar o nosso cardápio de comfort food. Pergunte ao staff pela harmonização recomendada do dia.',
    'A seleção é limitada e roda enquanto durarem os barris — venha cedo para provar todas.',
  ].map(block) },
  { slug: 'novo-burger-beef', status: 'published', date: '2025-09-28', cover: IMG.food_burger, eyebrow_pt: 'Novo no cardápio', cat: 'Cardápio', title_pt: 'Chegou o Burger BEEF', subtitle_pt: 'Hambúrguer de vaca no pão da casa com a marca "O", bacon e queijo derretido.', body: [
    'O nosso novo Burger BEEF chega com um pão assinado: estampado com o símbolo do O Empório, feito localmente.',
    'Carne de vaca suculenta, bacon estaladiço, queijo derretido e o molho da casa. Acompanha na perfeição uma das nossas craft beers locais.',
  ].map(block) },
  { slug: 'beericeira-2025', status: 'published', date: '2025-10-05', cover: IMG.amb_outsite_noite, eyebrow_pt: 'Estamos no', cat: 'Evento · Ericeira', title_pt: 'BEERiceira 2025', subtitle_pt: 'O maior encontro de cerveja artesanal da vila — três dias de torneiras especiais, collabs e muita gente boa.', body: [
    'O maior festival de cerveja artesanal da Ericeira está de volta — e o O Empório não podia ficar de fora.',
    '## A nossa collab exclusiva',
    'Uma cerveja pensada para a Ericeira: leve, cítrica e com um toque salino que lembra o mar.',
    { type: 'video', youtube: 'aqz-KE-bpKQ' },
    '## O ambiente do festival',
    'Da fachada à noite ao balcão a postos, é assim que vivemos o BEERiceira.',
    { type: 'gallery', images: [IMG.amb_outsite_noite, IMG.amb_balcao_tap, IMG.amb_balcao_view, IMG.food_costela, IMG.food_burger, IMG.food_kafta] },
    '## Onde nos encontrar',
    'Estaremos com um espaço próprio durante todo o evento. Siga o nosso Instagram para o mapa e a programação completa.',
  ].map((b) => (typeof b === 'string' ? block(b) : b)) },
  { slug: 'workshop-prova-as-cegas', status: 'draft', date: '2025-09-21', eyebrow_pt: 'Workshop cervejeiro', cat: 'Workshop', title_pt: 'Prova às cegas de IPAs', subtitle_pt: 'Uma noite para treinar o paladar e descobrir o que distingue cada estilo de IPA.', body: [
    'Conduzido pela nossa equipa, este workshop leva-o por uma viagem às cegas pelo universo das IPAs.',
    'Vagas limitadas. Inclui provas, fichas de degustação e um petisco para acompanhar.',
  ].map(block) },
  { slug: 'costela-na-cerveja', status: 'published', date: '2025-09-15', cover: IMG.food_costela, eyebrow_pt: 'Novo no cardápio', cat: 'Cardápio', title_pt: 'Costela na Cerveja', subtitle_pt: 'Costela desfiada, cozida lentamente na nossa cerveja, servida com pão.', body: [
    'Horas de cozedura lenta na nossa cerveja para uma costela que se desfaz ao toque do garfo.',
    'Servida com pão fresco para não desperdiçar nem uma gota do molho.',
  ].map(block) },
  { slug: 'horario-feriado-outubro', status: 'draft', date: '2025-10-04', eyebrow_pt: 'Comunicado', cat: 'Comunicado', title_pt: 'Horário especial de feriado', subtitle_pt: 'Confira os nossos horários durante a semana do feriado.', body: [
    'Durante a semana do feriado, ajustamos o nosso horário para receber melhor quem nos visita.',
    '## Funcionamento',
    'Abrimos mais cedo nos dias de maior movimento. Recomendamos reserva para grupos.',
  ].map(block) },
  { slug: 'wine-tasting-ribeirinha', status: 'published', date: '2025-11-08', cover: IMG.amb_balcao_view, eyebrow_pt: 'Evento', cat: 'Evento', title_pt: 'Wine Tasting: Quinta da Ribeirinha', subtitle_pt: 'Uma noite dedicada aos vinhos da região, para variar do lúpulo.', body: [
    'Nem só de cerveja vive o O Empório. Recebemos a Quinta da Ribeirinha para uma prova guiada de vinhos da região.',
    'Lugares limitados, com harmonização de petiscos incluída.',
  ].map(block) },
  { slug: 'tap-takeover-fermentage', status: 'published', date: '2025-09-12', eyebrow_pt: 'Tap takeover', cat: 'Mostra de cerveja', title_pt: 'Fermentage assume as torneiras', subtitle_pt: 'Por uma noite, a cervejaria do Porto toma conta de todas as torneiras da casa.', body: [
    'Um tap takeover completo: todas as torneiras dedicadas à Fermentage por uma só noite.',
    'Da Sea Salt Gose a edições especiais, é a oportunidade de provar a cervejaria em profundidade.',
  ].map(block) },
  { slug: 'kafta-no-menu', status: 'published', date: '2025-08-30', cover: IMG.food_kafta, eyebrow_pt: 'Novo no cardápio', cat: 'Cardápio', title_pt: 'Kafta do Empório', subtitle_pt: 'Espetadas de kafta grelhada sobre rúcula, com queijo fresco.', body: [
    'Tempero da casa, grelha no ponto e uma cama de rúcula fresca com queijo.',
    'Pede uma cerveja local e está feito o par perfeito.',
  ].map(block) },
  { slug: 'aniversario-o-emporio', status: 'draft', date: '2025-11-22', eyebrow_pt: 'Festa', cat: 'Evento', title_pt: '1 ano de O Empório', subtitle_pt: 'Celebramos o nosso primeiro aniversário com uma noite especial. Venha brindar connosco.', body: [
    'Um ano a juntar gente boa à volta de boa cerveja.',
    '## Como participar',
    'Entrada livre. Siga o nosso Instagram para os detalhes da programação.',
  ].map(block) },
]

/* ===================== Execução ===================== */

async function upsertByName(table, natKeyCol, natKeyVal, payload) {
  const { data: existing } = await db.from(table).select('id').eq(natKeyCol, natKeyVal).maybeSingle()
  if (existing) return { id: existing.id, created: false }
  if (!apply) return { id: '(dry-run)', created: true }
  const { data, error } = await db.from(table).insert(payload).select('id').single()
  if (error) throw new Error(`${table}/${natKeyVal}: ${error.message}`)
  return { id: data.id, created: true }
}

const categoryIds = {}
for (const c of CATEGORIES) {
  const { id, created } = await upsertByName('menu_categories', 'name_pt', c.name_pt, {
    slug: c.slug, name_pt: c.name_pt, name_en: c.name_en, text_pt: c.text_pt, text_en: c.text_en,
    with_photo: c.with_photo, sort_order: c.sort_order, is_active: true,
  })
  categoryIds[c.key] = id
  console.log(`${created ? '+ criada' : '= já existe'} categoria: ${c.name_pt}`)
}

const tagIds = {}
for (const t of TAGS) {
  const { id, created } = await upsertByName('menu_tags', 'label_pt', t.label_pt, {
    label_pt: t.label_pt, label_en: t.label_en, variant: t.variant,
  })
  tagIds[t.key] = id
  console.log(`${created ? '+ criada' : '= já existe'} tag: ${t.label_pt}`)
}

for (const item of ITEMS) {
  const { id, created } = await upsertByName('menu_items', 'name_pt', item.name_pt, {
    category_id: categoryIds[item.cat],
    name_pt: item.name_pt,
    name_en: '',
    description_pt: item.description_pt,
    description_en: '',
    price: item.price,
    price_unit: item.price_unit,
    price_unit_en: '',
    meta: item.meta ?? '',
    is_active: true,
    sold_out: !!item.sold_out,
    is_new: !!item.is_new,
    is_featured: !!item.is_featured,
    photo_path: item.photo ?? null,
  })
  console.log(`${created ? '+ criado' : '= já existe'} item: ${item.name_pt}`)
  if (created && apply && item.tags.length) {
    await db.from('menu_item_tags').insert(item.tags.map((k) => ({ item_id: id, tag_id: tagIds[k] })))
  }
}

const postCategoryIds = {}
for (const c of POST_CATEGORIES) {
  const { id, created } = await upsertByName('post_categories', 'label_pt', c.label_pt, {
    label_pt: c.label_pt, label_en: c.label_en,
  })
  postCategoryIds[c.key] = id
  console.log(`${created ? '+ criada' : '= já existe'} categoria de novidade: ${c.label_pt}`)
}

for (const post of POSTS) {
  const { created } = await upsertByName('posts', 'slug', post.slug, {
    slug: post.slug,
    eyebrow_pt: post.eyebrow_pt,
    eyebrow_en: '',
    category_id: postCategoryIds[post.cat],
    title_pt: post.title_pt,
    title_en: '',
    subtitle_pt: post.subtitle_pt,
    subtitle_en: '',
    cover_path: post.cover ?? null,
    body: post.body,
    status: post.status,
    published_at: post.date,
  })
  console.log(`${created ? '+ criado' : '= já existe'} post: ${post.title_pt}`)
}

console.log(apply ? '\nSemente aplicada.' : '\nDry-run — rode com --apply para gravar de verdade.')
