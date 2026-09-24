/**
 * Manager (CRM) — tipos e helpers de exibição.
 *
 * Os dados reais vêm do Supabase (ver store.tsx); este arquivo guarda só os
 * tipos que a UI espera (moldados a partir do schema em
 * "Especificacao Tecnica - Backend.md") e funções puras de formatação/
 * agregação, sem estado nem I/O.
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
  /** Nome de quem validou no balcão (resolvido de `vouchers.redeemed_by`), ou null. */
  redeemed_by: string | null
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
  by: string // nome do usuário do Manager
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
  date: string // ISO (YYYY-MM-DD) — mapeia para `posts.published_at`
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

/** Variantes visuais da tag — estilos monocromáticos do site (ver site.css .minitag.*). */
export type MenuTagVariant = 'local' | 'new' | 'guest' | 'tap'

export interface MenuTag {
  id: string
  label_pt: string
  label_en: string
  variant: MenuTagVariant
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
  /** Linha técnica (ex.: "LETRA · VILA VERDE — 5,0% ABV · 30 IBU"). */
  meta: string
  tag_ids: string[]
  is_active: boolean
  sold_out: boolean
  is_new: boolean // destaque "Novo" no cardápio
  /** Destaque especial (ex.: "Cervejaria do Mês") — no máx. 1 por categoria. */
  is_featured: boolean
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
  google_place_id: string
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
