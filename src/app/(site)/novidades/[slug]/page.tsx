import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteNav } from '@/components/site/SiteNav'
import { PostCard } from '@/components/site/PostCard'
import { ShareBar } from '@/components/site/ShareBar'
import { Gallery } from '@/components/site/Gallery'
import { dateFull, type PostBody } from '@/lib/site/posts'
import { getPostBySlug, getPublishedPosts, getPublishedSlugs } from '@/lib/site/postsData'

export const revalidate = 60

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'O Empório — Novidades' }
  return { title: `${post.titulo} — O Empório`, description: post.sub }
}

function Block({ block }: { block: PostBody }) {
  if (typeof block === 'string') {
    return block.startsWith('## ') ? <h3>{block.slice(3)}</h3> : <p>{block}</p>
  }
  if ('video' in block) {
    return (
      <div className="npd-video">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${block.video}`}
          title="Vídeo"
          allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }
  if ('gallery' in block) {
    return <Gallery images={block.gallery.filter(Boolean)} />
  }
  return null
}

export default async function NovidadeDetail({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const allPosts = await getPublishedPosts()
  const others = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3)

  return (
    <section className="page novp detail">
      <article className="np-detail">
        <div className="npd-hero">
          <SiteNav />
          <div className="wrap">
            <div className="npd-eye">{post.eyebrow}</div>
            <h1>{post.titulo}</h1>
            <p className="npd-sub">{post.sub}</p>
          </div>
        </div>

        {post.foto && (
          <div className="npd-photo-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="npd-photo" src={post.foto} alt={post.titulo} />
          </div>
        )}

        <div className="npd-body">
          <div className="npd-meta">
            <span className={`rotulo ${post.rot || ''}`}>{post.cat}</span>
            <span className="npd-date">{dateFull(post.data)}</span>
          </div>
          {post.corpo.map((block, i) => (
            <Block block={block} key={i} />
          ))}
        </div>

        <ShareBar title={post.titulo} />

        <section className="npd-more">
          <div className="wrap">
            <span className="kicker">Mais novidades</span>
            <div className="np-grid nov-grid">
              {others.map((p, i) => (
                <PostCard post={p} index={i} key={p.slug} />
              ))}
            </div>
          </div>
        </section>

        <div className="npd-end">
          <Link className="btn" href="/novidades">
            Ver todas as novidades →
          </Link>
        </div>
      </article>
    </section>
  )
}
