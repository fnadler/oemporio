'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CouponButton } from './CouponModal'

/** Barra de navegação inferior (mobile/tablet ≤1024px). */
export function BottomNav() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const isMenu = pathname.startsWith('/cardapio')
  const isNov = pathname.startsWith('/novidades')

  return (
    <nav className="botnav">
      <Link className={isHome ? 'active' : ''} href="/">
        <svg viewBox="0 0 24 24">
          <path d="M3 11l9-7 9 7" />
          <path d="M5 10v10h14V10" />
        </svg>
        Início
      </Link>
      <Link className={isMenu ? 'active' : ''} href="/cardapio">
        <svg viewBox="0 0 24 24">
          <path d="M6 3v7a2 2 0 0 0 4 0V3" />
          <path d="M8 10v11" />
          <path d="M16 3c-1.6 0-3 1.9-3 4.5S14.4 12 16 12" />
          <path d="M16 3v18" />
        </svg>
        Cardápio
      </Link>
      <Link className={isNov ? 'active' : ''} href="/novidades">
        <svg viewBox="0 0 24 24">
          <path d="M12 3l2.6 5.7 6.2.6-4.7 4.2 1.4 6.1L12 16.8 6.5 19.6l1.4-6.1L3.2 9.3l6.2-.6z" />
        </svg>
        Novidades
      </Link>
      <Link href="/#visit">
        <svg viewBox="0 0 24 24">
          <path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        Visite-nos
      </Link>
      <CouponButton className="cta">
        <svg viewBox="0 0 24 24">
          <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a1.6 1.6 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a1.6 1.6 0 0 0 0-4z" />
          <path d="M15 6.5v11" />
        </svg>
        20% OFF
      </CouponButton>
    </nav>
  )
}
