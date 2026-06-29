import Link from 'next/link'
import { LangToggle } from './LangToggle'
import { CouponButton } from './CouponModal'

/**
 * Nav-bar (desktop) da v2. O item ativo é destacado pelo CSS conforme a
 * classe de página no wrapper (.home / .menu / .novp).
 */
export function SiteNav() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link className="brand" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="lockup"
            src="/v2/img/logo-oemporio-branco.png"
            alt="O Empório — Comfort Food & Craft Beer"
          />
        </Link>
        <div className="nav-links">
          <Link href="/">Início</Link>
          <Link href="/cardapio">Cardápio</Link>
          <Link href="/novidades">Novidades</Link>
          <Link href="/#visit">Visite-nos</Link>
        </div>
        <div className="nav-right">
          <LangToggle />
          <CouponButton className="btn btn-accent">20% OFF</CouponButton>
        </div>
      </div>
    </nav>
  )
}
