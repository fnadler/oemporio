'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader, btn } from '@/components/manager/ui'
import { PostEditor, blankPost } from '@/components/manager/PostEditor'

export default function NovaNovidadePage() {
  const router = useRouter()
  const [initial] = useState(blankPost)
  const back = () => router.push('/manager/novidades')

  return (
    <div>
      <PageHeader
        title="Nova novidade"
        actions={
          <button type="button" className={`${btn('ghost')} min-h-13`} onClick={back}>
            ← Voltar
          </button>
        }
      />
      <PostEditor initial={initial} onDone={back} />
    </div>
  )
}
