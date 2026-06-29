'use client'

import { useEffect, useState } from 'react'

/** Barra de partilha do detalhe de uma novidade. */
export function ShareBar({ title }: { title: string }) {
  const [url, setUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setUrl(window.location.href)
  }, [])

  const t = encodeURIComponent(`${title} — O Empório`)
  const u = encodeURIComponent(url)

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="npd-share">
      <span className="lbl">Partilhar:</span>
      <button type="button" onClick={copy}>
        {copied ? 'Link copiado!' : 'Copiar link'}
      </button>
      <a href={`https://wa.me/?text=${t}%20${u}`} target="_blank" rel="noopener noreferrer">
        WhatsApp
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${u}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Facebook
      </a>
      <a href={`https://twitter.com/intent/tweet?text=${t}&url=${u}`} target="_blank" rel="noopener noreferrer">
        X
      </a>
      <a href={`mailto:?subject=${t}&body=${u}`}>E-mail</a>
    </div>
  )
}
