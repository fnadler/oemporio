'use client'

import { useState } from 'react'
import { useManager } from '@/lib/manager/store'
import { useConfirm } from '@/lib/manager/confirm'
import { type MenuTag } from '@/lib/manager/mock'
import { Modal, inputCls, btn } from '@/components/manager/ui'

/** Modal de gestão das tags do cardápio (criar, editar, excluir). */
export function MenuTagManager({ onClose }: { onClose: () => void }) {
  const { data, saveMenuTag, deleteMenuTag } = useManager()
  const confirm = useConfirm()
  const [editId, setEditId] = useState<string | null>(null)
  const [pt, setPt] = useState('')
  const [en, setEn] = useState('')

  const startEdit = (t: MenuTag) => {
    setEditId(t.id)
    setPt(t.label_pt)
    setEn(t.label_en)
  }
  const reset = () => {
    setEditId(null)
    setPt('')
    setEn('')
  }
  const submit = () => {
    if (!pt.trim()) return
    const id = editId ?? `mtag-${Math.random().toString(36).slice(2, 8)}`
    saveMenuTag({ id, label_pt: pt.trim(), label_en: en.trim() || pt.trim() })
    reset()
  }

  return (
    <Modal open onClose={onClose} title="Gerenciar tags do cardápio">
      <div className="space-y-1.5 mb-5">
        {data.menuTags.map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-3 border border-g200 px-3 py-2">
            <div className="text-sm text-ink">
              {t.label_pt} <span className="text-g500">· {t.label_en}</span>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button type="button" className={btn('ghost')} onClick={() => startEdit(t)}>
                Editar
              </button>
              <button
                type="button"
                className={btn('danger')}
                onClick={async () => {
                  if (
                    await confirm({
                      title: 'Excluir tag',
                      message: `Excluir a tag “${t.label_pt}”? Ela será removida dos itens que a utilizam.`,
                      confirmLabel: 'Excluir',
                      tone: 'danger',
                    })
                  )
                    deleteMenuTag(t.id)
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
        {data.menuTags.length === 0 && <p className="text-sm text-g500">Nenhuma tag cadastrada.</p>}
      </div>

      <div className="border-t border-g200 pt-4">
        <div className="font-display text-[11px] tracking-wider text-g500 mb-2">
          {editId ? 'Editar tag' : 'Nova tag'}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input className={inputCls} placeholder="Nome (PT)" value={pt} onChange={(e) => setPt(e.target.value)} />
          <input className={inputCls} placeholder="Nome (EN)" value={en} onChange={(e) => setEn(e.target.value)} />
        </div>
        <div className="flex gap-2 mt-3">
          <button type="button" className={btn('primary')} disabled={!pt.trim()} onClick={submit}>
            {editId ? 'Salvar' : '+ Adicionar'}
          </button>
          {editId && (
            <button type="button" className={btn('ghost')} onClick={reset}>
              Cancelar edição
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
