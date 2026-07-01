'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

const MOBILE = '(max-width: 1023px)' // < lg

/**
 * Casca do Manager: menu lateral recolhível + topbar.
 * - Desktop (lg+): menu fixo ao lado, recolhível pelo botão da topbar.
 * - Tablet/mobile: menu vira drawer sobreposto com backdrop; recolhido por padrão.
 * A tela de login (/manager/login) é renderizada sem a casca.
 */
export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  // desktop-first: aberto no SSR (sem flash no computador); recolhe no tablet ao montar
  const [open, setOpen] = useState(true)

  useEffect(() => {
    if (window.matchMedia(MOBILE).matches) setOpen(false)
  }, [])

  const closeOnMobile = () => {
    if (window.matchMedia(MOBILE).matches) setOpen(false)
  }

  if (pathname === '/manager/login') return <>{children}</>

  return (
    <div className={`min-h-screen transition-[padding] duration-300 ${open ? 'lg:pl-72' : ''}`}>
      <Sidebar open={open} onClose={() => setOpen(false)} onNavigate={closeOnMobile} />

      {/* backdrop apenas no tablet/mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink2/50 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div className="flex flex-col min-h-screen">
        <Topbar onMenuToggle={() => setOpen((v) => !v)} />
        <main className="flex-1 mgr-scroll px-5 sm:px-7 py-6">{children}</main>
      </div>
    </div>
  )
}
