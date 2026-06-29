import type { Metadata } from 'next'
import { Fragment } from 'react'
import { SiteNav } from '@/components/site/SiteNav'
import { CategoryNav } from '@/components/site/CategoryNav'

export const metadata: Metadata = {
  title: 'O Empório — Cardápio',
}

const CERVEJAS_URL = 'https://oemporio.pt/cervejas' // placeholder — substituir pela carta real

type Tag = { label: string; cls: 'local' | 'new' | 'guest' | 'tap' | 'soldout' }
interface TapItem {
  n: string
  name: string
  tags?: Tag[]
  meta: string
  note: string
  price: string
  unit: string
  off?: boolean
}

const TAPS: TapItem[] = [
  {
    n: '01', name: 'Pale Ale da Casa',
    tags: [{ label: 'Local', cls: 'local' }, { label: 'On Tap', cls: 'tap' }],
    meta: 'LETRA · VILA VERDE — 5,0% ABV · 30 IBU',
    note: 'Leve, floral e fácil de beber. O ponto de partida perfeito.',
    price: '€4,50', unit: '/ 33cl',
  },
  {
    n: '02', name: 'Sea Salt Gose',
    tags: [{ label: 'Novidade', cls: 'new' }, { label: 'Local', cls: 'local' }],
    meta: 'FERMENTAGE · PORTO — 4,3% ABV · 12 IBU',
    note: 'Cítrica e levemente salgada, inspirada nas ondas da Ericeira.',
    price: '€5,00', unit: '/ 33cl',
  },
  {
    n: '03', name: 'Imperial Stout Barrel-Aged',
    tags: [{ label: 'Convidada', cls: 'guest' }],
    meta: 'VISTA · ERICEIRA — 9,5% ABV · 60 IBU',
    note: 'Encorpada, com chocolate, café e um toque de madeira. Para saborear devagar.',
    price: '€7,50', unit: '/ 25cl',
  },
  {
    n: '04', name: 'Hazy NEIPA Tropical', off: true,
    tags: [{ label: 'Esgotada', cls: 'soldout' }],
    meta: 'EQUILIBREW · SINTRA — 6,5% ABV · 40 IBU',
    note: 'Turva e suculenta, explosão de manga e maracujá. Volta em breve!',
    price: '€6,00', unit: '/ 33cl',
  },
  {
    n: '05', name: 'Lager Pilsner Clássica',
    tags: [{ label: 'Local', cls: 'local' }],
    meta: 'LOCALS ONLY · ERICEIRA — 4,8% ABV · 25 IBU',
    note: 'Crocante, dourada e refrescante. A cerveja de todos os dias.',
    price: '€4,00', unit: '/ 33cl',
  },
]

const VINHOS: TapItem[] = [
  {
    n: '01', name: 'Vinho Verde da Casa', tags: [{ label: 'Branco', cls: 'local' }],
    meta: 'LOUREIRO · MINHO — fresco & cítrico',
    note: 'Leve e ligeiramente petillant. Perfeito para começar a noite.',
    price: '€4,00', unit: 'copo · €16 garrafa',
  },
  {
    n: '02', name: 'Tinto Alentejo', tags: [{ label: 'Tinto', cls: 'local' }],
    meta: 'ARAGONEZ · TRINCADEIRA — encorpado',
    note: 'Frutado e redondo, com taninos macios. Vai bem com a costela.',
    price: '€4,50', unit: 'copo · €19 garrafa',
  },
  {
    n: '03', name: 'Rosé da Ribeirinha', tags: [{ label: 'Rosé', cls: 'local' }],
    meta: 'QUINTA DA RIBEIRINHA · LISBOA',
    note: 'Seco, fresco e aromático. O favorito do fim de tarde.',
    price: '€4,50', unit: 'copo · €18 garrafa',
  },
  {
    n: '04', name: 'Branco Douro', tags: [{ label: 'Branco', cls: 'local' }],
    meta: 'RABIGATO · VIOSINHO — mineral',
    note: 'Estruturado e elegante, com final longo.',
    price: '€5,00', unit: 'copo · €22 garrafa',
  },
]

const BEBIDAS: TapItem[] = [
  {
    n: '01', name: 'Águas & Refrigerantes', tags: [{ label: 'Sem álcool', cls: 'local' }],
    meta: 'ÁGUA · COLA · LIMONADA DA CASA',
    note: 'Limonada caseira com hortelã e gengibre.',
    price: '€2,00', unit: 'a partir de',
  },
  {
    n: '02', name: 'Kombucha Artesanal', tags: [{ label: 'Novidade', cls: 'new' }],
    meta: 'FERMENTADO LOCAL — gengibre & limão',
    note: 'Refrescante e probiótica, opção leve sem álcool.',
    price: '€4,00', unit: '/ 33cl',
  },
  {
    n: '03', name: 'Café & Espresso',
    meta: 'TORRA DE ESPECIALIDADE',
    note: 'Espresso, duplo ou abatanado para fechar a refeição.',
    price: '€1,50', unit: 'a partir de',
  },
  {
    n: '04', name: 'Gin Tónico', tags: [{ label: 'Destilado', cls: 'local' }],
    meta: 'GINS PREMIUM — perguntar ao staff',
    note: 'Seleção de gins com tónicas e botânicos.',
    price: '€7,00', unit: 'a partir de',
  },
  {
    n: '05', name: 'Whisky & Destilados', tags: [{ label: 'Premium', cls: 'guest' }],
    meta: 'SINGLE MALT · RUM · CONHAQUE',
    note: 'Para saborear devagar, ao balcão.',
    price: '€6,00', unit: 'a partir de',
  },
]

interface Food {
  img: string
  rot: string
  brick?: boolean
  price: string
  title: string[]
  desc: string
}

const FOODS: Food[] = [
  { img: 'comida-burger-beef.jpg', rot: 'New on the Menu', brick: true, price: '€13,50', title: ['Burger', 'BEEF'], desc: 'Hambúrguer de vaca no pão da casa com a marca "O", bacon e queijo derretido.' },
  { img: 'comida-costela-na-cerveja.jpg', rot: 'No Cardápio', price: '€13,00', title: ['Costela', 'na Cerveja'], desc: 'Costela desfiada, cozida lentamente na nossa cerveja, servida com pão.' },
  { img: 'comida-kafta.jpg', rot: 'No Cardápio', price: '€11,00', title: ['Kafta', 'do Empório'], desc: 'Espetadas de kafta grelhada sobre rúcula, com queijo fresco.' },
  { img: 'comida-provoleta.jpg', rot: 'No Cardápio', price: '€9,00', title: ['Provoleta'], desc: 'Provolone gratinado com tomate confitado e orégãos. Para partilhar.' },
  { img: 'comida-3-porquinhos.jpg', rot: 'New on the Menu', brick: true, price: '€8,50', title: ['3 Porquinhos'], desc: 'Almôndegas de porco mal-passado com cebola roxa em pickles.' },
  { img: 'comida-peru-panado.jpg', rot: 'No Cardápio', price: '€9,50', title: ['Peru', 'Panado'], desc: 'Tiras de peru panadas e crocantes, com maionese de ervas da casa.' },
]

function TapRow({ t }: { t: TapItem }) {
  return (
    <div className={`tap${t.off ? ' off' : ''}`}>
      <div className="tn">{t.n}</div>
      <div className="info">
        <h4>
          {t.name}{' '}
          {t.tags?.map((tag) =>
            tag.cls === 'soldout' ? (
              <span className="soldout" key={tag.label}>
                {tag.label}
              </span>
            ) : (
              <span className={`minitag ${tag.cls}`} key={tag.label}>
                {tag.label}
              </span>
            ),
          )}
        </h4>
        <div className="meta">{t.meta}</div>
        <div className="note">{t.note}</div>
      </div>
      <div className="price">
        <div className="v">{t.price}</div>
        <div className="u">{t.unit}</div>
      </div>
    </div>
  )
}

export default function CardapioPage() {
  return (
    <section className="page menu" id="menu">
      <div className="menu-hero">
        <div className="grain" />
        <div
          className="menu-hero-o"
          style={{ backgroundImage: "url('/v2/img/simbolo-o-branco.svg')" }}
        />
        <SiteNav />
        <div className="wrap">
          <span className="rotulo">Na torneira &amp; na cozinha</span>
          <h1>
            <span className="drop">O nosso</span>Cardá<em>pio</em>
          </h1>
          <p className="sub">
            Cervejas artesanais rotativas e comfort food para acompanhar. A carta muda conforme o que
            há de melhor — pergunte ao staff pelas novidades do dia.
          </p>
        </div>
      </div>

      <CategoryNav />

      {/* ===== TAPS ===== */}
      <section className="menu-sec" id="taps">
        <div className="wrap">
          <div className="sectitle">
            <h2>Taps</h2>
            <div className="line" />
          </div>
          <p className="secsub">
            As nossas torneiras giram a toda a hora — seleção rotativa de cervejarias portuguesas.
          </p>

          <div className="featbeer">
            <div className="frame" />
            <span className="rotulo coral">Cervejaria do Mês</span>
            <div className="glass">🍺</div>
            <div className="mid">
              <div className="brew">Dois Corvos · Lisboa</div>
              <h3>Finisterra · West Coast IPA</h3>
              <p>
                Amarga na medida, com cítricos do lúpulo americano e final seco. A queridinha da casa
                neste mês.
              </p>
            </div>
            <div className="specs">
              <div className="pr">€6,50</div>
              <div className="ab">6,2% ABV · 55 IBU · 40cl</div>
            </div>
          </div>

          <div className="taplist">
            {TAPS.map((t) => (
              <TapRow t={t} key={t.n} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== DESTAQUE CERVEJAS ===== */}
      <section className="menu-sec" id="cervejas-hl">
        <div className="wrap">
          <div className="beerhi">
            <div
              className="beerhi-img"
              style={{ backgroundImage: "url('/v2/img/cervejas-freezer.jpg')" }}
            />
            <div className="beerhi-txt">
              <span className="rotulo">Carta de cervejas</span>
              <h3>Uma lista que está sempre a mudar</h3>
              <p>
                Dezenas de rótulos em garrafa e lata, com novidades toda a semana. A nossa carta
                completa de cervejas vive online e está sempre atualizada.
              </p>
              <a className="btn beerhi-btn" href={CERVEJAS_URL} target="_blank" rel="noopener noreferrer">
                Ver carta de cervejas online ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COMIDAS ===== */}
      <section className="menu-sec" id="comidas">
        <div className="wrap">
          <div className="sectitle">
            <h2>Comidas</h2>
            <div className="line" />
          </div>
          <p className="secsub">
            Comfort food para dividir — cada prato montado na máscara de cardápio da marca.
          </p>
          <div className="food-grid">
            {FOODS.map((f) => (
              <article className="fcard" key={f.title.join(' ')}>
                <div className="ph">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/v2/img/${f.img}`} alt={f.title.join(' ')} />
                </div>
                <div className="scrim" />
                <div className="frame" />
                <span className={`rotulo${f.brick ? ' brick' : ''} rot`}>{f.rot}</span>
                <div className="price">{f.price}</div>
                <div className="bottom">
                  <h4>
                    {f.title.map((line, i) => (
                      <Fragment key={line}>
                        {i > 0 && <br />}
                        {line}
                      </Fragment>
                    ))}
                  </h4>
                  <p>{f.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== VINHOS ===== */}
      <section className="menu-sec" id="vinhos">
        <div className="wrap">
          <div className="sectitle">
            <h2>Vinhos</h2>
            <div className="line" />
          </div>
          <p className="secsub">Uma curadoria de vinhos portugueses para variar do lúpulo.</p>
          <div className="taplist">
            {VINHOS.map((t) => (
              <TapRow t={t} key={t.n} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== BEBIDAS ===== */}
      <section className="menu-sec" id="bebidas">
        <div className="wrap">
          <div className="sectitle">
            <h2>Bebidas</h2>
            <div className="line" />
          </div>
          <p className="secsub">Sem álcool, cafés e destilados para completar a mesa.</p>
          <div className="taplist">
            {BEBIDAS.map((t) => (
              <TapRow t={t} key={t.n} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== FIDELIDADE ===== */}
      <section className="menu-sec">
        <div className="wrap">
          <div className="loyal">
            <div className="frame" />
            <div className="mid">
              <span className="kicker">Cartão Fidelidade</span>
              <h2>
                A cada 10 cervejas,
                <br />a 11ª é nossa.
              </h2>
              <p>
                Junte selos a cada cerveja e troque por uma grátis. A regra é configurável pelo pub —
                produto, quantidade e prêmio definidos pela casa.
              </p>
            </div>
            <div className="stamps">
              {Array.from({ length: 7 }).map((_, i) => (
                <div className="sp full" key={`f${i}`}>
                  🍺
                </div>
              ))}
              {Array.from({ length: 3 }).map((_, i) => (
                <div className="sp" key={`e${i}`}>
                  🍺
                </div>
              ))}
              <div className="sp free">GRÁTIS</div>
            </div>
          </div>
        </div>
      </section>
    </section>
  )
}
