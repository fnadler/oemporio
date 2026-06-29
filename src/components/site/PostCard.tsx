import Link from 'next/link'
import { type Post, img, dateChip, cardTone } from '@/lib/site/posts'

/** Card "máscara" de uma novidade (usado na listagem e em "mais novidades"). */
export function PostCard({ post, index }: { post: Post; index: number }) {
  const photo = img(post.foto)
  const { mes, dia } = dateChip(post.data)

  return (
    <Link className="artcard" href={`/novidades/${post.slug}`}>
      {photo ? (
        <div className="ph" style={{ backgroundImage: `url('${photo}')` }} />
      ) : (
        <div className={`ph ${cardTone(post, index)}`} />
      )}
      <div className="scrim" />
      <div className="frame" />
      <div className="top">
        <span className={`rotulo ${post.rot || ''}`}>{post.cat}</span>
      </div>
      <div className="datechip">
        {mes}
        <b>{dia}</b>
      </div>
      <div className="bottom">
        <div className="sup">{post.eyebrow}</div>
        <h4>{post.titulo}</h4>
        <div className="sb">{post.sub}</div>
      </div>
    </Link>
  )
}
