'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useManager } from '@/lib/manager/store'

const NAV = [
  { href: '/manager', label: 'Dashboard', exact: true },
  { href: '/manager/contatos', label: 'Contatos' },
  { href: '/manager/vouchers', label: 'Vouchers' },
  { href: '/manager/fidelidade', label: 'Fidelidade' },
  { href: '/manager/novidades', label: 'Novidades' },
  { href: '/manager/cardapio', label: 'Cardápio' },
]

const OWNER_NAV = [
  { href: '/manager/configuracoes', label: 'Configurações' },
  { href: '/manager/perfis', label: 'Perfis' },
]

export function Sidebar({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean
  onClose: () => void
  onNavigate: () => void
}) {
  const pathname = usePathname()
  const { role } = useManager()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const itemCls = (active: boolean) =>
    `font-display text-sm tracking-wide flex items-center min-h-12 px-5 border-l-2 transition-colors ${
      active
        ? 'bg-white/10 text-paper border-paper'
        : 'text-g400 border-transparent hover:text-paper hover:bg-white/5'
    }`

  return (
    <aside
      className={`fixed top-0 left-0 z-50 h-screen w-72 bg-ink2 text-paper flex flex-col transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
      aria-hidden={!open}
    >
      <div className="px-5 py-6 border-b border-white/10 flex items-start justify-between gap-2">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/v2/img/logo-oemporio-branco.png" alt="O Empório" className="h-9 w-auto" />
          <div className="font-display text-[10px] tracking-widest text-g500 mt-3">Manager · CRM</div>
        </div>
        {/* recolher — útil no toque; no desktop o botão da topbar também recolhe */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Recolher menu"
          className="lg:hidden w-11 h-11 -mr-2 -mt-1 flex items-center justify-center text-g400 hover:text-paper transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <nav className="flex flex-col py-3 flex-1 overflow-y-auto mgr-scroll">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            onClick={onNavigate}
            className={itemCls(isActive(n.href, n.exact))}
          >
            {n.label}
          </Link>
        ))}

        <div className="px-5 pt-5 pb-2 font-display text-[10px] tracking-widest text-g600">
          Administração
        </div>
        {OWNER_NAV.map((n) =>
          role === 'owner' ? (
            <Link
              key={n.href}
              href={n.href}
              onClick={onNavigate}
              className={itemCls(isActive(n.href))}
            >
              {n.label}
            </Link>
          ) : (
            <span
              key={n.href}
              className="font-display text-sm tracking-wide flex items-center min-h-12 px-5 border-l-2 border-transparent text-g600/60 justify-between cursor-not-allowed"
              title="Apenas Owner"
            >
              {n.label} <span className="text-xs">🔒</span>
            </span>
          ),
        )}
      </nav>

      <div className="mt-auto px-5 py-4 border-t border-white/10">
        <div className="font-display text-[10px] tracking-widest text-warn">
          Protótipo · dados fictícios
        </div>
        <Link
          href="/manager/login"
          onClick={onNavigate}
          className="inline-flex items-center min-h-11 text-xs text-g500 hover:text-paper mt-1"
        >
          Sair
        </Link>
      </div>
    </aside>
  )
}
