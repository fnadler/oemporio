'use client'

import { type LoyaltyProgram } from '@/lib/manager/mock'
import { Field, inputCls, btn } from '@/components/manager/ui'

/** Campos editáveis do programa (sem ciclo de vida: id/status/datas). */
export type ProgramDraft = Pick<LoyaltyProgram, 'name' | 'points_required' | 'items'>

export function newItemId(): string {
  return `item-${Math.random().toString(36).slice(2, 8)}`
}

/** Formulário de cadastro do programa (Nome, Selos, Itens de consumo). */
export function ProgramForm({
  value,
  onChange,
  disabled = false,
}: {
  value: ProgramDraft
  onChange: (p: ProgramDraft) => void
  disabled?: boolean
}) {
  const setItem = (i: number, label: string) =>
    onChange({ ...value, items: value.items.map((it, idx) => (idx === i ? { ...it, label } : it)) })
  const addItem = () =>
    onChange({ ...value, items: [...value.items, { id: newItemId(), label: '' }] })
  const removeItem = (i: number) =>
    onChange({ ...value, items: value.items.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-4">
      <Field label="Nome do programa">
        <input
          className={inputCls}
          value={value.name}
          disabled={disabled}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
        />
      </Field>

      <Field label="Quantidade de selos para resgate">
        <input
          type="number"
          min={1}
          className={inputCls}
          value={value.points_required}
          disabled={disabled}
          onChange={(e) => onChange({ ...value, points_required: Number(e.target.value) })}
        />
      </Field>

      <div>
        <span className="font-display text-[11px] tracking-wider text-g500 block mb-1.5">
          Itens de consumo
        </span>
        <div className="space-y-2">
          {value.items.map((it, i) => (
            <div key={it.id} className="flex gap-2">
              <input
                className={inputCls}
                value={it.label}
                placeholder={`Item ${i + 1}`}
                disabled={disabled}
                onChange={(e) => setItem(i, e.target.value)}
              />
              {!disabled && (
                <button
                  type="button"
                  className={btn('ghost')}
                  onClick={() => removeItem(i)}
                  aria-label="Remover item"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {value.items.length === 0 && (
            <p className="text-sm text-g500">Nenhum item — adicione ao menos um.</p>
          )}
        </div>
        {!disabled && (
          <button type="button" className={`${btn('ghost')} mt-2`} onClick={addItem}>
            + Adicionar item
          </button>
        )}
      </div>
    </div>
  )
}
