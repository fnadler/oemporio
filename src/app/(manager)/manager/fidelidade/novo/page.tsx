'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useManager } from '@/lib/manager/store'
import { type LoyaltyProgram } from '@/lib/manager/mock'
import { PageHeader, ConfirmDialog, btn } from '@/components/manager/ui'
import { ProgramForm, type ProgramDraft } from '@/components/manager/ProgramForm'

const todayISO = () => {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export default function NovoProgramaPage() {
  const router = useRouter()
  const { saveProgram } = useManager()
  const [draft, setDraft] = useState<ProgramDraft>({ name: '', points_required: 5, items: [] })
  const [confirm, setConfirm] = useState(false)

  const valid =
    draft.name.trim() !== '' &&
    draft.points_required >= 1 &&
    draft.items.length > 0 &&
    draft.items.every((it) => it.label.trim() !== '')

  const create = () => {
    const program: LoyaltyProgram = {
      id: `prog-${Math.random().toString(36).slice(2, 9)}`,
      name: draft.name.trim(),
      is_active: true,
      points_required: draft.points_required,
      items: draft.items,
      activated_at: todayISO(),
      deactivated_at: null,
    }
    saveProgram(program)
    router.push(`/manager/fidelidade/${program.id}`)
  }

  return (
    <div>
      <PageHeader
        title="Novo programa"
        subtitle="Ao salvar, o programa fica ativo e pode ser atribuído a clientes"
        actions={
          <button
            type="button"
            className={`${btn('ghost')} min-h-13`}
            onClick={() => router.push('/manager/fidelidade')}
          >
            ← Voltar
          </button>
        }
      />

      <div className="bg-surface border border-g200 p-6 max-w-2xl">
        <ProgramForm value={draft} onChange={setDraft} />

        <div className="flex gap-3 mt-6 pt-5 border-t border-g200">
          <button
            type="button"
            className={`${btn('primary')} min-h-13`}
            disabled={!valid}
            onClick={() => setConfirm(true)}
          >
            Criar e ativar
          </button>
        </div>
        {!valid && (
          <p className="text-xs text-g500 mt-3">
            Informe o nome, ao menos 1 selo para resgate e pelo menos um item de consumo.
          </p>
        )}
      </div>

      {confirm && (
        <ConfirmDialog
          open
          title="Criar programa"
          message={`Criar e ativar o programa “${draft.name.trim()}”? Ele ficará disponível para atribuição a clientes.`}
          confirmLabel="Criar e ativar"
          tone="primary"
          onConfirm={create}
          onClose={() => setConfirm(false)}
        />
      )}
    </div>
  )
}
