'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { useToast } from './toast'
import {
  seed,
  CURRENT_USER,
  type MockData,
  type Role,
  type Voucher,
  type LoyaltyProgram,
  type CartelaLine,
  type Post,
  type PostCategory,
  type MenuItem,
  type MenuCategory,
  type MenuTag,
  type Settings,
  type Profile,
} from './mock'

function todayISO(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function inDaysISO(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function nowISO(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

function uid(prefix: string): string {
  counter += 1
  return `${prefix}${counter}-${Math.floor(Math.random() * 1e6)}`
}
let counter = 1000

interface ManagerCtx {
  data: MockData
  role: Role
  setRole: (r: Role) => void
  user: string
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
  const [data, setData] = useState<MockData>(() => seed())
  const [role, setRole] = useState<Role>('owner')
  const toast = useToast()

  const value = useMemo<ManagerCtx>(() => {
    const update = (fn: (d: MockData) => void) =>
      setData((prev) => {
        const next = structuredClone(prev)
        fn(next)
        return next
      })

    const activeOwners = (profiles: Profile[]) =>
      profiles.filter((p) => p.role === 'owner' && p.is_active).length

    return {
      data,
      role,
      setRole: (r) => {
        setRole(r)
        toast(`Papel alterado para ${r === 'owner' ? 'Owner' : 'Staff'}`, 'info')
      },
      user: CURRENT_USER,

      redeemVoucher: (id) => {
        update((d) => {
          const v = d.vouchers.find((x) => x.id === id)
          if (v && v.status === 'issued') {
            v.status = 'redeemed'
            v.redeemed_at = todayISO()
          }
        })
        toast('Voucher validado e marcado como utilizado.')
      },
      cancelVoucher: (id) => {
        update((d) => {
          const v = d.vouchers.find((x) => x.id === id)
          if (v && v.status === 'issued') v.status = 'cancelled'
        })
        toast('Voucher cancelado.', 'danger')
      },
      reactivateVoucher: (id) => {
        update((d) => {
          const v = d.vouchers.find((x) => x.id === id)
          if (v && (v.status === 'expired' || v.status === 'cancelled')) {
            v.status = 'issued'
            v.redeemed_at = null
            v.expires_at = inDaysISO(30) // nova validade ao reativar
          }
        })
        toast('Voucher reativado.', 'info')
      },

      saveProgram: (program) => {
        update((d) => {
          const i = d.programs.findIndex((p) => p.id === program.id)
          if (i >= 0) d.programs[i] = program
          else d.programs.push(program)
        })
        toast('Programa guardado.')
      },
      deactivateProgram: (id) => {
        update((d) => {
          const p = d.programs.find((x) => x.id === id)
          if (p) {
            p.is_active = false
            p.deactivated_at = todayISO()
          }
        })
        toast('Programa inativado.', 'danger')
      },
      reactivateProgram: (id) => {
        update((d) => {
          const p = d.programs.find((x) => x.id === id)
          if (p) {
            p.is_active = true
            p.deactivated_at = null
            p.activated_at = todayISO()
          }
        })
        toast('Programa reativado.', 'info')
      },
      assignProgram: (customerId, programId) => {
        update((d) => {
          const existing = d.cards.find((c) => c.customer_id === customerId)
          if (existing) {
            // troca de programa zera as cartelas
            existing.program_id = programId
            existing.lines = []
          } else {
            d.cards.push({ id: uid('l'), customer_id: customerId, program_id: programId, lines: [] })
          }
        })
        toast('Programa atribuído ao cliente.')
      },

      markStamp: (customerId, itemId) => {
        update((d) => {
          const card = d.cards.find((c) => c.customer_id === customerId)
          if (!card) return // precisa estar atribuído a um programa
          const program = d.programs.find((p) => p.id === card.program_id)
          if (!program) return
          let line = card.lines.find((l) => l.item_id === itemId && !l.redeemed_at)
          if (!line) {
            const fresh: CartelaLine = {
              id: uid('ln'),
              item_id: itemId,
              stamps: [],
              redeemed_at: null,
              redeemed_by: null,
            }
            card.lines.push(fresh)
            line = fresh
          }
          if (line.stamps.length < program.points_required) {
            line.stamps.push({ at: nowISO(), by: CURRENT_USER })
          }
        })
        toast('Selo registrado.')
      },
      unmarkStamp: (customerId, itemId) => {
        update((d) => {
          const card = d.cards.find((c) => c.customer_id === customerId)
          const line = card?.lines.find((l) => l.item_id === itemId && !l.redeemed_at)
          if (line && line.stamps.length > 0) line.stamps.pop()
        })
        toast('Último selo desfeito.', 'info')
      },
      redeemCartela: (customerId, itemId) => {
        let ok = false
        update((d) => {
          const card = d.cards.find((c) => c.customer_id === customerId)
          if (!card) return
          const program = d.programs.find((p) => p.id === card.program_id)
          const line = card.lines.find((l) => l.item_id === itemId && !l.redeemed_at)
          if (program && line && line.stamps.length >= program.points_required) {
            line.redeemed_at = todayISO()
            line.redeemed_by = CURRENT_USER
            // abre uma nova cartela zerada do mesmo item
            card.lines.push({
              id: uid('ln'),
              item_id: itemId,
              stamps: [],
              redeemed_at: null,
              redeemed_by: null,
            })
            ok = true
          }
        })
        toast(ok ? 'Prêmio resgatado! Nova cartela aberta. 🍺' : 'Cartela ainda não está completa.', ok ? 'ok' : 'danger')
      },

      savePost: (post) => {
        update((d) => {
          const i = d.posts.findIndex((p) => p.id === post.id)
          if (i >= 0) d.posts[i] = post
          else d.posts.unshift({ ...post, id: uid('p') })
        })
        toast('Novidade guardada.')
      },
      deletePost: (id) => {
        update((d) => {
          d.posts = d.posts.filter((p) => p.id !== id)
        })
        toast('Novidade removida.', 'danger')
      },
      togglePublish: (id) => {
        let published = false
        update((d) => {
          const p = d.posts.find((x) => x.id === id)
          if (p) {
            p.status = p.status === 'published' ? 'draft' : 'published'
            published = p.status === 'published'
          }
        })
        toast(published ? 'Novidade publicada.' : 'Novidade despublicada.', 'info')
      },
      savePostCategory: (cat) => {
        update((d) => {
          const i = d.postCategories.findIndex((c) => c.id === cat.id)
          if (i >= 0) d.postCategories[i] = cat
          else d.postCategories.push(cat)
        })
        toast('Categoria guardada.')
      },
      deletePostCategory: (id) => {
        update((d) => {
          d.postCategories = d.postCategories.filter((c) => c.id !== id)
        })
        toast('Categoria removida.', 'danger')
      },

      saveItem: (item) => {
        update((d) => {
          const i = d.menu.findIndex((m) => m.id === item.id)
          if (i >= 0) d.menu[i] = item
          else d.menu.push({ ...item, id: uid('m') })
        })
        toast('Item do cardápio guardado.')
      },
      deleteItem: (id) => {
        update((d) => {
          d.menu = d.menu.filter((m) => m.id !== id)
        })
        toast('Item removido.', 'danger')
      },
      toggleItem: (id, field) => {
        update((d) => {
          const m = d.menu.find((x) => x.id === id)
          if (m) m[field] = !m[field]
        })
      },
      saveMenuCategory: (cat) => {
        update((d) => {
          const i = d.menuCategories.findIndex((c) => c.id === cat.id)
          if (i >= 0) d.menuCategories[i] = cat
          else d.menuCategories.push(cat)
        })
        toast('Categoria guardada.')
      },
      deleteMenuCategory: (id) => {
        update((d) => {
          d.menuCategories = d.menuCategories.filter((c) => c.id !== id)
        })
        toast('Categoria removida.', 'danger')
      },
      moveMenuCategory: (id, dir) => {
        update((d) => {
          const sorted = [...d.menuCategories].sort((a, b) => a.order - b.order)
          const idx = sorted.findIndex((c) => c.id === id)
          const j = idx + dir
          if (idx < 0 || j < 0 || j >= sorted.length) return
          const tmp = sorted[idx].order
          sorted[idx].order = sorted[j].order
          sorted[j].order = tmp
        })
      },
      saveMenuTag: (tag) => {
        update((d) => {
          const i = d.menuTags.findIndex((t) => t.id === tag.id)
          if (i >= 0) d.menuTags[i] = tag
          else d.menuTags.push(tag)
        })
        toast('Tag guardada.')
      },
      deleteMenuTag: (id) => {
        update((d) => {
          d.menuTags = d.menuTags.filter((t) => t.id !== id)
          // remove a tag dos itens que a usavam
          d.menu.forEach((m) => {
            m.tag_ids = m.tag_ids.filter((t) => t !== id)
          })
        })
        toast('Tag removida.', 'danger')
      },

      updateSettings: (patch) => {
        update((d) => Object.assign(d.settings, patch))
        toast('Configurações guardadas.')
      },

      inviteProfile: (name, email, r) => {
        update((d) => {
          d.profiles.push({
            id: uid('u'),
            name,
            email,
            role: r,
            is_active: true,
            last_login_at: null,
          })
        })
        toast(`Convite enviado para ${email}.`)
      },
      changeProfileRole: (id, r) => {
        update((d) => {
          const p = d.profiles.find((x) => x.id === id)
          if (!p) return
          if (p.role === 'owner' && r === 'staff' && activeOwners(d.profiles) <= 1) {
            return // guard: não rebaixar o último owner
          }
          p.role = r
        })
        toast('Papel do perfil atualizado.', 'info')
      },
      toggleProfileActive: (id) => {
        let blocked = false
        update((d) => {
          const p = d.profiles.find((x) => x.id === id)
          if (!p) return
          if (p.is_active && p.role === 'owner' && activeOwners(d.profiles) <= 1) {
            blocked = true
            return // guard: não desativar o último owner
          }
          p.is_active = !p.is_active
        })
        toast(
          blocked
            ? 'Não é possível desativar o último Owner ativo.'
            : 'Estado do perfil atualizado.',
          blocked ? 'danger' : 'info',
        )
      },
    }
  }, [data, role, toast])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
