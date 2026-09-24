'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from './toast'
import {
  type MockData,
  type Role,
  type Voucher,
  type LoyaltyProgram,
  type LoyaltyCard,
  type Post,
  type PostCategory,
  type MenuItem,
  type MenuCategory,
  type MenuTag,
  type Settings,
} from './mock'

const DEFAULT_SETTINGS: Settings = {
  external_beer_menu_url: '',
  instagram_handle: '',
  phone_dialcode: '',
  phone_number: '',
  address: '',
  hours: [],
  map_lat: '',
  map_lng: '',
  google_place_id: '',
  welcome_voucher_pct: 20,
  welcome_voucher_validity_days: 30,
  consent_version: '',
  consent_text: '',
}

const EMPTY_DATA: MockData = {
  customers: [],
  vouchers: [],
  programs: [],
  cards: [],
  posts: [],
  postCategories: [],
  menu: [],
  menuCategories: [],
  menuTags: [],
  profiles: [],
  settings: DEFAULT_SETTINGS,
}

function groupBy<T, K>(rows: T[] | null | undefined, key: (row: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>()
  for (const row of rows ?? []) {
    const k = key(row)
    const list = map.get(k)
    if (list) list.push(row)
    else map.set(k, [row])
  }
  return map
}

function formatPrice(n: number | null | undefined): string {
  return (n ?? 0).toFixed(2).replace('.', ',')
}

function parsePrice(s: string): number {
  const n = parseFloat(s.replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  if (msg.includes('LAST_OWNER')) return 'Não é possível alterar/desativar o último Owner ativo.'
  if (msg.includes('PHOTO_REQUIRED')) return 'Esta categoria exige foto do produto — carregue uma foto antes de salvar.'
  if (msg.includes('PROGRAM_INACTIVE')) return 'Só é possível atribuir/trocar para um programa ativo.'
  if (msg.includes('menu_items_category_fk') || msg.includes('violates foreign key'))
    return 'Não é possível excluir: existem registros vinculados a este item.'
  return msg
}

interface ManagerCtx {
  data: MockData
  role: Role
  user: string
  loading: boolean
  // vouchers
  redeemVoucher: (id: string) => void
  cancelVoucher: (id: string) => void
  reactivateVoucher: (id: string) => void
  // fidelidade — programas
  saveProgram: (program: LoyaltyProgram) => void
  deactivateProgram: (id: string) => void
  reactivateProgram: (id: string) => void
  assignProgram: (customerId: string, programId: string) => void
  // fidelidade — cartela
  markStamp: (customerId: string, itemId: string) => void
  unmarkStamp: (customerId: string, itemId: string) => void
  redeemCartela: (customerId: string, itemId: string) => void
  // novidades
  savePost: (post: Post) => void
  deletePost: (id: string) => void
  togglePublish: (id: string) => void
  savePostCategory: (cat: PostCategory) => void
  deletePostCategory: (id: string) => void
  // cardapio
  saveItem: (item: MenuItem) => void
  deleteItem: (id: string) => void
  toggleItem: (id: string, field: 'is_active' | 'sold_out' | 'is_new') => void
  saveMenuCategory: (cat: MenuCategory) => void
  deleteMenuCategory: (id: string) => void
  moveMenuCategory: (id: string, dir: -1 | 1) => void
  saveMenuTag: (tag: MenuTag) => void
  deleteMenuTag: (id: string) => void
  // settings
  updateSettings: (patch: Partial<Settings>) => void
  // perfis
  inviteProfile: (name: string, email: string, role: Role) => void
  changeProfileRole: (id: string, role: Role) => void
  toggleProfileActive: (id: string) => void
}

const Ctx = createContext<ManagerCtx | null>(null)

export function useManager() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useManager deve ser usado dentro de <StoreProvider>')
  return ctx
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const toast = useToast()

  const [data, setData] = useState<MockData>(EMPTY_DATA)
  const [role, setRole] = useState<Role>('staff')
  const [user, setUser] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadAll() {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    if (!authUser) {
      setLoading(false)
      return
    }
    setUserId(authUser.id)

    const [
      customersRes,
      vouchersRes,
      programsRes,
      programItemsRes,
      cardsRes,
      cartelasRes,
      stampsRes,
      postsRes,
      postCategoriesRes,
      menuRes,
      menuCategoriesRes,
      menuTagsRes,
      menuItemTagsRes,
      profilesRes,
      settingsRes,
    ] = await Promise.all([
      supabase.from('customers').select('*').order('created_at', { ascending: false }),
      supabase.from('vouchers').select('*').order('issued_at', { ascending: false }),
      supabase.from('loyalty_programs').select('*'),
      supabase.from('loyalty_program_items').select('*').order('sort_order'),
      supabase.from('loyalty_cards').select('*'),
      supabase.from('loyalty_cartelas').select('*'),
      supabase.from('loyalty_stamps').select('*').order('recorded_at'),
      supabase.from('posts').select('*').order('published_at', { ascending: false }),
      supabase.from('post_categories').select('*'),
      supabase.from('menu_items').select('*').order('sort_order'),
      supabase.from('menu_categories').select('*'),
      supabase.from('menu_tags').select('*'),
      supabase.from('menu_item_tags').select('*'),
      supabase.from('profiles').select('*').order('name'),
      supabase.from('site_settings').select('*').limit(1),
    ])

    for (const [label, res] of Object.entries({
      customersRes,
      vouchersRes,
      programsRes,
      programItemsRes,
      cardsRes,
      cartelasRes,
      stampsRes,
      postsRes,
      postCategoriesRes,
      menuRes,
      menuCategoriesRes,
      menuTagsRes,
      menuItemTagsRes,
      profilesRes,
      settingsRes,
    })) {
      if (res.error) console.error(`Erro carregando ${label}:`, res.error.message)
    }

    const profileById = new Map((profilesRes.data ?? []).map((p) => [p.id, p]))
    const nameOf = (id: string | null) => (id ? profileById.get(id)?.name ?? 'Desconhecido' : null)

    const me = profileById.get(authUser.id)
    setRole(me?.role === 'owner' ? 'owner' : 'staff')
    setUser(me?.name ?? authUser.email ?? '')

    const stampsByCartela = groupBy(stampsRes.data, (s) => s.cartela_id as string)
    const cartelasByCard = groupBy(cartelasRes.data, (l) => l.card_id as string)
    const cards: LoyaltyCard[] = (cardsRes.data ?? []).map((c) => ({
      id: c.id,
      customer_id: c.customer_id,
      program_id: c.program_id,
      lines: (cartelasByCard.get(c.id) ?? []).map((l) => ({
        id: l.id,
        item_id: l.item_id,
        stamps: (stampsByCartela.get(l.id) ?? []).map((s) => ({
          at: s.recorded_at,
          by: nameOf(s.recorded_by) ?? 'Desconhecido',
        })),
        redeemed_at: l.redeemed_at,
        redeemed_by: nameOf(l.redeemed_by),
      })),
    }))

    const itemsByProgram = groupBy(programItemsRes.data, (i) => i.program_id as string)
    const programs: LoyaltyProgram[] = (programsRes.data ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      is_active: p.is_active,
      points_required: p.points_required,
      items: (itemsByProgram.get(p.id) ?? []).map((i) => ({ id: i.id, label: i.label })),
      activated_at: p.activated_at,
      deactivated_at: p.deactivated_at,
    }))

    const tagsByItem = groupBy(menuItemTagsRes.data, (t) => t.item_id as string)
    const menu: MenuItem[] = (menuRes.data ?? []).map((m) => ({
      id: m.id,
      category_id: m.category_id,
      name_pt: m.name_pt,
      name_en: m.name_en,
      description_pt: m.description_pt,
      description_en: m.description_en,
      price: formatPrice(m.price),
      price_unit: m.price_unit,
      price_unit_en: m.price_unit_en,
      tag_ids: (tagsByItem.get(m.id) ?? []).map((t) => t.tag_id as string),
      is_active: m.is_active,
      sold_out: m.sold_out,
      is_new: m.is_new,
      photo: m.photo_path ?? undefined,
    }))

    const menuCategories: MenuCategory[] = (menuCategoriesRes.data ?? []).map((c) => ({
      id: c.id,
      label_pt: c.name_pt,
      label_en: c.name_en,
      text_pt: c.text_pt,
      text_en: c.text_en,
      with_photo: c.with_photo,
      is_active: c.is_active,
      order: c.sort_order,
    }))

    const posts: Post[] = (postsRes.data ?? []).map((p) => ({
      id: p.id,
      slug: p.slug,
      eyebrow_pt: p.eyebrow_pt,
      eyebrow_en: p.eyebrow_en,
      category_id: p.category_id ?? '',
      title_pt: p.title_pt,
      title_en: p.title_en,
      subtitle_pt: p.subtitle_pt,
      subtitle_en: p.subtitle_en,
      status: p.status,
      date: (p.published_at ?? '').slice(0, 10),
      body: p.body ?? [],
    }))

    const vouchers: Voucher[] = (vouchersRes.data ?? []).map((v) => ({
      id: v.id,
      code: v.code,
      customer_id: v.customer_id,
      discount_pct: v.discount_pct,
      status: v.status,
      issued_at: v.issued_at,
      expires_at: v.expires_at,
      redeemed_at: v.redeemed_at,
      redeemed_by: nameOf(v.redeemed_by),
    }))

    const s = settingsRes.data?.[0]
    const settings: Settings = s
      ? {
          external_beer_menu_url: s.external_beer_menu_url,
          instagram_handle: s.instagram_handle,
          phone_dialcode: s.phone_dialcode,
          phone_number: s.phone_number,
          address: s.address,
          hours: s.hours ?? [],
          map_lat: s.map_lat,
          map_lng: s.map_lng,
          google_place_id: s.google_place_id,
          welcome_voucher_pct: s.welcome_voucher_pct,
          welcome_voucher_validity_days: s.welcome_voucher_validity_days,
          consent_version: s.consent_version ?? '',
          consent_text: s.consent_text ?? '',
        }
      : DEFAULT_SETTINGS

    setData({
      customers: customersRes.data ?? [],
      vouchers,
      programs,
      cards,
      posts,
      postCategories: postCategoriesRes.data ?? [],
      menu,
      menuCategories,
      menuTags: menuTagsRes.data ?? [],
      profiles: profilesRes.data ?? [],
      settings,
    })
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo<ManagerCtx>(() => {
    async function runVoucherAction(action: 'redeem' | 'cancel' | 'reactivate', id: string) {
      const voucher = data.vouchers.find((v) => v.id === id)
      if (!voucher) return
      const res = await fetch('/api/redeem-voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, code: voucher.code }),
      })
      const body = await res.json()
      if (!res.ok) {
        toast(friendlyError(new Error(body.error ?? 'Falha na operação')), 'danger')
        return
      }
      const messages = {
        redeem: 'Voucher validado e marcado como utilizado.',
        cancel: 'Voucher cancelado.',
        reactivate: 'Voucher reativado.',
      }
      toast(messages[action], action === 'cancel' ? 'danger' : 'info')
      await loadAll()
    }

    return {
      data,
      role,
      user,
      loading,

      redeemVoucher: (id) => void runVoucherAction('redeem', id),
      cancelVoucher: (id) => void runVoucherAction('cancel', id),
      reactivateVoucher: (id) => void runVoucherAction('reactivate', id),

      saveProgram: (program) => {
        void (async () => {
          try {
            const exists = data.programs.some((p) => p.id === program.id)
            if (exists) {
              const { error } = await supabase
                .from('loyalty_programs')
                .update({ name: program.name, points_required: program.points_required })
                .eq('id', program.id)
              if (error) throw error
            } else {
              const { error } = await supabase.from('loyalty_programs').insert({
                id: program.id,
                name: program.name,
                points_required: program.points_required,
                is_active: true,
              })
              if (error) throw error
            }

            // sincroniza os itens de consumo (diff por id, preserva histórico)
            const { data: existingItems, error: existingErr } = await supabase
              .from('loyalty_program_items')
              .select('id')
              .eq('program_id', program.id)
            if (existingErr) throw existingErr
            const existingIds = new Set((existingItems ?? []).map((i) => i.id as string))
            const draftIds = new Set(program.items.map((i) => i.id))
            const toDelete = [...existingIds].filter((id) => !draftIds.has(id))
            const toUpdate = program.items.filter((i) => existingIds.has(i.id))
            const toInsert = program.items.filter((i) => !existingIds.has(i.id))

            if (toDelete.length) {
              const { error } = await supabase.from('loyalty_program_items').delete().in('id', toDelete)
              if (error) throw error
            }
            for (const [idx, item] of program.items.entries()) {
              if (!toUpdate.includes(item)) continue
              const { error } = await supabase
                .from('loyalty_program_items')
                .update({ label: item.label, sort_order: idx })
                .eq('id', item.id)
              if (error) throw error
            }
            if (toInsert.length) {
              const { error } = await supabase.from('loyalty_program_items').insert(
                toInsert.map((item) => ({
                  id: item.id,
                  program_id: program.id,
                  label: item.label,
                  sort_order: program.items.indexOf(item),
                }))
              )
              if (error) throw error
            }

            toast('Programa guardado.')
            await loadAll()
          } catch (e) {
            toast(friendlyError(e), 'danger')
          }
        })()
      },
      deactivateProgram: (id) => {
        void (async () => {
          const { error } = await supabase
            .from('loyalty_programs')
            .update({ is_active: false, deactivated_at: new Date().toISOString() })
            .eq('id', id)
          if (error) return toast(friendlyError(error), 'danger')
          toast('Programa inativado.', 'danger')
          await loadAll()
        })()
      },
      reactivateProgram: (id) => {
        void (async () => {
          const { error } = await supabase
            .from('loyalty_programs')
            .update({ is_active: true, deactivated_at: null, activated_at: new Date().toISOString() })
            .eq('id', id)
          if (error) return toast(friendlyError(error), 'danger')
          toast('Programa reativado.', 'info')
          await loadAll()
        })()
      },
      assignProgram: (customerId, programId) => {
        void (async () => {
          const existing = data.cards.find((c) => c.customer_id === customerId)
          const { error } = existing
            ? await supabase.from('loyalty_cards').update({ program_id: programId }).eq('id', existing.id)
            : await supabase.from('loyalty_cards').insert({ customer_id: customerId, program_id: programId })
          if (error) return toast(friendlyError(error), 'danger')
          toast('Programa atribuído ao cliente.')
          await loadAll()
        })()
      },

      markStamp: (customerId, itemId) => {
        void (async () => {
          try {
            const card = data.cards.find((c) => c.customer_id === customerId)
            if (!card) return
            const program = data.programs.find((p) => p.id === card.program_id)
            if (!program) return
            const line = card.lines.find((l) => l.item_id === itemId && !l.redeemed_at)
            let cartelaId = line?.id

            if (!cartelaId) {
              const { data: created, error } = await supabase
                .from('loyalty_cartelas')
                .insert({ card_id: card.id, item_id: itemId })
                .select('id')
                .single()
              if (error) throw error
              cartelaId = created.id
            } else if (line && line.stamps.length >= program.points_required) {
              return // já completa — precisa resgatar antes de marcar mais
            }

            const { error: stampErr } = await supabase.from('loyalty_stamps').insert({ cartela_id: cartelaId })
            if (stampErr) throw stampErr
            toast('Selo registrado.')
            await loadAll()
          } catch (e) {
            toast(friendlyError(e), 'danger')
          }
        })()
      },
      unmarkStamp: (customerId, itemId) => {
        void (async () => {
          const card = data.cards.find((c) => c.customer_id === customerId)
          const line = card?.lines.find((l) => l.item_id === itemId && !l.redeemed_at)
          if (!line || line.stamps.length === 0) return

          const { data: stamps, error: findErr } = await supabase
            .from('loyalty_stamps')
            .select('id')
            .eq('cartela_id', line.id)
            .order('recorded_at', { ascending: false })
            .limit(1)
          if (findErr || !stamps?.[0]) return toast(friendlyError(findErr ?? new Error('Selo não encontrado')), 'danger')

          const { error } = await supabase.from('loyalty_stamps').delete().eq('id', stamps[0].id)
          if (error) return toast(friendlyError(error), 'danger')
          toast('Último selo desfeito.', 'info')
          await loadAll()
        })()
      },
      redeemCartela: (customerId, itemId) => {
        void (async () => {
          try {
            const card = data.cards.find((c) => c.customer_id === customerId)
            if (!card) return
            const program = data.programs.find((p) => p.id === card.program_id)
            const line = card.lines.find((l) => l.item_id === itemId && !l.redeemed_at)
            if (!program || !line || line.stamps.length < program.points_required) {
              toast('Cartela ainda não está completa.', 'danger')
              return
            }
            const { error: redeemErr } = await supabase
              .from('loyalty_cartelas')
              .update({ redeemed_at: new Date().toISOString() })
              .eq('id', line.id)
            if (redeemErr) throw redeemErr

            const { error: newLineErr } = await supabase
              .from('loyalty_cartelas')
              .insert({ card_id: card.id, item_id: itemId })
            if (newLineErr) throw newLineErr

            toast('Prêmio resgatado! Nova cartela aberta. 🍺')
            await loadAll()
          } catch (e) {
            toast(friendlyError(e), 'danger')
          }
        })()
      },

      savePost: (post) => {
        void (async () => {
          const exists = data.posts.some((p) => p.id === post.id)
          const id = post.id || crypto.randomUUID()
          const payload = {
            slug: post.slug,
            eyebrow_pt: post.eyebrow_pt,
            eyebrow_en: post.eyebrow_en,
            category_id: post.category_id || null,
            title_pt: post.title_pt,
            title_en: post.title_en,
            subtitle_pt: post.subtitle_pt,
            subtitle_en: post.subtitle_en,
            body: post.body,
            status: post.status,
            published_at: post.date,
          }
          const { error } = exists
            ? await supabase.from('posts').update(payload).eq('id', id)
            : await supabase.from('posts').insert({ id, ...payload, author_id: userId })
          if (error) return toast(friendlyError(error), 'danger')
          toast('Novidade guardada.')
          await loadAll()
        })()
      },
      deletePost: (id) => {
        void (async () => {
          const { error } = await supabase.from('posts').delete().eq('id', id)
          if (error) return toast(friendlyError(error), 'danger')
          toast('Novidade removida.', 'danger')
          await loadAll()
        })()
      },
      togglePublish: (id) => {
        void (async () => {
          const post = data.posts.find((p) => p.id === id)
          if (!post) return
          const nextStatus = post.status === 'published' ? 'draft' : 'published'
          const { error } = await supabase.from('posts').update({ status: nextStatus }).eq('id', id)
          if (error) return toast(friendlyError(error), 'danger')
          toast(nextStatus === 'published' ? 'Novidade publicada.' : 'Novidade despublicada.', 'info')
          await loadAll()
        })()
      },
      savePostCategory: (cat) => {
        void (async () => {
          const exists = data.postCategories.some((c) => c.id === cat.id)
          const { error } = exists
            ? await supabase
                .from('post_categories')
                .update({ label_pt: cat.label_pt, label_en: cat.label_en })
                .eq('id', cat.id)
            : await supabase.from('post_categories').insert(cat)
          if (error) return toast(friendlyError(error), 'danger')
          toast('Categoria guardada.')
          await loadAll()
        })()
      },
      deletePostCategory: (id) => {
        void (async () => {
          const { error } = await supabase.from('post_categories').delete().eq('id', id)
          if (error) return toast(friendlyError(error), 'danger')
          toast('Categoria removida.', 'danger')
          await loadAll()
        })()
      },

      saveItem: (item) => {
        void (async () => {
          const exists = data.menu.some((m) => m.id === item.id)
          const id = item.id || crypto.randomUUID()
          const payload = {
            category_id: item.category_id,
            name_pt: item.name_pt,
            name_en: item.name_en,
            description_pt: item.description_pt,
            description_en: item.description_en,
            price: parsePrice(item.price),
            price_unit: item.price_unit,
            price_unit_en: item.price_unit_en,
            photo_path: item.photo ?? null,
            is_active: item.is_active,
            sold_out: item.sold_out,
            is_new: item.is_new,
          }
          const { error } = exists
            ? await supabase.from('menu_items').update(payload).eq('id', id)
            : await supabase.from('menu_items').insert({ id, ...payload })
          if (error) return toast(friendlyError(error), 'danger')

          await supabase.from('menu_item_tags').delete().eq('item_id', id)
          if (item.tag_ids.length) {
            await supabase
              .from('menu_item_tags')
              .insert(item.tag_ids.map((tag_id) => ({ item_id: id, tag_id })))
          }

          toast('Item do cardápio guardado.')
          await loadAll()
        })()
      },
      deleteItem: (id) => {
        void (async () => {
          const { error } = await supabase.from('menu_items').delete().eq('id', id)
          if (error) return toast(friendlyError(error), 'danger')
          toast('Item removido.', 'danger')
          await loadAll()
        })()
      },
      toggleItem: (id, field) => {
        void (async () => {
          const item = data.menu.find((m) => m.id === id)
          if (!item) return
          const { error } = await supabase.from('menu_items').update({ [field]: !item[field] }).eq('id', id)
          if (error) return toast(friendlyError(error), 'danger')
          await loadAll()
        })()
      },
      saveMenuCategory: (cat) => {
        void (async () => {
          const exists = data.menuCategories.some((c) => c.id === cat.id)
          const payload = {
            name_pt: cat.label_pt,
            name_en: cat.label_en,
            text_pt: cat.text_pt,
            text_en: cat.text_en,
            with_photo: cat.with_photo,
            is_active: cat.is_active,
            sort_order: cat.order,
          }
          const { error } = exists
            ? await supabase.from('menu_categories').update(payload).eq('id', cat.id)
            : await supabase.from('menu_categories').insert({ id: cat.id, ...payload })
          if (error) return toast(friendlyError(error), 'danger')
          toast('Categoria guardada.')
          await loadAll()
        })()
      },
      deleteMenuCategory: (id) => {
        void (async () => {
          const { error } = await supabase.from('menu_categories').delete().eq('id', id)
          if (error) return toast(friendlyError(error), 'danger')
          toast('Categoria removida.', 'danger')
          await loadAll()
        })()
      },
      moveMenuCategory: (id, dir) => {
        void (async () => {
          const sorted = [...data.menuCategories].sort((a, b) => a.order - b.order)
          const idx = sorted.findIndex((c) => c.id === id)
          const j = idx + dir
          if (idx < 0 || j < 0 || j >= sorted.length) return
          const a = sorted[idx]
          const b = sorted[j]
          const [{ error: e1 }, { error: e2 }] = await Promise.all([
            supabase.from('menu_categories').update({ sort_order: b.order }).eq('id', a.id),
            supabase.from('menu_categories').update({ sort_order: a.order }).eq('id', b.id),
          ])
          if (e1 || e2) return toast(friendlyError(e1 ?? e2), 'danger')
          await loadAll()
        })()
      },
      saveMenuTag: (tag) => {
        void (async () => {
          const exists = data.menuTags.some((t) => t.id === tag.id)
          const { error } = exists
            ? await supabase
                .from('menu_tags')
                .update({ label_pt: tag.label_pt, label_en: tag.label_en })
                .eq('id', tag.id)
            : await supabase.from('menu_tags').insert(tag)
          if (error) return toast(friendlyError(error), 'danger')
          toast('Tag guardada.')
          await loadAll()
        })()
      },
      deleteMenuTag: (id) => {
        void (async () => {
          const { error } = await supabase.from('menu_tags').delete().eq('id', id)
          if (error) return toast(friendlyError(error), 'danger')
          toast('Tag removida.', 'danger')
          await loadAll()
        })()
      },

      updateSettings: (patch) => {
        void (async () => {
          const { error } = await supabase.from('site_settings').update(patch).eq('id', true)
          if (error) return toast(friendlyError(error), 'danger')
          toast('Configurações guardadas.')
          await loadAll()
        })()
      },

      inviteProfile: (name, email, r) => {
        void (async () => {
          const res = await fetch('/api/invite-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, role: r }),
          })
          const body = await res.json()
          if (!res.ok) {
            const message =
              body.error === 'EMAIL_ALREADY_INVITED'
                ? 'Este e-mail já foi convidado.'
                : body.error === 'FORBIDDEN'
                  ? 'Apenas o Owner pode convidar novos membros.'
                  : friendlyError(new Error(body.error ?? 'Falha ao convidar'))
            toast(message, 'danger')
            return
          }
          toast(`Convite enviado para ${email}.`)
          await loadAll()
        })()
      },
      changeProfileRole: (id, r) => {
        void (async () => {
          const { error } = await supabase.from('profiles').update({ role: r }).eq('id', id)
          if (error) return toast(friendlyError(error), 'danger')
          toast('Papel do perfil atualizado.', 'info')
          await loadAll()
        })()
      },
      toggleProfileActive: (id) => {
        void (async () => {
          const profile = data.profiles.find((p) => p.id === id)
          if (!profile) return
          const { error } = await supabase
            .from('profiles')
            .update({ is_active: !profile.is_active })
            .eq('id', id)
          if (error) return toast(friendlyError(error), 'danger')
          toast('Estado do perfil atualizado.', 'info')
          await loadAll()
        })()
      },
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, role, user, loading, userId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-subtle">
        <p className="text-sm text-g500">Carregando…</p>
      </div>
    )
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
