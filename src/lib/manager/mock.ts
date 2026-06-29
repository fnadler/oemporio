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

export interface LoyaltyProgram {
  name: string
  eligible_scope: 'category' | 'item'
  eligible_ref: string
  points_required: number
  reward_description: string
  is_active: boolean
  validity_days: number
}

export interface LoyaltyCard {
  id: string
  customer_id: string
  balance: number
  rewards_redeemed: number
}

export type PostBlock =
  | { type: 'paragraph'; text_pt: string; text_en: string }
  | { type: 'heading'; text_pt: string; text_en: string }
  | { type: 'video'; youtube: string }
  | { type: 'gallery'; images: string[] }

export interface Post {
  id: string
  slug: string
  eyebrow_pt: string
  eyebrow_en: string
  category_pt: string
  category_en: string
  title_pt: string
  title_en: string
  subtitle_pt: string
  subtitle_en: string
  status: 'draft' | 'published'
  date: string // ISO
  body: PostBlock[]
}

export type MenuCategoryKey = 'taps' | 'comidas' | 'vinhos' | 'bebidas'

export interface MenuItem {
  id: string
  category: MenuCategoryKey
  name_pt: string
  name_en: string
  description_pt: string
  price: string
  price_unit: string
  tags: string[]
  is_active: boolean
  sold_out: boolean
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

export interface Settings {
  external_beer_menu_url: string
  instagram_handle: string
  address: string
  hours: string
  map_lat: string
  map_lng: string
  welcome_voucher_pct: number
  welcome_voucher_validity_days: number
  consent_version: string
}

export interface MockData {
  customers: Customer[]
  vouchers: Voucher[]
  program: LoyaltyProgram
  cards: LoyaltyCard[]
  posts: Post[]
  menu: MenuItem[]
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

const cards: LoyaltyCard[] = [
  { id: 'l1', customer_id: 'c1', balance: 7, rewards_redeemed: 1 },
  { id: 'l2', customer_id: 'c2', balance: 10, rewards_redeemed: 0 },
  { id: 'l3', customer_id: 'c4', balance: 3, rewards_redeemed: 0 },
  { id: 'l4', customer_id: 'c8', balance: 9, rewards_redeemed: 2 },
  { id: 'l5', customer_id: 'c12', balance: 5, rewards_redeemed: 0 },
]

const posts: Post[] = [
  {
    id: 'p1', slug: 'cervejaria-do-mes-dois-corvos', status: 'published', date: '2026-06-02',
    eyebrow_pt: 'Cervejaria do mês', eyebrow_en: 'Brewery of the month',
    category_pt: 'Mostra de cerveja', category_en: 'Beer showcase',
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
    category_pt: 'Evento · Ericeira', category_en: 'Event · Ericeira',
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
    category_pt: 'Workshop', category_en: 'Workshop',
    title_pt: 'Prova às cegas de IPAs', title_en: 'Blind IPA tasting',
    subtitle_pt: 'Uma noite para treinar o paladar e descobrir cada estilo de IPA.',
    subtitle_en: 'A night to train your palate across IPA styles.',
    body: [{ type: 'paragraph', text_pt: 'Conduzido pela nossa equipa.', text_en: 'Hosted by our team.' }],
  },
  {
    id: 'p4', slug: 'novo-burger-beef', status: 'published', date: '2026-05-28',
    eyebrow_pt: 'Novo no cardápio', eyebrow_en: 'New on the menu',
    category_pt: 'Cardápio', category_en: 'Menu',
    title_pt: 'Chegou o Burger BEEF', title_en: 'The Burger BEEF is here',
    subtitle_pt: 'Hambúrguer de vaca no pão da casa com a marca “O”.', subtitle_en: 'Beef burger on our branded house bun.',
    body: [{ type: 'paragraph', text_pt: 'Pão assinado com o símbolo do O Empório.', text_en: 'Bun branded with the O Empório symbol.' }],
  },
  {
    id: 'p5', slug: 'horario-feriado', status: 'draft', date: '2026-06-18',
    eyebrow_pt: 'Comunicado', eyebrow_en: 'Notice',
    category_pt: 'Comunicado', category_en: 'Notice',
    title_pt: 'Horário especial de feriado', title_en: 'Special holiday hours',
    subtitle_pt: 'Confira os nossos horários durante a semana do feriado.', subtitle_en: 'Check our hours during holiday week.',
    body: [{ type: 'paragraph', text_pt: 'Ajustamos o horário para receber melhor.', text_en: 'We adjusted our hours to welcome you better.' }],
  },
]

const menu: MenuItem[] = [
  { id: 'm1', category: 'taps', name_pt: 'Pale Ale da Casa', name_en: 'House Pale Ale', description_pt: 'Leve, floral e fácil de beber.', price: '4,50', price_unit: '/ 33cl', tags: ['Local', 'On Tap'], is_active: true, sold_out: false },
  { id: 'm2', category: 'taps', name_pt: 'Sea Salt Gose', name_en: 'Sea Salt Gose', description_pt: 'Cítrica e levemente salgada.', price: '5,00', price_unit: '/ 33cl', tags: ['Novidade', 'Local'], is_active: true, sold_out: false },
  { id: 'm3', category: 'taps', name_pt: 'Hazy NEIPA Tropical', name_en: 'Hazy Tropical NEIPA', description_pt: 'Turva e suculenta.', price: '6,00', price_unit: '/ 33cl', tags: ['Convidada'], is_active: true, sold_out: true },
  { id: 'm4', category: 'comidas', name_pt: 'Burger BEEF', name_en: 'Burger BEEF', description_pt: 'Hambúrguer de vaca no pão da casa, bacon e queijo.', price: '13,50', price_unit: '', tags: ['Novidade'], is_active: true, sold_out: false, photo: '/v2/img/comida-burger-beef.jpg' },
  { id: 'm5', category: 'comidas', name_pt: 'Costela na Cerveja', name_en: 'Beer-braised Ribs', description_pt: 'Costela desfiada, cozida na nossa cerveja.', price: '13,00', price_unit: '', tags: [], is_active: true, sold_out: false, photo: '/v2/img/comida-costela-na-cerveja.jpg' },
  { id: 'm6', category: 'comidas', name_pt: 'Provoleta', name_en: 'Provoleta', description_pt: 'Provolone gratinado com tomate confitado.', price: '9,00', price_unit: '', tags: [], is_active: false, sold_out: false, photo: '/v2/img/comida-provoleta.jpg' },
  { id: 'm7', category: 'vinhos', name_pt: 'Vinho Verde da Casa', name_en: 'House Vinho Verde', description_pt: 'Leve e ligeiramente petillant.', price: '4,00', price_unit: 'copo', tags: ['Branco'], is_active: true, sold_out: false },
  { id: 'm8', category: 'vinhos', name_pt: 'Tinto Alentejo', name_en: 'Alentejo Red', description_pt: 'Frutado e redondo, taninos macios.', price: '4,50', price_unit: 'copo', tags: ['Tinto'], is_active: true, sold_out: false },
  { id: 'm9', category: 'bebidas', name_pt: 'Kombucha Artesanal', name_en: 'Craft Kombucha', description_pt: 'Refrescante e probiótica, sem álcool.', price: '4,00', price_unit: '/ 33cl', tags: ['Novidade'], is_active: true, sold_out: false },
  { id: 'm10', category: 'bebidas', name_pt: 'Gin Tónico', name_en: 'Gin & Tonic', description_pt: 'Seleção de gins com tónicas e botânicos.', price: '7,00', price_unit: 'a partir de', tags: ['Destilado'], is_active: true, sold_out: false },
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
  address: 'Rua de Sto. António 12B, Ericeira, Portugal',
  hours: 'Seg–Qui 16h–00h · Sex–Sáb 16h–02h · Dom 16h–00h',
  map_lat: '38.9637',
  map_lng: '-9.4158',
  welcome_voucher_pct: 20,
  welcome_voucher_validity_days: 30,
  consent_version: 'v1.0 (2026-05)',
}

export function seed(): MockData {
  // structuredClone garante que cada reset parta de cópias independentes.
  return structuredClone({
    customers,
    vouchers,
    program: {
      name: 'Cartão Cerveja',
      eligible_scope: 'category',
      eligible_ref: 'taps',
      points_required: 10,
      reward_description: '1 cerveja grátis',
      is_active: true,
      validity_days: 365,
    },
    cards,
    posts,
    menu,
    profiles,
    settings,
  })
}

/* ===== Helpers ===== */

export function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function customerName(c: Customer): string {
  return `${c.first_name} ${c.last_name}`
}
