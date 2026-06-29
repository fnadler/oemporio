'use client'

import { usePathname } from 'next/navigation'
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
}

export function Topbar() {
  const pathname = usePathname()
  const { role, setRole, user } = useManager()

  const title =
    TITLES[pathname] ??
    Object.entries(TITLES).find(([k]) => k !== '/manager' && pathname.startsWith(k))?.[1] ??
    'Manager'

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b border-g200 px-7 py-3.5 flex items-center gap-4">
      <h2 className="font-display text-lg text-ink mr-2">{title}</h2>

      <div className="flex-1 max-w-sm">
        <input
          type="search"
          placeholder="Buscar…"
          className="w-full border border-g300 bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-ink"
        />
      </div>

      {/* seletor de papel (demonstração) */}
      <div className="flex border border-g300 overflow-hidden">
        {(['owner', 'staff'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`font-display text-xs tracking-wider px-3 py-2 transition-colors ${
              role === r ? 'bg-ink text-paper' : 'bg-surface text-g600 hover:text-ink'
            }`}
          >
            {r === 'owner' ? 'Owner' : 'Staff'}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2.5 pl-2">
        <div className="w-9 h-9 bg-ink text-paper font-display flex items-center justify-center text-sm">
          {user.split(' ').map((p) => p[0]).join('').slice(0, 2)}
        </div>
        <div className="hidden sm:block leading-tight">
          <div className="font-display text-xs text-ink">{user}</div>
          <div className="text-[11px] text-g500">{role === 'owner' ? 'Owner' : 'Staff'}</div>
        </div>
      </div>
    </header>
  )
}
