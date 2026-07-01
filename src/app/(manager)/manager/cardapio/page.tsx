'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useManager } from '@/lib/manager/store'
import { useConfirm } from '@/lib/manager/confirm'
import { sortedMenuCategories, menuTagLabel } from '@/lib/manager/mock'
import { PageHeader, Badge, Toggle, btn } from '@/components/manager/ui'
import { MenuCategoryManager } from '@/components/manager/MenuCategoryManager'

export default function CardapioPage() {
  const { data, toggleItem, deleteItem } = useManager()
  const confirm = useConfirm()
  const router = useRouter()
  const cats = sortedMenuCategories(data.menuCategories)
  const [catId, setCatId] = useState(cats[0]?.id ?? '')
  const [managing, setManaging] = useState(false)

  const selected = cats.find((c) => c.id === catId)?.id ?? cats[0]?.id ?? ''
  const current = cats.find((c) => c.id === selected) ?? null
  const withPhoto = current?.with_photo ?? false
  const items = data.menu.filter((m) => m.category_id === selected)
  const cols = withPhoto ? 8 : 7

  return (
    <div>
      <PageHeader
        title="Cardápio"
        subtitle="Cervejas (carta) é externa — configurada em Configurações"
        actions={
          <div className="flex gap-2">
            <button className={btn('ghost')} onClick={() => setManaging(true)}>
              Gerenciar categorias
            </button>
            <button className={btn('primary')} onClick={() => router.push('/manager/cardapio/novo')}>
              + Novo item
            </button>
          </div>
        }
      />

      {/* abas de categoria (na ordem de exibição do site) */}
      <div className="flex flex-wrap gap-1 mb-5">
        {cats.map((c) => (
          <button
            key={c.id}
            onClick={() => setCatId(c.id)}
            className={`font-display text-sm tracking-wide min-h-11 px-4 border inline-flex items-center gap-2 ${
              selected === c.id
                ? 'bg-ink text-paper border-ink'
                : 'bg-surface text-g600 border-g300 hover:border-ink'
            }`}
          >
            {c.label_pt}
            {!c.is_active && <span className="text-[10px] opacity-70">(inativa)</span>}
          </button>
        ))}
        {cats.length === 0 && <span className="text-sm text-g500">Nenhuma categoria — crie em “Gerenciar categorias”.</span>}
      </div>

      <div className="bg-surface border border-g200 overflow-x-auto mgr-scroll">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="font-display text-[11px] tracking-wider text-g500 text-left border-b border-g200">
              {withPhoto && <th className="px-4 py-3">Foto</th>}
              <th className="px-4 py-3">Nome (PT / EN)</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3">Novo</th>
              <th className="px-4 py-3">Ativo</th>
              <th className="px-4 py-3">Esgotado</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr
                key={m.id}
                onClick={() => router.push(`/manager/cardapio/${m.id}`)}
                className="border-b border-g200 last:border-0 hover:bg-subtle cursor-pointer"
              >
                {withPhoto && (
                  <td className="px-4 py-3">
                    {m.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.photo} alt="" className="w-12 h-12 object-cover border border-g200" />
                    ) : (
                      <div className="w-12 h-12 bg-g200" />
                    )}
                  </td>
                )}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-ink">{m.name_pt}</span>
                    {m.is_new && <Badge tone="ink">Novo</Badge>}
                  </div>
                  <div className="text-xs text-g500">{m.name_en || 'sem EN'}</div>
                </td>
                <td className="px-4 py-3 text-ink">
                  €{m.price} <span className="text-xs text-g500">{m.price_unit}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {m.tag_ids.length ? (
                      m.tag_ids.map((t) => (
                        <Badge key={t} tone="outline">
                          {menuTagLabel(data.menuTags, t)}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-g400 text-xs">—</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <Toggle checked={m.is_new} onChange={() => toggleItem(m.id, 'is_new')} />
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <Toggle checked={m.is_active} onChange={() => toggleItem(m.id, 'is_active')} />
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <Toggle checked={m.sold_out} onChange={() => toggleItem(m.id, 'sold_out')} />
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <button className={btn('ghost')} onClick={() => router.push(`/manager/cardapio/${m.id}`)}>Editar</button>
                    <button
                      className={btn('danger')}
                      onClick={async () => {
                        if (
                          await confirm({
                            title: 'Apagar item',
                            message: `Apagar “${m.name_pt}” do cardápio? Esta ação não pode ser desfeita.`,
                            confirmLabel: 'Apagar',
                            tone: 'danger',
                          })
                        )
                          deleteItem(m.id)
                      }}
                    >
                      Apagar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={cols} className="px-4 py-10 text-center text-g500">Sem itens nesta categoria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {managing && <MenuCategoryManager onClose={() => setManaging(false)} />}
    </div>
  )
}
