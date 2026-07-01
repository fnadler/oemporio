/**
 * Manager (CRM) — tipos e dados FICTÍCIOS em memória (mock).
 * Sem backend: recarregar a página reseta para este estado inicial.
 * Os nomes de campos seguem o modelo de dados da Especificação Técnica do Backend.
 */

export type Role = 'owner' | 'staff'
export type Lang = 'pt' | 'en'

export interface Customer {
  id: string
  first_name: string
  last_name: string
  phone_dialcode: string
  phone_number: string
  email: string
  language: Lang
  birth_country: string
  lives_in_portugal: 'sim' | 'freq' | 'nao' | 'na'
  district: string
  consent_marketing: boolean
  created_at: string // ISO
}

export type VoucherStatus = 'issued' | 'redeemed' | 'expired' | 'cancelled'

export interface Voucher {
  id: string
  code: string
  customer_id: string
  discount_pct: number
  status: VoucherStatus
  issued_at: string
  expires_at: string
  redeemed_at: string | null
}

/** Item de consumo do programa (ex.: "56", "33", "28" — tamanhos de pint). */
export interface LoyaltyItem {
  id: string
  label: string
}

export interface LoyaltyProgram {
  id: string
  name: string
  is_active: boolean
  points_required: number // selos para destravar o resgate
  items: LoyaltyItem[] // itens de consumo (N)
  activated_at: string // data de ativação
  deactivated_at: string | null // data de inativação
}

/** Registro de um selo: quando e por qual usuário do Manager foi marcado. */
export interface StampLog {
  at: string // ISO datetime
  by: string // usuário do Manager
}

/** Uma cartela (linha) de uma categoria: acumula selos até o resgate. */
export interface CartelaLine {
  id: string
  item_id: string
  stamps: StampLog[]
  redeemed_at: string | null
  redeemed_by: string | null
}

export interface LoyaltyCard {
  id: string
  customer_id: string
  program_id: string
  lines: CartelaLine[]
}

export type PostBlock =
  | { type: 'paragraph'; text_pt: string; text_en: string }
  | { type: 'heading'; text_pt: string; text_en: string }
  | { type: 'video'; youtube: string }
  | { type: 'gallery'; images: string[] }

export interface PostCategory {
  id: string
  label_pt: string
  label_en: string
}

export interface Post {
  id: string
  slug: string
  eyebrow_pt: string
  eyebrow_en: string
  category_id: string
  title_pt: string
  title_en: string
  subtitle_pt: string
  subtitle_en: string
  status: 'draft' | 'published'
  date: string // ISO
  body: PostBlock[]
}

export interface MenuCategory {
  id: string
  label_pt: string
  label_en: string
  text_pt: string // texto/descrição da categoria
  text_en: string
  with_photo: boolean // produtos com foto → apresentados como cards no site
  is_active: boolean
  order: number // ordem de exibição (no site)
}

export interface MenuTag {
  id: string
  label_pt: string
  label_en: string
}

export interface MenuItem {
  id: string
  category_id: string
  name_pt: string
  name_en: string
  description_pt: string
  description_en: string
  price: string
  price_unit: string
  price_unit_en: string
  tag_ids: string[]
  is_active: boolean
  sold_out: boolean
  is_new: boolean // destaque "Novo" no cardápio
  photo?: string
}

export interface Profile {
  id: string
  name: string
  email: string
  role: Role
  is_active: boolean
  last_login_at: string | null
}

export interface DayHours {
  day: string // ex.: "Segunda"
  open: boolean
  hours: string // ex.: "16:00 – 00:00" (só quando aberto)
}

export interface Settings {
  external_beer_menu_url: string
  instagram_handle: string
  phone_dialcode: string
  phone_number: string
  address: string
  hours: DayHours[]
  map_lat: string
  map_lng: string
  welcome_voucher_pct: number
  welcome_voucher_validity_days: number
  consent_version: string
  consent_text: string
}

export interface MockData {
  customers: Customer[]
  vouchers: Voucher[]
  programs: LoyaltyProgram[]
  cards: LoyaltyCard[]
  posts: Post[]
  postCategories: PostCategory[]
  menu: MenuItem[]
  menuCategories: MenuCategory[]
  menuTags: MenuTag[]
  profiles: Profile[]
  settings: Settings
}

export const CURRENT_USER = 'Vinícius Lobato'

const customers: Customer[] = [
  { id: 'c1', first_name: 'Tiago', last_name: 'Marques', phone_dialcode: '+351', phone_number: '912 345 678', email: 'tiago.marques@gmail.com', language: 'pt', birth_country: 'Portugal', lives_in_portugal: 'sim', district: 'Lisboa', consent_marketing: true, created_at: '2026-06-21' },
  { id: 'c2', first_name: 'Sofia', last_name: 'Ribeiro', phone_dialcode: '+351', phone_number: '936 111 222', email: 'sofia.ribeiro@sapo.pt', language: 'pt', birth_country: 'Portugal', lives_in_portugal: 'sim', district: 'Lisboa', consent_marketing: true, created_at: '2026-06-20' },
  { id: 'c3', first_name: 'James', last_name: 'Carter', phone_dialcode: '+44', phone_number: '7700 900123', email: 'j.carter@outlook.com', language: 'en', birth_country: 'Reino Unido', lives_in_portugal: 'freq', district: '', consent_marketing: false, created_at: '2026-06-19' },
  { id: 'c4', first_name: 'Marina', last_name: 'Costa', phone_dialcode: '+55', phone_number: '21 98888 7777', email: 'marina.costa@gmail.com', language: 'pt', birth_country: 'Brasil', lives_in_portugal: 'sim', district: 'Setúbal', consent_marketing: true, created_at: '2026-06-18' },
  { id: 'c5', first_name: 'Lukas', last_name: 'Müller', phone_dialcode: '+49', phone_number: '151 23456789', email: 'lukas.mueller@web.de', language: 'en', birth_country: 'Alemanha', lives_in_portugal: 'nao', district: '', consent_marketing: true, created_at: '2026-06-17' },
  { id: 'c6', first_name: 'Beatriz', last_name: 'Fonseca', phone_dialcode: '+351', phone_number: '961 555 444', email: 'bia.fonseca@gmail.com', language: 'pt', birth_country: 'Portugal', lives_in_portugal: 'sim', district: 'Leiria', consent_marketing: false, created_at: '2026-06-15' },
  { id: 'c7', first_name: 'Camille', last_name: 'Dubois', phone_dialcode: '+33', phone_number: '6 12 34 56 78', email: 'camille.dubois@gmail.com', language: 'en', birth_country: 'França', lives_in_portugal: 'freq', district: '', consent_marketing: true, created_at: '2026-06-14' },
  { id: 'c8', first_name: 'Rui', last_name: 'Almeida', phone_dialcode: '+351', phone_number: '917 222 333', email: 'rui.almeida@sapo.pt', language: 'pt', birth_country: 'Portugal', lives_in_portugal: 'sim', district: 'Porto', consent_marketing: true, created_at: '2026-06-12' },
  { id: 'c9', first_name: 'Ana', last_name: 'Pereira', phone_dialcode: '+351', phone_number: '910 000 111', email: 'ana.pereira@gmail.com', language: 'pt', birth_country: 'Portugal', lives_in_portugal: 'sim', district: 'Lisboa', consent_marketing: false, created_at: '2026-06-10' },
  { id: 'c10', first_name: 'Diego', last_name: 'Fernández', phone_dialcode: '+34', phone_number: '612 345 678', email: 'diego.fdez@gmail.com', language: 'en', birth_country: 'Espanha', lives_in_portugal: 'nao', district: '', consent_marketing: true, created_at: '2026-06-08' },
  { id: 'c11', first_name: 'Helena', last_name: 'Santos', phone_dialcode: '+351', phone_number: '938 444 555', email: 'helena.santos@gmail.com', language: 'pt', birth_country: 'Portugal', lives_in_portugal: 'sim', district: 'Faro', consent_marketing: true, created_at: '2026-06-05' },
  { id: 'c12', first_name: 'Pedro', last_name: 'Oliveira', phone_dialcode: '+351', phone_number: '915 666 777', email: 'pedro.oliveira@sapo.pt', language: 'pt', birth_country: 'Portugal', lives_in_portugal: 'sim', district: 'Lisboa', consent_marketing: true, created_at: '2026-06-02' },
  { id: 'c13', first_name: 'Emma', last_name: 'Johnson', phone_dialcode: '+1', phone_number: '202 555 0142', email: 'emma.j@gmail.com', language: 'en', birth_country: 'Estados Unidos', lives_in_portugal: 'na', district: '', consent_marketing: false, created_at: '2026-05-29' },
]

const vouchers: Voucher[] = [
  { id: 'v1', code: 'EMP-7Q4K', customer_id: 'c1', discount_pct: 20, status: 'issued', issued_at: '2026-06-21', expires_at: '2026-07-21', redeemed_at: null },
  { id: 'v2', code: 'EMP-2M9X', customer_id: 'c2', discount_pct: 20, status: 'redeemed', issued_at: '2026-06-20', expires_at: '2026-07-20', redeemed_at: '2026-06-24' },
  { id: 'v3', code: 'EMP-5T1A', customer_id: 'c3', discount_pct: 20, status: 'issued', issued_at: '2026-06-19', expires_at: '2026-07-19', redeemed_at: null },
  { id: 'v4', code: 'EMP-8B3C', customer_id: 'c4', discount_pct: 20, status: 'redeemed', issued_at: '2026-06-18', expires_at: '2026-07-18', redeemed_at: '2026-06-22' },
  { id: 'v5', code: 'EMP-1F6D', customer_id: 'c5', discount_pct: 20, status: 'expired', issued_at: '2026-05-01', expires_at: '2026-05-31', redeemed_at: null },
  { id: 'v6', code: 'EMP-9H2E', customer_id: 'c6', discount_pct: 20, status: 'cancelled', issued_at: '2026-06-15', expires_at: '2026-07-15', redeemed_at: null },
  { id: 'v7', code: 'EMP-3J8G', customer_id: 'c7', discount_pct: 20, status: 'issued', issued_at: '2026-06-14', expires_at: '2026-07-14', redeemed_at: null },
  { id: 'v8', code: 'EMP-6K4L', customer_id: 'c8', discount_pct: 20, status: 'issued', issued_at: '2026-06-12', expires_at: '2026-07-12', redeemed_at: null },
  { id: 'v9', code: 'EMP-4N7P', customer_id: 'c9', discount_pct: 20, status: 'redeemed', issued_at: '2026-06-10', expires_at: '2026-07-10', redeemed_at: '2026-06-13' },
  { id: 'v10', code: 'EMP-0R5S', customer_id: 'c11', discount_pct: 20, status: 'expired', issued_at: '2026-04-10', expires_at: '2026-05-10', redeemed_at: null },
]

// atalho p/ criar um selo (data/hora + usuário do Manager)
const S = (at: string, by: string = CURRENT_USER): StampLog => ({ at, by })

const cards: LoyaltyCard[] = [
  {
    id: 'l1',
    customer_id: 'c1',
    program_id: 'prog-cerveja',
    lines: [
      // 56: uma cartela já completa+resgatada + a ativa com 2 selos
      {
        id: 'l1-56-0',
        item_id: 'cat56',
        stamps: [S('2026-05-02T18:20'), S('2026-05-09T19:05'), S('2026-05-16T20:10'), S('2026-05-23T18:40'), S('2026-05-30T21:00')],
        redeemed_at: '2026-06-01',
        redeemed_by: CURRENT_USER,
      },
      { id: 'l1-56-1', item_id: 'cat56', stamps: [S('2026-06-10T19:30'), S('2026-06-18T20:00')], redeemed_at: null, redeemed_by: null },
      { id: 'l1-33-0', item_id: 'cat33', stamps: [S('2026-06-12T18:00'), S('2026-06-20T19:15'), S('2026-06-26T20:30')], redeemed_at: null, redeemed_by: null },
      { id: 'l1-28-0', item_id: 'cat28', stamps: [], redeemed_at: null, redeemed_by: null },
    ],
  },
  {
    id: 'l2',
    customer_id: 'c2',
    program_id: 'prog-cerveja',
    lines: [
      // 56: ativa cheia (5/5) — pronta para resgatar
      { id: 'l2-56-0', item_id: 'cat56', stamps: [S('2026-06-02T17:40'), S('2026-06-08T18:10'), S('2026-06-15T19:00'), S('2026-06-22T20:25'), S('2026-06-27T21:10')], redeemed_at: null, redeemed_by: null },
      { id: 'l2-33-0', item_id: 'cat33', stamps: [S('2026-06-21T18:30')], redeemed_at: null, redeemed_by: null },
      { id: 'l2-28-0', item_id: 'cat28', stamps: [], redeemed_at: null, redeemed_by: null },
    ],
  },
  {
    id: 'l3',
    customer_id: 'c4',
    program_id: 'prog-cerveja',
    lines: [
      { id: 'l3-56-0', item_id: 'cat56', stamps: [S('2026-06-18T19:20'), S('2026-06-25T20:05')], redeemed_at: null, redeemed_by: null },
      { id: 'l3-33-0', item_id: 'cat33', stamps: [S('2026-06-24T18:45')], redeemed_at: null, redeemed_by: null },
      { id: 'l3-28-0', item_id: 'cat28', stamps: [], redeemed_at: null, redeemed_by: null },
    ],
  },
  {
    id: 'l4',
    customer_id: 'c8',
    program_id: 'prog-cerveja',
    lines: [
      // cliente fiel: duas cartelas resgatadas no 56 + ativa quase cheia
      { id: 'l4-56-0', item_id: 'cat56', stamps: [S('2026-03-05T18:00'), S('2026-03-12T18:30'), S('2026-03-19T19:00'), S('2026-03-26T20:00'), S('2026-04-02T21:00')], redeemed_at: '2026-04-03', redeemed_by: CURRENT_USER },
      { id: 'l4-56-1', item_id: 'cat56', stamps: [S('2026-04-10T18:10', 'Rita Salgado'), S('2026-04-18T19:20'), S('2026-04-25T20:10'), S('2026-05-02T18:50'), S('2026-05-10T21:30')], redeemed_at: '2026-05-11', redeemed_by: 'Rita Salgado' },
      { id: 'l4-56-2', item_id: 'cat56', stamps: [S('2026-06-05T19:00'), S('2026-06-12T20:00'), S('2026-06-19T18:40'), S('2026-06-26T21:15')], redeemed_at: null, redeemed_by: null },
      { id: 'l4-33-0', item_id: 'cat33', stamps: [S('2026-06-20T18:20'), S('2026-06-27T19:40')], redeemed_at: null, redeemed_by: null },
      { id: 'l4-28-0', item_id: 'cat28', stamps: [S('2026-06-28T20:00')], redeemed_at: null, redeemed_by: null },
    ],
  },
  {
    id: 'l5',
    customer_id: 'c12',
    program_id: 'prog-cerveja',
    lines: [
      { id: 'l5-56-0', item_id: 'cat56', stamps: [S('2026-06-09T18:30'), S('2026-06-16T19:10'), S('2026-06-23T20:20')], redeemed_at: null, redeemed_by: null },
      { id: 'l5-33-0', item_id: 'cat33', stamps: [S('2026-06-14T18:00'), S('2026-06-28T19:30')], redeemed_at: null, redeemed_by: null },
      { id: 'l5-28-0', item_id: 'cat28', stamps: [], redeemed_at: null, redeemed_by: null },
    ],
  },
]

const postCategories: PostCategory[] = [
  { id: 'catnews-mostra', label_pt: 'Mostra de cerveja', label_en: 'Beer showcase' },
  { id: 'catnews-evento', label_pt: 'Evento · Ericeira', label_en: 'Event · Ericeira' },
  { id: 'catnews-workshop', label_pt: 'Workshop', label_en: 'Workshop' },
  { id: 'catnews-cardapio', label_pt: 'Cardápio', label_en: 'Menu' },
  { id: 'catnews-comunicado', label_pt: 'Comunicado', label_en: 'Notice' },
]

const posts: Post[] = [
  {
    id: 'p1', slug: 'cervejaria-do-mes-dois-corvos', status: 'published', date: '2026-06-02',
    eyebrow_pt: 'Cervejaria do mês', eyebrow_en: 'Brewery of the month',
    category_id: 'catnews-mostra',
    title_pt: 'Dois Corvos na torneira', title_en: 'Dois Corvos on tap',
    subtitle_pt: 'Quatro rótulos exclusivos da cervejaria lisboeta durante todo o mês.',
    subtitle_en: 'Four exclusive labels from the Lisbon brewery all month long.',
    body: [
      { type: 'paragraph', text_pt: 'Em junho, as nossas torneiras vestem-se de Dois Corvos.', text_en: 'In June, our taps go full Dois Corvos.' },
      { type: 'heading', text_pt: 'O que esperar', text_en: 'What to expect' },
      { type: 'paragraph', text_pt: 'Cada cerveja foi escolhida a dedo pela equipa.', text_en: 'Each beer was hand-picked by the team.' },
    ],
  },
  {
    id: 'p2', slug: 'beericeira-2026', status: 'published', date: '2026-06-05',
    eyebrow_pt: 'Estamos no', eyebrow_en: 'We are at',
    category_id: 'catnews-evento',
    title_pt: 'BEERiceira 2026', title_en: 'BEERiceira 2026',
    subtitle_pt: 'O maior encontro de cerveja artesanal da vila — três dias de torneiras especiais.',
    subtitle_en: 'The village’s biggest craft beer gathering — three days of special taps.',
    body: [
      { type: 'paragraph', text_pt: 'O maior festival de cerveja artesanal da Ericeira está de volta.', text_en: 'Ericeira’s biggest craft beer festival is back.' },
      { type: 'video', youtube: 'aqz-KE-bpKQ' },
    ],
  },
  {
    id: 'p3', slug: 'workshop-prova-as-cegas', status: 'draft', date: '2026-06-21',
    eyebrow_pt: 'Workshop cervejeiro', eyebrow_en: 'Beer workshop',
    category_id: 'catnews-workshop',
    title_pt: 'Prova às cegas de IPAs', title_en: 'Blind IPA tasting',
    subtitle_pt: 'Uma noite para treinar o paladar e descobrir cada estilo de IPA.',
    subtitle_en: 'A night to train your palate across IPA styles.',
    body: [{ type: 'paragraph', text_pt: 'Conduzido pela nossa equipa.', text_en: 'Hosted by our team.' }],
  },
  {
    id: 'p4', slug: 'novo-burger-beef', status: 'published', date: '2026-05-28',
    eyebrow_pt: 'Novo no cardápio', eyebrow_en: 'New on the menu',
    category_id: 'catnews-cardapio',
    title_pt: 'Chegou o Burger BEEF', title_en: 'The Burger BEEF is here',
    subtitle_pt: 'Hambúrguer de vaca no pão da casa com a marca “O”.', subtitle_en: 'Beef burger on our branded house bun.',
    body: [{ type: 'paragraph', text_pt: 'Pão assinado com o símbolo do O Empório.', text_en: 'Bun branded with the O Empório symbol.' }],
  },
  {
    id: 'p5', slug: 'horario-feriado', status: 'draft', date: '2026-06-18',
    eyebrow_pt: 'Comunicado', eyebrow_en: 'Notice',
    category_id: 'catnews-comunicado',
    title_pt: 'Horário especial de feriado', title_en: 'Special holiday hours',
    subtitle_pt: 'Confira os nossos horários durante a semana do feriado.', subtitle_en: 'Check our hours during holiday week.',
    body: [{ type: 'paragraph', text_pt: 'Ajustamos o horário para receber melhor.', text_en: 'We adjusted our hours to welcome you better.' }],
  },
]

const menuCategories: MenuCategory[] = [
  { id: 'mcat-taps', label_pt: 'Taps', label_en: 'Taps', text_pt: 'Rotativas, sempre frescas.', text_en: 'Rotating, always fresh.', with_photo: false, is_active: true, order: 0 },
  { id: 'mcat-comidas', label_pt: 'Comidas', label_en: 'Food', text_pt: 'Para acompanhar a cerveja.', text_en: 'To go with your beer.', with_photo: true, is_active: true, order: 1 },
  { id: 'mcat-vinhos', label_pt: 'Vinhos', label_en: 'Wines', text_pt: 'Seleção da casa.', text_en: 'House selection.', with_photo: false, is_active: true, order: 2 },
  { id: 'mcat-bebidas', label_pt: 'Bebidas', label_en: 'Drinks', text_pt: 'Sem álcool e destilados.', text_en: 'Non-alcoholic and spirits.', with_photo: false, is_active: true, order: 3 },
]

const menuTags: MenuTag[] = [
  { id: 'mtag-local', label_pt: 'Local', label_en: 'Local' },
  { id: 'mtag-ontap', label_pt: 'On Tap', label_en: 'On Tap' },
  { id: 'mtag-novidade', label_pt: 'Novidade', label_en: 'New' },
  { id: 'mtag-convidada', label_pt: 'Convidada', label_en: 'Guest' },
  { id: 'mtag-branco', label_pt: 'Branco', label_en: 'White' },
  { id: 'mtag-tinto', label_pt: 'Tinto', label_en: 'Red' },
  { id: 'mtag-destilado', label_pt: 'Destilado', label_en: 'Spirits' },
]

const menu: MenuItem[] = [
  { id: 'm1', category_id: 'mcat-taps', name_pt: 'Pale Ale da Casa', name_en: 'House Pale Ale', description_pt: 'Leve, floral e fácil de beber.', description_en: 'Light, floral and easy-drinking.', price: '4,50', price_unit: '/ 33cl', price_unit_en: '/ 33cl', tag_ids: ['mtag-local', 'mtag-ontap'], is_active: true, is_new: false, sold_out: false },
  { id: 'm2', category_id: 'mcat-taps', name_pt: 'Sea Salt Gose', name_en: 'Sea Salt Gose', description_pt: 'Cítrica e levemente salgada.', description_en: 'Citrusy and lightly salted.', price: '5,00', price_unit: '/ 33cl', price_unit_en: '/ 33cl', tag_ids: ['mtag-novidade', 'mtag-local'], is_active: true, is_new: true, sold_out: false },
  { id: 'm3', category_id: 'mcat-taps', name_pt: 'Hazy NEIPA Tropical', name_en: 'Hazy Tropical NEIPA', description_pt: 'Turva e suculenta.', description_en: 'Hazy and juicy.', price: '6,00', price_unit: '/ 33cl', price_unit_en: '/ 33cl', tag_ids: ['mtag-convidada'], is_active: true, is_new: false, sold_out: true },
  { id: 'm4', category_id: 'mcat-comidas', name_pt: 'Burger BEEF', name_en: 'Burger BEEF', description_pt: 'Hambúrguer de vaca no pão da casa, bacon e queijo.', description_en: 'Beef burger on our house bun, bacon and cheese.', price: '13,50', price_unit: '', price_unit_en: '', tag_ids: ['mtag-novidade'], is_active: true, is_new: true, sold_out: false, photo: '/v2/img/comida-burger-beef.jpg' },
  { id: 'm5', category_id: 'mcat-comidas', name_pt: 'Costela na Cerveja', name_en: 'Beer-braised Ribs', description_pt: 'Costela desfiada, cozida na nossa cerveja.', description_en: 'Pulled ribs, braised in our beer.', price: '13,00', price_unit: '', price_unit_en: '', tag_ids: [], is_active: true, is_new: false, sold_out: false, photo: '/v2/img/comida-costela-na-cerveja.jpg' },
  { id: 'm6', category_id: 'mcat-comidas', name_pt: 'Provoleta', name_en: 'Provoleta', description_pt: 'Provolone gratinado com tomate confitado.', description_en: 'Grilled provolone with confit tomato.', price: '9,00', price_unit: '', price_unit_en: '', tag_ids: [], is_active: false, is_new: false, sold_out: false, photo: '/v2/img/comida-provoleta.jpg' },
  { id: 'm7', category_id: 'mcat-vinhos', name_pt: 'Vinho Verde da Casa', name_en: 'House Vinho Verde', description_pt: 'Leve e ligeiramente petillant.', description_en: 'Light and slightly petillant.', price: '4,00', price_unit: 'copo', price_unit_en: 'glass', tag_ids: ['mtag-branco'], is_active: true, is_new: false, sold_out: false },
  { id: 'm8', category_id: 'mcat-vinhos', name_pt: 'Tinto Alentejo', name_en: 'Alentejo Red', description_pt: 'Frutado e redondo, taninos macios.', description_en: 'Fruity and round, soft tannins.', price: '4,50', price_unit: 'copo', price_unit_en: 'glass', tag_ids: ['mtag-tinto'], is_active: true, is_new: false, sold_out: false },
  { id: 'm9', category_id: 'mcat-bebidas', name_pt: 'Kombucha Artesanal', name_en: 'Craft Kombucha', description_pt: 'Refrescante e probiótica, sem álcool.', description_en: 'Refreshing and probiotic, alcohol-free.', price: '4,00', price_unit: '/ 33cl', price_unit_en: '/ 33cl', tag_ids: ['mtag-novidade'], is_active: true, is_new: true, sold_out: false },
  { id: 'm10', category_id: 'mcat-bebidas', name_pt: 'Gin Tónico', name_en: 'Gin & Tonic', description_pt: 'Seleção de gins com tónicas e botânicos.', description_en: 'Selection of gins with tonics and botanicals.', price: '7,00', price_unit: 'a partir de', price_unit_en: 'from', tag_ids: ['mtag-destilado'], is_active: true, is_new: false, sold_out: false },
]

const profiles: Profile[] = [
  { id: 'u1', name: 'Vinícius Lobato', email: 'vinicius@oemporio.pt', role: 'owner', is_active: true, last_login_at: '2026-06-28' },
  { id: 'u2', name: 'Marta Sá', email: 'marta@oemporio.pt', role: 'owner', is_active: true, last_login_at: '2026-06-27' },
  { id: 'u3', name: 'João Brito', email: 'joao@oemporio.pt', role: 'staff', is_active: true, last_login_at: '2026-06-28' },
  { id: 'u4', name: 'Inês Lopes', email: 'ines@oemporio.pt', role: 'staff', is_active: false, last_login_at: '2026-05-30' },
]

const settings: Settings = {
  external_beer_menu_url: 'https://oemporio.pt/cervejas',
  instagram_handle: '@oemporio.ericeira',
  phone_dialcode: '+351',
  phone_number: '261 000 000',
  address: 'Rua de Sto. António 12B, Ericeira, Portugal',
  hours: [
    { day: 'Segunda', open: false, hours: '' },
    { day: 'Terça', open: true, hours: '16:00 – 00:00' },
    { day: 'Quarta', open: true, hours: '16:00 – 00:00' },
    { day: 'Quinta', open: true, hours: '16:00 – 00:00' },
    { day: 'Sexta', open: true, hours: '16:00 – 02:00' },
    { day: 'Sábado', open: true, hours: '16:00 – 02:00' },
    { day: 'Domingo', open: true, hours: '16:00 – 00:00' },
  ],
  map_lat: '38.9637',
  map_lng: '-9.4158',
  welcome_voucher_pct: 20,
  welcome_voucher_validity_days: 30,
  consent_version: 'v1.0 (2026-05)',
  consent_text:
    'Ao subscrever, autorizo o O Empório a tratar os meus dados para envio de comunicações e ofertas, nos termos da Política de Privacidade. Posso retirar o consentimento a qualquer momento.',
}

export function seed(): MockData {
  // structuredClone garante que cada reset parta de cópias independentes.
  return structuredClone({
    customers,
    vouchers,
    programs: [
      {
        id: 'prog-cerveja',
        name: 'Cartão Cerveja',
        is_active: true,
        points_required: 5,
        items: [
          { id: 'cat56', label: '56' },
          { id: 'cat33', label: '33' },
          { id: 'cat28', label: '28' },
        ],
        activated_at: '2026-03-01',
        deactivated_at: null,
      },
      {
        id: 'prog-vinho',
        name: 'Clube do Vinho',
        is_active: true,
        points_required: 8,
        items: [
          { id: 'vinho-tinto', label: 'Tinto' },
          { id: 'vinho-branco', label: 'Branco' },
        ],
        activated_at: '2026-05-10',
        deactivated_at: null,
      },
      {
        id: 'prog-cafe',
        name: 'Café da Manhã',
        is_active: false,
        points_required: 10,
        items: [{ id: 'cafe', label: 'Café' }],
        activated_at: '2026-01-15',
        deactivated_at: '2026-04-20',
      },
    ],
    cards,
    posts,
    postCategories,
    menu,
    menuCategories,
    menuTags,
    profiles,
    settings,
  })
}

/* ===== Helpers ===== */

export function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  const [date] = iso.split('T')
  const [y, m, d] = date.split('-')
  return `${d}/${m}/${y}`
}

/** Formata data + hora a partir de um ISO datetime (ex.: 26/06/2026 20:30). */
export function fmtDateTime(iso: string | null): string {
  if (!iso) return '—'
  const [date, time] = iso.split('T')
  const [y, m, d] = date.split('-')
  const hm = time ? time.slice(0, 5) : ''
  return hm ? `${d}/${m}/${y} ${hm}` : `${d}/${m}/${y}`
}

export function customerName(c: Customer): string {
  return `${c.first_name} ${c.last_name}`
}

/** Rótulo de uma categoria de novidade (por idioma). */
export function postCategoryLabel(
  categories: PostCategory[],
  id: string,
  lang: 'pt' | 'en' = 'pt',
): string {
  const c = categories.find((x) => x.id === id)
  if (!c) return '—'
  return lang === 'en' ? c.label_en : c.label_pt
}

/** Categorias do cardápio ordenadas pela ordem de exibição. */
export function sortedMenuCategories(categories: MenuCategory[]): MenuCategory[] {
  return [...categories].sort((a, b) => a.order - b.order)
}

export function menuCategoryById(categories: MenuCategory[], id: string): MenuCategory | null {
  return categories.find((c) => c.id === id) ?? null
}

export function menuCategoryLabel(
  categories: MenuCategory[],
  id: string,
  lang: 'pt' | 'en' = 'pt',
): string {
  const c = categories.find((x) => x.id === id)
  if (!c) return '—'
  return lang === 'en' ? c.label_en : c.label_pt
}

export function menuTagLabel(tags: MenuTag[], id: string, lang: 'pt' | 'en' = 'pt'): string {
  const t = tags.find((x) => x.id === id)
  if (!t) return id
  return lang === 'en' ? t.label_en : t.label_pt
}

/* ===== Helpers de fidelidade ===== */

/** Linha (cartela) ativa de um item — a que ainda não foi resgatada. */
export function activeLine(card: LoyaltyCard, itemId: string): CartelaLine | null {
  return card.lines.find((l) => l.item_id === itemId && !l.redeemed_at) ?? null
}

/** Total de selos marcados em todas as cartelas (abertas e resgatadas). */
export function loyaltyConsumed(card: LoyaltyCard): number {
  return card.lines.reduce((s, l) => s + l.stamps.length, 0)
}

/** Total de prêmios resgatados (cartelas completas). */
export function loyaltyRewards(card: LoyaltyCard): number {
  return card.lines.filter((l) => l.redeemed_at).length
}

/** Selos das cartelas atualmente abertas (progresso corrente). */
export function loyaltyActiveStamps(card: LoyaltyCard): number {
  return card.lines.filter((l) => !l.redeemed_at).reduce((s, l) => s + l.stamps.length, 0)
}

/* ===== Helpers de programa ===== */

export function programById(programs: LoyaltyProgram[], id: string): LoyaltyProgram | null {
  return programs.find((p) => p.id === id) ?? null
}

/** Cartões (clientes) atribuídos a um programa. */
export function programCards(cards: LoyaltyCard[], programId: string): LoyaltyCard[] {
  return cards.filter((c) => c.program_id === programId)
}

export interface ProgramStats {
  customers: number
  consumed: number
  rewards: number
}

/** Métricas agregadas de um programa (clientes, selos consumidos, resgates). */
export function programStats(cards: LoyaltyCard[], programId: string): ProgramStats {
  const pc = programCards(cards, programId)
  return {
    customers: pc.length,
    consumed: pc.reduce((s, c) => s + loyaltyConsumed(c), 0),
    rewards: pc.reduce((s, c) => s + loyaltyRewards(c), 0),
  }
}

/** Consumo e resgates por item, para um programa. */
export function programItemStats(
  cards: LoyaltyCard[],
  program: LoyaltyProgram,
): { item: LoyaltyItem; consumed: number; rewards: number }[] {
  const pc = programCards(cards, program.id)
  return program.items.map((item) => {
    let consumed = 0
    let rewards = 0
    for (const card of pc) {
      for (const line of card.lines) {
        if (line.item_id !== item.id) continue
        consumed += line.stamps.length
        if (line.redeemed_at) rewards += 1
      }
    }
    return { item, consumed, rewards }
  })
}
