'use client'

import { useEffect, useRef, useState } from 'react'

const CERVEJAS_URL = 'https://oemporio.pt/cervejas' // placeholder — substituir pela carta real

const ITEMS = [
  { id: 'taps', label: 'Taps' },
  { id: 'comidas', label: 'Comidas' },
  { id: 'vinhos', label: 'Vinhos' },
  { id: 'bebidas', label: 'Bebidas' },
]

/** Navegação por âncoras + scrollspy do cardápio (sticky). */
export function CategoryNav() {
  const [active, setActive] = useState('taps')
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function spy() {
      const off = (barRef.current?.offsetHeight ?? 60) + 60
      let cur = ITEMS[0].id
      for (const it of ITEMS) {
        const el = document.getElementById(it.id)
        if (el && el.getBoundingClientRect().top <= off) cur = it.id
      }
      setActive(cur)
    }
    spy()
    window.addEventListener('scroll', spy, { passive: true })
    window.addEventListener('resize', spy)
    return () => {
      window.removeEventListener('scroll', spy)
      window.removeEventListener('resize', spy)
    }
  }, [])

  return (
    <div className="filters" ref={barRef}>
      <div className="wrap catnav">
        <a className={`chip${active === 'taps' ? ' on' : ''}`} href="#taps">
          Taps
        </a>
        <a className="chip ext" href={CERVEJAS_URL} target="_blank" rel="noopener noreferrer">
          Cervejas ↗
        </a>
        <a className={`chip${active === 'comidas' ? ' on' : ''}`} href="#comidas">
          Comidas
        </a>
        <a className={`chip${active === 'vinhos' ? ' on' : ''}`} href="#vinhos">
          Vinhos
        </a>
        <a className={`chip${active === 'bebidas' ? ' on' : ''}`} href="#bebidas">
          Bebidas
        </a>
      </div>
    </div>
  )
}
