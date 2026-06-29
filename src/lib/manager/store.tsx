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
  type Post,
  type MenuItem,
  type Settings,
  type Profile,
} from './mock'

function todayISO(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
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
  // fidelidade
  updateProgram: (patch: Partial<LoyaltyProgram>) => void
  addStamps: (cardId: string, qty: number) => void
  redeemReward: (cardId: string) => void
  // novidades
  savePost: (post: Post) => void
  deletePost: (id: string) => void
  togglePublish: (id: string) => void
  // cardapio
  saveItem: (item: MenuItem) => void
  deleteItem: (id: string) => void
  toggleItem: (id: string, field: 'is_active' | 'sold_out') => void
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

      updateProgram: (patch) => {
        update((d) => Object.assign(d.program, patch))
        toast('Programa de fidelidade atualizado.')
      },
      addStamps: (cardId, qty) => {
        update((d) => {
          const c = d.cards.find((x) => x.id === cardId)
          if (c) c.balance += qty
        })
        toast(`${qty} selo(s) registado(s).`)
      },
      redeemReward: (cardId) => {
        update((d) => {
          const c = d.cards.find((x) => x.id === cardId)
          if (c && c.balance >= d.program.points_required) {
            c.balance -= d.program.points_required
            c.rewards_redeemed += 1
          }
        })
        toast('Benefício resgatado! 🍺')
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
