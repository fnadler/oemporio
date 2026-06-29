import { Fragment } from 'react'
import Link from 'next/link'
import { SiteNav } from '@/components/site/SiteNav'
import { CouponButton } from '@/components/site/CouponModal'

const MARQUEE = ['Dois Corvos', 'Letra', 'Fermentage', 'Locals Only', 'Equilibrew', 'Vista', 'Oitava Colina']

export default function HomePage() {
  return (
    <section className="page home" id="home">
      {/* ============ HERO ============ */}
      <div className="hero">
        <div
          className="hero-photo"
          style={{ backgroundImage: "url('/v2/img/ambiente-fachada-poente.jpg')" }}
        />
        <div className="hero-scrim" />
        <div className="hero-grain" />
        <SiteNav />
        <div className="hero-inner">
          <div className="hero-grid">
            <div>
              <span className="rotulo">
                Ericeira · <span className="pt-d">Portugal</span>
                <span className="pt-m">PT</span> · Craft Beer House
              </span>
              <h1>
                <span className="l1">Comfort Food &amp; Craft Beer</span>
                <span className="l2">
                  Beber, Comer,
                  <br />
                  Estar entre
                  <br />
                  <em>Amigos</em>.
                </span>
              </h1>
              <p className="hero-sub">
                Uma grande seleção de cervejas artesanais portuguesas, comida de conforto e o
                atendimento acolhedor que faz de Ericeira o nosso lugar favorito para um brinde.
              </p>
              <div className="hero-cta">
                <Link className="btn btn-accent" href="/cardapio">
                  Ver o cardápio →
                </Link>
                <CouponButton className="btn btn-ghost">Cadastre-se · 20% OFF</CouponButton>
              </div>
              <div className="hero-stat">
                <div className="s">
                  <div className="n">40+</div>
                  <div className="t">na torneira</div>
                </div>
                <div className="s">
                  <div className="n">100%</div>
                  <div className="t">locais &amp; artesanais</div>
                </div>
                <div className="s">
                  <div className="n">-20%</div>
                  <div className="t">no 1º cadastro</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ MARQUEE ============ */}
      <div className="marquee">
        <div className="track">
          {[0, 1].map((dup) =>
            MARQUEE.map((b) => (
              <Fragment key={`${dup}-${b}`}>
                <span>{b}</span>
                <span className="dot">✦</span>
              </Fragment>
            )),
          )}
        </div>
      </div>

      {/* ============ AMBIENTE ============ */}
      <section className="sec ambiente">
        <div className="wrap amb-grid">
          <div className="amb-imgs">
            <span className="rotulo lab">Desde 2024</span>
            <div className="big framed">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/v2/img/ambiente-balcao-tap.jpg" alt="Tirando uma cerveja no balcão do O Empório" />
            </div>
            <div className="small framed">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/v2/img/ambiente-balcao-torneiras.jpg" alt="Balcão e torneiras do O Empório" />
            </div>
          </div>
          <div className="amb-text">
            <span className="kicker">O ambiente</span>
            <h2>
              Aconchegante,
              <br />
              familiar &amp; sempre
              <br />
              com boa cerveja.
            </h2>
            <p>
              O Empório nasceu do gosto por cervejas bem feitas e mesas que juntam gente. Madeira,
              luz quente e uma estante de rótulos locais — é o tipo de lugar onde se entra para uma e
              se fica para a noite toda.
            </p>
            <div className="feat-row">
              <div className="f">
                <div className="ic">
                  <svg viewBox="0 0 24 24">
                    <path d="M7 3h10l-1.2 17.2a1 1 0 0 1-1 .8H9.2a1 1 0 0 1-1-.8z" />
                    <path d="M7.5 8.5h9" />
                  </svg>
                </div>
                <div className="tx">
                  <h4>Curadoria local</h4>
                  <p>Rótulos de pequenas cervejarias portuguesas, sempre rodando.</p>
                </div>
              </div>
              <div className="f">
                <div className="ic">
                  <svg viewBox="0 0 24 24">
                    <path d="M3.5 11.5h17a8.5 8.5 0 0 1-17 0z" />
                    <path d="M2.5 11.5h19" />
                    <path d="M9 7.5c0-1.2-1-1.2-1-2.4S9 3.9 9 2.7" />
                    <path d="M13 7.5c0-1.2-1-1.2-1-2.4S13 3.9 13 2.7" />
                  </svg>
                </div>
                <div className="tx">
                  <h4>Comfort food</h4>
                  <p>Cozinha de conforto para acompanhar cada cerveja.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ NOVIDADES (preview) ============ */}
      <section className="sec nov" id="nov">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="kicker">Sempre acontecendo</span>
              <h2>
                Novidades
                <br />
                &amp; agenda
              </h2>
            </div>
            <div>
              <p>
                Mostras de cerveja, workshops cervejeiros, eventos da região e avisos do pub —
                montados na máscara da marca e atualizados pela equipe.
              </p>
              <p style={{ marginTop: 14 }}>
                <Link className="seelink" href="/novidades">
                  Ver todas →
                </Link>
              </p>
            </div>
          </div>
          <div className="nov-grid">
            <Link className="artcard" href="/novidades/cervejaria-do-mes-dois-corvos">
              <div className="ph">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/v2/img/ambiente-balcao-tap.jpg" alt="" />
              </div>
              <div className="scrim" />
              <div className="frame" />
              <div className="top">
                <span className="rotulo brick">Mostra de cerveja</span>
              </div>
              <div className="datechip">
                SET<b>14</b>
              </div>
              <div className="bottom">
                <div className="sup">Cervejaria do mês</div>
                <h4>Dois Corvos</h4>
                <div className="sb">4 rótulos na torneira</div>
              </div>
            </Link>
            <Link className="artcard" href="/novidades/workshop-prova-as-cegas">
              <div className="ph g2">
                <span className="em">🍻</span>
              </div>
              <div className="scrim" />
              <div className="frame" />
              <div className="top">
                <span className="rotulo coral">Workshop cervejeiro</span>
              </div>
              <div className="datechip">
                SET<b>21</b>
              </div>
              <div className="bottom">
                <div className="sup">Harmonização guiada</div>
                <h4>
                  Prova
                  <br />
                  às cegas
                </h4>
                <div className="sb">vagas limitadas</div>
              </div>
              <div className="arrow">→</div>
            </Link>
            <Link className="artcard" href="/novidades/beericeira-2025">
              <div className="ph g3">
                <span className="em">🏄</span>
              </div>
              <div className="scrim" />
              <div className="frame" />
              <div className="top">
                <span className="rotulo">Evento · Ericeira</span>
              </div>
              <div className="datechip">
                OUT<b>05</b>
              </div>
              <div className="bottom">
                <div className="sup">Estamos no</div>
                <h4>
                  BEERiceira
                  <br />
                  2025
                </h4>
                <div className="sb">prove as collabs</div>
              </div>
              <div className="arrow">→</div>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ INSTAGRAM ============ */}
      <section className="sec insta">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="kicker">@oemporio.ericeira</span>
              <h2>
                No nosso
                <br />
                Instagram
              </h2>
            </div>
            <p>Feed integrado e atualizado automaticamente com as publicações do pub.</p>
          </div>
          <div className="ig-grid">
            {[
              'ambiente-balcao-tap.jpg',
              'comida-costela-na-cerveja.jpg',
              'ambiente-fachada-noite.jpg',
              'comida-kafta.jpg',
              'ambiente-balcao-torneiras.jpg',
              'comida-peru-panado.jpg',
            ].map((f) => (
              <div className="t" key={f}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/v2/img/${f}`} alt="" />
                <div className="ov">♡</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ VISITE-NOS ============ */}
      <section className="sec visit" id="visit">
        <div className="wrap visit-grid">
          <div className="map">
            <div className="lines" />
            <div className="road" style={{ top: '30%', left: 0, right: 0, height: 8 }} />
            <div className="road" style={{ top: 0, bottom: 0, left: '48%', width: 8 }} />
            <div className="road" style={{ top: '62%', left: 0, right: 0, height: 6 }} />
            <div className="pin">
              <div className="dot" />
              <div className="lab">O Empório</div>
            </div>
          </div>
          <div className="visit-info">
            <span className="kicker">Visite-nos</span>
            <h2>
              No coração
              <br />
              de Ericeira.
            </h2>
            <div className="addr">📍 Rua de Sto. António 12B, Ericeira, Portugal</div>
            <div className="hours">
              <div className="row">
                <b>Seg — Qui</b>
                <span className="open">16H00 — 00H00</span>
              </div>
              <div className="row">
                <b>Sex — Sáb</b>
                <span className="open">16H00 — 02H00</span>
              </div>
              <div className="row">
                <b>Domingo</b>
                <span className="open">16H00 — 00H00</span>
              </div>
            </div>
            <div className="grating">
              <div className="gnum">4,9</div>
              <div className="gmeta">
                <div className="gstars">★★★★★</div>
                <div className="glabel">Avaliações no Google · Ericeira</div>
              </div>
              <a className="gcta" href="#">
                Ver no Maps →
              </a>
            </div>
            <div className="reviews">
              <div className="rev">
                <div className="st">★★★★★</div>
                <p>&quot;Melhor seleção de craft da Ericeira e um staff impecável.&quot;</p>
                <div className="who">— Google · Tiago M.</div>
              </div>
              <div className="rev">
                <div className="st">★★★★★</div>
                <p>&quot;Ambiente caloroso, cervejas top e comida deliciosa.&quot;</p>
                <div className="who">— Google · Sofia R.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LEAD BAND ============ */}
      <section className="lead" id="lead">
        <div className="wrap">
          <div>
            <h2>
              <span className="drop">Boas-vindas</span>Ganhe 20% na
              <br />
              primeira visita.
            </h2>
            <p>
              Cadastre-se e receba um voucher de boas-vindas direto no seu e-mail. Boa cerveja merece
              um bom começo.
            </p>
          </div>
          <div className="lead-cta">
            <CouponButton className="btn lead-btn">Quero meus 20% OFF →</CouponButton>
            <div className="fine">
              Cadastro rápido. Voucher único para a primeira compra, sem spam.
            </div>
          </div>
        </div>
        <div className="big-o">O</div>
      </section>
    </section>
  )
}
