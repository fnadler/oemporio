/**
 * Novidades (site v2) — tipos e helpers de formatação puros.
 *
 * Os dados reais vêm do Supabase (ver `postsData.ts`), que monta objetos
 * neste mesmo shape `Post` — assim os componentes (PostCard, NovidadesList,
 * a página de detalhe) não precisaram mudar.
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
  /** caminho público da imagem de capa, ou null (usa fundo cinza) */
  foto: string | null
  /** classe extra do rótulo de categoria (ex.: 'coral') */
  rot?: string
  /** tom de cinza do card quando não há foto ('g1' | 'g2' | 'g3') */
  tone?: string
  corpo: PostBody[]
}

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

/** Tom de fundo do card quando não há foto. */
export function cardTone(p: Post, i: number): string {
  return p.foto ? '' : p.tone || ['g1', 'g2', 'g3'][i % 3]
}
