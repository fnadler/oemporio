'use client'

import { useState } from 'react'

/**
 * Seletor de idioma PT/EN. Por enquanto é apenas visual (como no protótipo).
 * A i18n completa será implementada numa etapa posterior.
 */
export function LangToggle() {
  const [lang, setLang] = useState<'PT' | 'EN'>('PT')
  return (
    <div className="lang">
      <span className={lang === 'PT' ? 'on' : ''} onClick={() => setLang('PT')}>
        PT
      </span>
      <span className={lang === 'EN' ? 'on' : ''} onClick={() => setLang('EN')}>
        EN
      </span>
    </div>
  )
}
