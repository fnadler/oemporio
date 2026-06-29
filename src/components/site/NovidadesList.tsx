'use client'

import { useMemo, useState } from 'react'
import { SiteNav } from './SiteNav'
import { PostCard } from './PostCard'
import { POSTS, type Post } from '@/lib/site/posts'

const PER = 6

function matches(p: Post, q: string): boolean {
  const body = p.corpo
    .map((b) => (typeof b === 'string' ? b : ''))
    .join(' ')
  return `${p.titulo} ${p.sub} ${p.cat} ${p.eyebrow} ${body}`.toLowerCase().includes(q)
}

export function NovidadesList() {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return s ? POSTS.filter((p) => matches(p, s)) : POSTS
  }, [q])

  const pages = Math.max(1, Math.ceil(filtered.length / PER))
  const current = Math.min(page, pages)
  const slice = filtered.slice((current - 1) * PER, current * PER)

  function onSearch(value: string) {
    setQ(value)
    setPage(1)
  }

  function goTo(p: number) {
    setPage(p)
    window.scrollTo(0, 0)
  }

  return (
    <section className="page novp">
      <div className="np-list">
        <header className="np-hero">
          <div
            className="menu-hero-o"
            style={{ backgroundImage: "url('/v2/img/simbolo-o-branco.svg')" }}
          />
          <SiteNav />
          <div className="wrap">
            <span className="rotulo">Sempre acontecendo</span>
            <h1>Novidades</h1>
            <p className="sub">
              Mostras de cerveja, workshops, eventos da região e comunicados do pub — atualizados
              pela equipa.
            </p>
            <div className="np-search">
              <input
                type="search"
                value={q}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Buscar por palavra-chave…"
                aria-label="Buscar novidades"
              />
            </div>
          </div>
        </header>

        <main className="np-main">
          <div className="wrap">
            <div className="np-count">
              {filtered.length} {filtered.length === 1 ? 'novidade' : 'novidades'}
            </div>
            <div className="np-grid nov-grid">
              {slice.length ? (
                slice.map((p, i) => <PostCard post={p} index={i} key={p.slug} />)
              ) : (
                <div className="np-empty">Nenhuma novidade encontrada para “{q}”.</div>
              )}
            </div>

            {pages > 1 && (
              <div className="np-pager">
                <button disabled={current <= 1} onClick={() => goTo(current - 1)}>
                  ‹
                </button>
                {Array.from({ length: pages }).map((_, i) => (
                  <button
                    key={i}
                    className={i + 1 === current ? 'on' : ''}
                    onClick={() => goTo(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button disabled={current >= pages} onClick={() => goTo(current + 1)}>
                  ›
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </section>
  )
}
