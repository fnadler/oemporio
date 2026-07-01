'use client'

import { useParams, useRouter } from 'next/navigation'
import { useManager } from '@/lib/manager/store'
import { PageHeader, btn } from '@/components/manager/ui'
import { MenuItemEditor } from '@/components/manager/MenuItemEditor'

export default function EditarItemPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data } = useManager()
  const back = () => router.push('/manager/cardapio')

  const item = data.menu.find((m) => m.id === id) ?? null

  if (!item) {
    return (
      <div>
        <PageHeader title="Item" />
        <div className="bg-surface border border-g200 p-8 text-center">
          <p className="text-g600 text-sm">Item não encontrado.</p>
          <button type="button" className={`${btn('ghost')} mt-4`} onClick={back}>
            ← Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Editar item"
        subtitle={item.name_pt}
        actions={
          <button type="button" className={`${btn('ghost')} min-h-13`} onClick={back}>
            ← Voltar
          </button>
        }
      />
      <MenuItemEditor key={item.id} initial={structuredClone(item)} onDone={back} />
    </div>
  )
}
