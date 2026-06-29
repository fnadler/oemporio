'use client'

import { useEffect, useState } from 'react'

/** Galeria com lightbox (zoom) — usada nos blocos de galeria das novidades. */
export function Gallery({ images }: { images: string[] }) {
  const [open, setOpen] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <div className="npd-gallery">
        {images.map((src) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} src={src} alt="" onClick={() => setOpen(src)} />
        ))}
      </div>
      <div className={`npd-lb${open ? ' open' : ''}`} onClick={() => setOpen(null)}>
        <button className="x" type="button" aria-label="Fechar" onClick={() => setOpen(null)}>
          &times;
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {open && <img src={open} alt="" />}
      </div>
    </>
  )
}
