'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useManager } from '@/lib/manager/store'
import { sortedMenuCategories } from '@/lib/manager/mock'
import { PageHeader, btn } from '@/components/manager/ui'
import { MenuItemEditor, blankMenuItem } from '@/components/manager/MenuItemEditor'

export default function NovoItemPage() {
  const router = useRouter()
  const { data } = useManager()
  const back = () => router.push('/manager/cardapio')

  // pré-seleciona a primeira categoria ativa (na ordem de exibição)
  const firstActive = sortedMenuCategories(data.menuCategories).find((c) => c.is_active)
  const [initial] = useState(() => blankMenuItem(firstActive?.id ?? ''))

  return (
    <div>
      <PageHeader
        title="Novo item"
        actions={
          <button type="button" className={`${btn('ghost')} min-h-13`} onClick={back}>
            ← Voltar
          </button>
        }
      />
      <MenuItemEditor initial={initial} onDone={back} />
    </div>
  )
}
