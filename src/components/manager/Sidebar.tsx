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

export function Sidebar() {
  const pathname = usePathname()
  const { role } = useManager()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const itemCls = (active: boolean) =>
    `font-display text-sm tracking-wide px-5 py-3 border-l-2 transition-colors ${
      active
        ? 'bg-white/10 text-paper border-paper'
        : 'text-g400 border-transparent hover:text-paper hover:bg-white/5'
    }`

  return (
    <aside className="w-60 shrink-0 bg-ink2 text-paper flex flex-col min-h-screen sticky top-0">
      <div className="px-5 py-6 border-b border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/v2/img/logo-oemporio-branco.png"
          alt="O Empório"
          className="h-9 w-auto"
        />
        <div className="font-display text-[10px] tracking-widest text-g500 mt-3">
          Manager · CRM
        </div>
      </div>

      <nav className="flex flex-col py-3">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={itemCls(isActive(n.href, n.exact))}>
            {n.label}
          </Link>
        ))}

        <div className="px-5 pt-5 pb-2 font-display text-[10px] tracking-widest text-g600">
          Administração
        </div>
        {OWNER_NAV.map((n) =>
          role === 'owner' ? (
            <Link key={n.href} href={n.href} className={itemCls(isActive(n.href))}>
              {n.label}
            </Link>
          ) : (
            <span
              key={n.href}
              className="font-display text-sm tracking-wide px-5 py-3 border-l-2 border-transparent text-g600/60 flex items-center justify-between cursor-not-allowed"
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
        <Link href="/manager/login" className="text-xs text-g500 hover:text-paper mt-2 inline-block">
          Sair
        </Link>
      </div>
    </aside>
  )
}
