import type { Metadata } from 'next'
import { SiteNav } from '@/components/site/SiteNav'
import { CategoryNav } from '@/components/site/CategoryNav'
import { createPublicClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'O Empório — Cardápio',
}

export const revalidate = 60 // conteúdo vem do Manager — atualiza a cada 1 min

interface DbCategory {
  id: string
  slug: string | null
  name_pt: string
  with_photo: boolean
  sort_order: number
}
interface DbTag {
  id: string
  label_pt: string
  variant: 'local' | 'new' | 'guest' | 'tap'
}
interface DbItem {
  id: string
  category_id: string
  name_pt: string
  description_pt: string
  price: number
  price_unit: string
  meta: string
  sold_out: boolean
  is_new: boolean
  is_featured: boolean
  photo_path: string | null
}

function formatPrice(n: number): string {
  return `€${n.toFixed(2).replace('.', ',')}`
}

async function getMenu() {
  const supabase = createPublicClient()
  const [{ data: categories }, { data: items }, { data: tags }, { data: itemTags }] = await Promise.all([
    supabase.from('menu_categories').select('id, slug, name_pt, with_photo, sort_order').eq('is_active', true).order('sort_order'),
    supabase.from('menu_items').select('id, category_id, name_pt, description_pt, price, price_unit, meta, sold_out, is_new, is_featured, photo_path').eq('is_active', true),
    supabase.from('menu_tags').select('id, label_pt, variant'),
    supabase.from('menu_item_tags').select('item_id, tag_id'),
  ])

  const tagById = new Map((tags ?? []).map((t) => [t.id, t as DbTag]))
  const tagsByItem = new Map<string, DbTag[]>()
  for (const link of itemTags ?? []) {
    const tag = tagById.get(link.tag_id)
    if (!tag) continue
    const list = tagsByItem.get(link.item_id) ?? []
    list.push(tag)
    tagsByItem.set(link.item_id, list)
  }

  const itemsByCategory = new Map<string, DbItem[]>()
  for (const item of (items ?? []) as DbItem[]) {
    const list = itemsByCategory.get(item.category_id) ?? []
    list.push(item)
    itemsByCategory.set(item.category_id, list)
  }

  return {
    categories: (categories ?? []) as DbCategory[],
    itemsByCategory,
    tagsByItem,
  }
}

function TagBadge({ tag }: { tag: DbTag }) {
  return <span className={`minitag ${tag.variant}`}>{tag.label_pt}</span>
}

function TapRow({ item, tags }: { item: DbItem; tags: DbTag[] }) {
  return (
    <div className={`tap${item.sold_out ? ' off' : ''}`}>
      <div className="info">
        <h4>
          {item.name_pt} {tags.map((t) => <TagBadge key={t.id} tag={t} />)}
          {item.sold_out && <span className="soldout">Esgotada</span>}
        </h4>
        {item.meta && <div className="meta">{item.meta}</div>}
        <div className="note">{item.description_pt}</div>
      </div>
      <div className="price">
        <div className="v">{formatPrice(item.price)}</div>
        <div className="u">{item.price_unit}</div>
      </div>
    </div>
  )
}

function FeaturedBeer({ item }: { item: DbItem }) {
  const [brewery, specs] = item.meta.split(' — ')
  return (
    <div className="featbeer">
      <div className="frame" />
      <span className="rotulo coral">Cervejaria do Mês</span>
      <div className="glass">🍺</div>
      <div className="mid">
        {brewery && <div className="brew">{brewery}</div>}
        <h3>{item.name_pt}</h3>
        <p>{item.description_pt}</p>
      </div>
      <div className="specs">
        <div className="pr">{formatPrice(item.price)}</div>
        {specs && <div className="ab">{specs}</div>}
      </div>
    </div>
  )
}

function FoodCard({ item }: { item: DbItem }) {
  const rot = item.is_new ? 'New on the Menu' : 'No Cardápio'
  return (
    <article className="fcard">
      <div className="ph">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.photo_path ?? ''} alt={item.name_pt} />
      </div>
      <div className="scrim" />
      <div className="frame" />
      <span className={`rotulo${item.is_new ? ' brick' : ''} rot`}>{rot}</span>
      <div className="price">{formatPrice(item.price)}</div>
      <div className="bottom">
        <h4>{item.name_pt}</h4>
        <p>{item.description_pt}</p>
      </div>
    </article>
  )
}

const CERVEJAS_URL = 'https://oemporio.pt/cervejas' // placeholder — vem de site_settings quando essa seção for integrada

export default async function CardapioPage() {
  const { categories, itemsByCategory, tagsByItem } = await getMenu()

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

      {categories.map((cat) => {
        const items = itemsByCategory.get(cat.id) ?? []
        const featured = items.find((i) => i.is_featured)
        const regular = items.filter((i) => !i.is_featured)

        return (
          <section className="menu-sec" id={cat.slug ?? cat.id} key={cat.id}>
            <div className="wrap">
              <div className="sectitle">
                <h2>{cat.name_pt}</h2>
                <div className="line" />
              </div>

              {featured && <FeaturedBeer item={featured} />}

              {cat.with_photo ? (
                <div className="food-grid">
                  {regular.map((item) => (
                    <FoodCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="taplist">
                  {regular.map((item) => (
                    <TapRow key={item.id} item={item} tags={tagsByItem.get(item.id) ?? []} />
                  ))}
                </div>
              )}

              {items.length === 0 && (
                <p className="secsub">Cardápio em atualização — volte em breve.</p>
              )}
            </div>
          </section>
        )
      })}

      {/* ===== DESTAQUE CERVEJAS (carta externa) ===== */}
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
