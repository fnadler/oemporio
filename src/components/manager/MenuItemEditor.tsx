'use client'

import { useRef, useState } from 'react'
import { useManager } from '@/lib/manager/store'
import { useToast } from '@/lib/manager/toast'
import { sortedMenuCategories, menuCategoryById, type MenuItem } from '@/lib/manager/mock'
import { Field, Select, Toggle, inputCls, btn } from '@/components/manager/ui'
import { MenuCategoryManager } from '@/components/manager/MenuCategoryManager'
import { MenuTagManager } from '@/components/manager/MenuTagManager'

export function blankMenuItem(categoryId: string): MenuItem {
  return {
    id: '',
    category_id: categoryId,
    name_pt: '', name_en: '',
    description_pt: '', description_en: '',
    price: '', price_unit: '', price_unit_en: '',
    tag_ids: [],
    is_active: true,
    sold_out: false,
    is_new: false,
  }
}

export function MenuItemEditor({ initial, onDone }: { initial: MenuItem; onDone: () => void }) {
  const { data, saveItem } = useManager()
  const toast = useToast()
  const [item, setItem] = useState<MenuItem>(initial)
  const [managing, setManaging] = useState(false)
  const [managingTags, setManagingTags] = useState(false)

  const set = (patch: Partial<MenuItem>) => setItem((m) => ({ ...m, ...patch }))
  const toggleTag = (id: string) =>
    set({ tag_ids: item.tag_ids.includes(id) ? item.tag_ids.filter((t) => t !== id) : [...item.tag_ids, id] })
  const cats = sortedMenuCategories(data.menuCategories)
  const category = menuCategoryById(data.menuCategories, item.category_id)
  const withPhoto = category?.with_photo ?? false

  function save() {
    if (!item.category_id) {
      toast('Selecione uma categoria.', 'danger')
      return
    }
    if (!item.name_pt.trim()) {
      toast('Nome (PT) é obrigatório.', 'danger')
      return
    }
    // se a categoria não usa foto, não persiste foto antiga
    saveItem(withPhoto ? item : { ...item, photo: undefined })
    onDone()
  }

  return (
    <div>
      <div className="bg-surface border border-g200 p-6">
        <div className="space-y-4">
          <Field label="Categoria">
            <div className="flex gap-2">
              <Select
                className="flex-1"
                value={item.category_id}
                onChange={(e) => set({ category_id: e.target.value })}
                aria-label="Categoria"
              >
                <option value="">— Selecione —</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label_pt}
                    {c.is_active ? '' : ' (inativa)'}
                  </option>
                ))}
              </Select>
              <button
                type="button"
                onClick={() => setManaging(true)}
                aria-label="Gerenciar categorias"
                title="Gerenciar categorias"
                className="shrink-0 px-3 border border-g300 bg-surface text-ink hover:border-ink transition-colors flex items-center justify-center"
              >
                <GearIcon />
              </button>
            </div>
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nome (PT)">
              <input className={inputCls} value={item.name_pt} onChange={(e) => set({ name_pt: e.target.value })} />
            </Field>
            <Field label="Nome (EN)">
              <input className={inputCls} value={item.name_en} onChange={(e) => set({ name_en: e.target.value })} />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Descrição (PT)">
              <textarea
                className={`${inputCls} h-16 resize-none`}
                value={item.description_pt}
                onChange={(e) => set({ description_pt: e.target.value })}
              />
            </Field>
            <Field label="Descrição (EN)">
              <textarea
                className={`${inputCls} h-16 resize-none`}
                value={item.description_en}
                onChange={(e) => set({ description_en: e.target.value })}
              />
            </Field>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Preço (€)">
              <input className={inputCls} value={item.price} onChange={(e) => set({ price: e.target.value })} />
            </Field>
            <Field label="Unidade (PT)">
              <input className={inputCls} placeholder="ex.: / 33cl, copo" value={item.price_unit} onChange={(e) => set({ price_unit: e.target.value })} />
            </Field>
            <Field label="Unidade (EN)">
              <input className={inputCls} placeholder="ex.: / 33cl, glass" value={item.price_unit_en} onChange={(e) => set({ price_unit_en: e.target.value })} />
            </Field>
          </div>

          <Field label="Tags">
            <div className="flex gap-2 items-start">
              <div className="flex-1 border border-g300 bg-surface px-3 py-2 flex flex-wrap gap-2 items-center min-h-11">
                {data.menuTags.length === 0 && (
                  <span className="text-sm text-g400">Nenhuma tag — crie em “gerenciar”.</span>
                )}
                {data.menuTags.map((t) => {
                  const on = item.tag_ids.includes(t.id)
                  return (
                    <button
                      key={t.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleTag(t.id)}
                      className={`font-display text-xs tracking-wide px-3 py-1.5 border transition-colors ${
                        on
                          ? 'bg-ink text-paper border-ink'
                          : 'bg-surface text-g600 border-g300 hover:border-ink'
                      }`}
                    >
                      {t.label_pt}
                    </button>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={() => setManagingTags(true)}
                aria-label="Gerenciar tags"
                title="Gerenciar tags"
                className="shrink-0 h-11 px-3 border border-g300 bg-surface text-ink hover:border-ink transition-colors flex items-center justify-center"
              >
                <GearIcon />
              </button>
            </div>
          </Field>

          {withPhoto && (
            <Field label="Foto do produto">
              <PhotoUploader photo={item.photo} onChange={(p) => set({ photo: p })} />
            </Field>
          )}

          <div className="flex flex-wrap items-center gap-6 pt-1">
            <Toggle checked={item.is_active} onChange={() => set({ is_active: !item.is_active })} label="Ativo" />
            <Toggle checked={item.sold_out} onChange={() => set({ sold_out: !item.sold_out })} label="Esgotado" />
            <Toggle checked={item.is_new} onChange={() => set({ is_new: !item.is_new })} label="Novo (destaque)" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button type="button" className={`${btn('ghost')} min-h-13`} onClick={onDone}>
          Cancelar
        </button>
        <button type="button" className={`${btn('primary')} min-h-13`} onClick={save}>
          Guardar
        </button>
      </div>

      {managing && <MenuCategoryManager onClose={() => setManaging(false)} />}
      {managingTags && <MenuTagManager onClose={() => setManagingTags(false)} />}
    </div>
  )
}

function PhotoUploader({ photo, onChange }: { photo?: string; onChange: (p: string | undefined) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onChange(URL.createObjectURL(file))
    e.target.value = ''
  }

  return (
    <div className="flex items-center gap-4">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      {photo ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" className="w-20 h-20 object-cover border border-g200" />
          <div className="flex gap-2">
            <button type="button" className={btn('ghost')} onClick={() => inputRef.current?.click()}>
              Trocar
            </button>
            <button type="button" className={btn('danger')} onClick={() => onChange(undefined)}>
              Remover
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="w-20 h-20 bg-g200 flex items-center justify-center text-g400 text-xs">sem foto</div>
          <button type="button" className={btn('ghost')} onClick={() => inputRef.current?.click()}>
            ⬆ Carregar foto
          </button>
        </>
      )}
    </div>
  )
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
