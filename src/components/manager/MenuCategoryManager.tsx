'use client'

import { useState } from 'react'
import { useManager } from '@/lib/manager/store'
import { useConfirm } from '@/lib/manager/confirm'
import { sortedMenuCategories, type MenuCategory } from '@/lib/manager/mock'
import { Modal, Field, Toggle, Badge, inputCls, btn } from '@/components/manager/ui'

type CatDraft = Omit<MenuCategory, 'id' | 'order'>

function emptyDraft(): CatDraft {
  return { label_pt: '', label_en: '', text_pt: '', text_en: '', with_photo: false, is_active: true }
}

/** Modal de gestão das categorias do cardápio (ordenar, criar, editar, excluir). */
export function MenuCategoryManager({ onClose }: { onClose: () => void }) {
  const { data, saveMenuCategory, deleteMenuCategory, moveMenuCategory } = useManager()
  const confirm = useConfirm()
  const [editId, setEditId] = useState<string | null>(null)
  const [draft, setDraft] = useState<CatDraft>(emptyDraft())

  const cats = sortedMenuCategories(data.menuCategories)
  const set = (patch: Partial<CatDraft>) => setDraft((d) => ({ ...d, ...patch }))

  const startEdit = (c: MenuCategory) => {
    setEditId(c.id)
    setDraft({
      label_pt: c.label_pt,
      label_en: c.label_en,
      text_pt: c.text_pt,
      text_en: c.text_en,
      with_photo: c.with_photo,
      is_active: c.is_active,
    })
  }
  const reset = () => {
    setEditId(null)
    setDraft(emptyDraft())
  }
  const submit = () => {
    if (!draft.label_pt.trim()) return
    const clean: CatDraft = {
      ...draft,
      label_pt: draft.label_pt.trim(),
      label_en: draft.label_en.trim() || draft.label_pt.trim(),
    }
    if (editId) {
      const existing = data.menuCategories.find((c) => c.id === editId)
      if (existing) saveMenuCategory({ ...existing, ...clean })
    } else {
      const order = data.menuCategories.length
        ? Math.max(...data.menuCategories.map((c) => c.order)) + 1
        : 0
      saveMenuCategory({ id: `mcat-${Math.random().toString(36).slice(2, 8)}`, order, ...clean })
    }
    reset()
  }

  return (
    <Modal open onClose={onClose} title="Gerenciar categorias do cardápio" width="max-w-2xl">
      <div className="space-y-1.5 mb-6">
        {cats.map((c, i) => (
          <div key={c.id} className="flex items-center gap-3 border border-g200 px-3 py-2">
            <div className="flex flex-col">
              <button
                type="button"
                className="w-7 h-6 text-g500 hover:text-ink disabled:opacity-30 disabled:hover:text-g500"
                disabled={i === 0}
                onClick={() => moveMenuCategory(c.id, -1)}
                aria-label="Mover para cima"
              >
                ↑
              </button>
              <button
                type="button"
                className="w-7 h-6 text-g500 hover:text-ink disabled:opacity-30 disabled:hover:text-g500"
                disabled={i === cats.length - 1}
                onClick={() => moveMenuCategory(c.id, 1)}
                aria-label="Mover para baixo"
              >
                ↓
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-ink">
                {c.label_pt} <span className="text-g500">· {c.label_en}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                <Badge tone={c.is_active ? 'ok' : 'muted'}>{c.is_active ? 'Ativa' : 'Inativa'}</Badge>
                {c.with_photo && <Badge tone="outline">Com foto</Badge>}
              </div>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button type="button" className={btn('ghost')} onClick={() => startEdit(c)}>
                Editar
              </button>
              <button
                type="button"
                className={btn('danger')}
                onClick={async () => {
                  if (
                    await confirm({
                      title: 'Excluir categoria',
                      message: `Excluir a categoria “${c.label_pt}”? Produtos vinculados ficarão sem categoria.`,
                      confirmLabel: 'Excluir',
                      tone: 'danger',
                    })
                  )
                    deleteMenuCategory(c.id)
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
        {cats.length === 0 && <p className="text-sm text-g500">Nenhuma categoria cadastrada.</p>}
      </div>

      <div className="border-t border-g200 pt-4">
        <div className="font-display text-[11px] tracking-wider text-g500 mb-3">
          {editId ? 'Editar categoria' : 'Nova categoria'}
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Nome (PT)">
              <input className={inputCls} value={draft.label_pt} onChange={(e) => set({ label_pt: e.target.value })} />
            </Field>
            <Field label="Nome (EN)">
              <input className={inputCls} value={draft.label_en} onChange={(e) => set({ label_en: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Texto (PT)">
              <textarea
                className={`${inputCls} h-16 resize-none`}
                value={draft.text_pt}
                onChange={(e) => set({ text_pt: e.target.value })}
              />
            </Field>
            <Field label="Texto (EN)">
              <textarea
                className={`${inputCls} h-16 resize-none`}
                value={draft.text_en}
                onChange={(e) => set({ text_en: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex flex-wrap items-center gap-6 pt-1">
            <Toggle
              checked={draft.with_photo}
              onChange={() => set({ with_photo: !draft.with_photo })}
              label="Com foto (produtos em cards)"
            />
            <Toggle
              checked={draft.is_active}
              onChange={() => set({ is_active: !draft.is_active })}
              label={draft.is_active ? 'Ativa' : 'Inativa'}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" className={btn('primary')} disabled={!draft.label_pt.trim()} onClick={submit}>
              {editId ? 'Salvar' : '+ Adicionar'}
            </button>
            {editId && (
              <button type="button" className={btn('ghost')} onClick={reset}>
                Cancelar edição
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
