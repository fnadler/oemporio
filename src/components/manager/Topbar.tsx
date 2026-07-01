'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useManager } from '@/lib/manager/store'

const TITLES: Record<string, string> = {
  '/manager': 'Dashboard',
  '/manager/contatos': 'Contatos',
  '/manager/vouchers': 'Vouchers',
  '/manager/fidelidade': 'Cartão Fidelidade',
  '/manager/novidades': 'Novidades',
  '/manager/cardapio': 'Cardápio',
  '/manager/configuracoes': 'Configurações',
  '/manager/perfis': 'Gestão de Perfis',
  '/manager/perfil': 'Meu perfil',
}

export function Topbar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { role, setRole, user } = useManager()
  const [menuOpen, setMenuOpen] = useState(false)

  const initials = user
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)

  const title =
    TITLES[pathname] ??
    Object.entries(TITLES).find(([k]) => k !== '/manager' && pathname.startsWith(k))?.[1] ??
    'Manager'

  return (
    <header className="sticky top-0 z-30 bg-paper/95 backdrop-blur border-b border-g200 px-4 sm:px-7 py-2.5 flex items-center gap-3 sm:gap-4">
      {/* alterna o menu lateral (recolhível) — funciona no tablet e no desktop */}
      <button
        type="button"
        onClick={onMenuToggle}
        aria-label="Alternar menu"
        className="w-11 h-11 -ml-1 shrink-0 flex items-center justify-center text-ink hover:bg-g200 transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </svg>
      </button>

      <h2 className="font-display text-lg text-ink hidden sm:block">{title}</h2>

      <div className="w-40 sm:w-64 shrink">
        <input
          type="search"
          placeholder="Buscar…"
          className="w-full border border-g300 bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-ink"
        />
      </div>

      {/* seletor de papel (demonstração) — empurra o cluster da direita p/ o fim */}
      <div className="flex border border-g300 overflow-hidden shrink-0 ml-auto">
        {(['owner', 'staff'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`font-display text-xs tracking-wider min-h-11 px-3 sm:px-4 transition-colors ${
              role === r ? 'bg-ink text-paper' : 'bg-surface text-g600 hover:text-ink'
            }`}
          >
            {r === 'owner' ? 'Owner' : 'Staff'}
          </button>
        ))}
      </div>

      {/* bloco do usuário — à direita, abre menu de contexto */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="flex items-center gap-2.5 min-h-11 pl-1 pr-1 hover:bg-g200 transition-colors"
        >
          <div className="w-10 h-10 bg-ink text-paper font-display flex items-center justify-center text-sm">
            {initials}
          </div>
          <div className="hidden md:block leading-tight text-left">
            <div className="font-display text-xs text-ink">{user}</div>
            <div className="text-[11px] text-g500">{role === 'owner' ? 'Owner' : 'Staff'}</div>
          </div>
          <svg viewBox="0 0 12 12" className="w-3 h-3 text-g500 mr-1" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M2.5 4.5 L6 8 L9.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} aria-hidden />
            <div
              role="menu"
              className="absolute right-0 top-full mt-1 z-50 w-52 bg-surface border border-g300 shadow-lg py-1"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false)
                  router.push('/manager/perfil')
                }}
                className="w-full text-left px-4 min-h-11 text-sm text-ink hover:bg-subtle transition-colors"
              >
                Meu perfil
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false)
                  router.push('/manager/login')
                }}
                className="w-full text-left px-4 min-h-11 text-sm text-danger hover:bg-subtle transition-colors"
              >
                Sair
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
