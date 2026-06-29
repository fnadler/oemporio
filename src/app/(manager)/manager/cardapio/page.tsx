'use client'

import { useState } from 'react'
import { useManager } from '@/lib/manager/store'
import { type MenuItem, type MenuCategoryKey } from '@/lib/manager/mock'
import { useToast } from '@/lib/manager/toast'
import { PageHeader, Badge, Toggle, Modal, Field, inputCls, btn } from '@/components/manager/ui'

const CATS: { key: MenuCategoryKey; label: string }[] = [
  { key: 'taps', label: 'Taps' },
  { key: 'comidas', label: 'Comidas' },
  { key: 'vinhos', label: 'Vinhos' },
  { key: 'bebidas', label: 'Bebidas' },
]

function blankItem(category: MenuCategoryKey): MenuItem {
  return {
    id: '',
    category,
    name_pt: '', name_en: '',
    description_pt: '',
    price: '', price_unit: '',
    tags: [],
    is_active: true,
    sold_out: false,
  }
}

export default function CardapioPage() {
  const { data, toggleItem, deleteItem } = useManager()
  const [cat, setCat] = useState<MenuCategoryKey>('taps')
  const [editing, setEditing] = useState<MenuItem | null>(null)

  const items = data.menu.filter((m) => m.category === cat)

  return (
    <div>
      <PageHeader
        title="Cardápio"
        subtitle="Cervejas (carta) é externa — configurada em Configurações"
        actions={
          <button className={btn('primary')} onClick={() => setEditing(blankItem(cat))}>
            + Novo item
          </button>
        }
      />

      {/* abas de categoria */}
      <div className="flex gap-1 mb-5">
        {CATS.map((c) => (
          <button
            key={c.key}
            onClick={() => setCat(c.key)}
            className={`font-display text-sm tracking-wide px-4 py-2 border ${
              cat === c.key ? 'bg-ink text-paper border-ink' : 'bg-surface text-g600 border-g300 hover:border-ink'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="bg-surface border border-g200 overflow-x-auto mgr-scroll">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="font-display text-[11px] tracking-wider text-g500 text-left border-b border-g200">
              {cat === 'comidas' && <th className="px-4 py-3">Foto</th>}
              <th className="px-4 py-3">Nome (PT / EN)</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3">Ativo</th>
              <th className="px-4 py-3">Esgotado</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id} className="border-b border-g200 last:border-0 hover:bg-subtle">
                {cat === 'comidas' && (
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
                  <div className="text-ink">{m.name_pt}</div>
                  <div className="text-xs text-g500">{m.name_en || 'sem EN'}</div>
                </td>
                <td className="px-4 py-3 text-ink">
                  €{m.price} <span className="text-xs text-g500">{m.price_unit}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {m.tags.length ? m.tags.map((t) => <Badge key={t} tone="outline">{t}</Badge>) : <span className="text-g400 text-xs">—</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Toggle checked={m.is_active} onChange={() => toggleItem(m.id, 'is_active')} />
                </td>
                <td className="px-4 py-3">
                  <Toggle checked={m.sold_out} onChange={() => toggleItem(m.id, 'sold_out')} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button className={btn('ghost')} onClick={() => setEditing(structuredClone(m))}>Editar</button>
                    <button className={btn('danger')} onClick={() => deleteItem(m.id)}>Apagar</button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-g500">Sem itens nesta categoria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && <ItemEditor initial={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

function ItemEditor({ initial, onClose }: { initial: MenuItem; onClose: () => void }) {
  const { saveItem } = useManager()
  const toast = useToast()
  const [item, setItem] = useState<MenuItem>(initial)
  const set = (patch: Partial<MenuItem>) => setItem((m) => ({ ...m, ...patch }))

  function save() {
    if (!item.name_pt.trim()) {
      toast('Nome (PT) é obrigatório.', 'danger')
      return
    }
    saveItem(item)
    onClose()
  }

  return (
    <Modal open onClose={onClose} title={initial.id ? 'Editar item' : 'Novo item'}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nome (PT)">
            <input className={inputCls} value={item.name_pt} onChange={(e) => set({ name_pt: e.target.value })} />
          </Field>
          <Field label="Nome (EN)">
            <input className={inputCls} value={item.name_en} onChange={(e) => set({ name_en: e.target.value })} />
          </Field>
        </div>
        <Field label="Descrição (PT)">
          <textarea
            className={`${inputCls} h-16 resize-none`}
            value={item.description_pt}
            onChange={(e) => set({ description_pt: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Preço (€)">
            <input className={inputCls} value={item.price} onChange={(e) => set({ price: e.target.value })} />
          </Field>
          <Field label="Unidade (ex.: / 33cl, copo)">
            <input className={inputCls} value={item.price_unit} onChange={(e) => set({ price_unit: e.target.value })} />
          </Field>
        </div>
        <Field label="Tags (separadas por vírgula)">
          <input
            className={inputCls}
            value={item.tags.join(', ')}
            onChange={(e) => set({ tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
          />
        </Field>
        <div className="flex items-center gap-6 pt-1">
          <Toggle checked={item.is_active} onChange={() => set({ is_active: !item.is_active })} label="Ativo" />
          <Toggle checked={item.sold_out} onChange={() => set({ sold_out: !item.sold_out })} label="Esgotado" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-g200">
        <button className={btn('ghost')} onClick={onClose}>Cancelar</button>
        <button className={btn('primary')} onClick={save}>Guardar</button>
      </div>
    </Modal>
  )
}
