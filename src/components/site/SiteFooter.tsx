import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-top">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="word"
              src="/v2/img/logo-oemporio-branco.png"
              alt="O Empório — Comfort Food & Craft Beer"
            />
            <p>Cervejas locais e boa companhia, no centro da Ericeira.</p>
          </div>
          <div>
            <h5>Navegar</h5>
            <Link href="/">Início</Link>
            <Link href="/cardapio">Cardápio</Link>
            <Link href="/novidades">Novidades</Link>
            <Link href="/#visit">Visite-nos</Link>
          </div>
          <div>
            <h5>Contato</h5>
            <a href="mailto:mkt@oemporio.pt">mkt@oemporio.pt</a>
            <a href="/#visit">Rua de Sto. António 12B</a>
            <a href="/#visit">Ericeira, Portugal</a>
          </div>
          <div>
            <h5>Siga</h5>
            <a href="#">Instagram</a>
            <a href="#">Untappd</a>
            <a href="#">Google Maps</a>
          </div>
        </div>
        <div className="foot-bot">
          <span>© 2025 O Empório · Ericeira</span>
          <span>Conceito de site · FDN Design</span>
        </div>
      </div>
    </footer>
  )
}
