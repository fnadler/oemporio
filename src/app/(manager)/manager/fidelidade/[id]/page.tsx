'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useManager } from '@/lib/manager/store'
import { fmtDate, programStats, programItemStats } from '@/lib/manager/mock'
import { PageHeader, StatCard, Badge, ConfirmDialog, btn } from '@/components/manager/ui'
import { ProgramForm, type ProgramDraft } from '@/components/manager/ProgramForm'

type ConfirmType = 'save' | 'deactivate' | 'reactivate'

const CONFIRM: Record<
  ConfirmType,
  { title: string; message: string; confirmLabel: string; tone: 'primary' | 'danger' }
> = {
  save: {
    title: 'Salvar programa',
    message: 'Salvar as alterações do cadastro deste programa?',
    confirmLabel: 'Salvar',
    tone: 'primary',
  },
  deactivate: {
    title: 'Inativar programa',
    message:
      'Inativar este programa? Ele deixa de ficar disponível para atribuição a novos clientes.',
    confirmLabel: 'Inativar',
    tone: 'danger',
  },
  reactivate: {
    title: 'Reativar programa',
    message: 'Reativar este programa? Ele volta a ficar disponível para atribuição.',
    confirmLabel: 'Reativar',
    tone: 'primary',
  },
}

export default function ProgramaDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data, saveProgram, deactivateProgram, reactivateProgram } = useManager()

  const program = data.programs.find((p) => p.id === id) ?? null

  const [draft, setDraft] = useState<ProgramDraft>(() =>
    program
      ? { name: program.name, points_required: program.points_required, items: program.items }
      : { name: '', points_required: 5, items: [] },
  )
  const [confirm, setConfirm] = useState<ConfirmType | null>(null)

  // ressincroniza o formulário se navegar para outro programa (ajuste no render)
  const [syncedId, setSyncedId] = useState(program?.id ?? null)
  if (program && program.id !== syncedId) {
    setSyncedId(program.id)
    setDraft({ name: program.name, points_required: program.points_required, items: program.items })
  }

  if (!program) {
    return (
      <div>
        <PageHeader title="Programa" />
        <div className="bg-surface border border-g200 p-8 text-center">
          <p className="text-g600 text-sm">Programa não encontrado.</p>
          <button
            type="button"
            className={`${btn('ghost')} mt-4`}
            onClick={() => router.push('/manager/fidelidade')}
          >
            ← Voltar
          </button>
        </div>
      </div>
    )
  }

  const stats = programStats(data.cards, program.id)
  const perItem = programItemStats(data.cards, program)

  const runConfirm = () => {
    if (confirm === 'save') saveProgram({ ...program, ...draft })
    else if (confirm === 'deactivate') deactivateProgram(program.id)
    else if (confirm === 'reactivate') reactivateProgram(program.id)
  }
  const dialog = confirm ? CONFIRM[confirm] : null

  return (
    <div>
      <PageHeader
        title={program.name}
        subtitle={program.is_active ? 'Programa ativo' : 'Programa inativo'}
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

      {/* big numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Clientes participando" value={stats.customers} hint="cartões atribuídos" />
        <StatCard label="Itens consumidos" value={stats.consumed} hint="selos registrados" />
        <StatCard label="Itens resgatados" value={stats.rewards} hint="prêmios resgatados" />
        <div className="bg-surface border border-g200 p-5 flex flex-col justify-between">
          <div className="font-display text-[11px] tracking-widest text-g500">Status</div>
          <div className="mt-2">
            <Badge tone={program.is_active ? 'ok' : 'muted'}>
              {program.is_active ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          <div className="text-xs text-g500 mt-2">
            Ativação {fmtDate(program.activated_at)}
            {program.deactivated_at && ` · Inativação ${fmtDate(program.deactivated_at)}`}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3 items-start">
        {/* consumo/resgates por item */}
        <section className="bg-surface border border-g200 p-6 lg:col-span-1">
          <h2 className="font-display text-sm text-ink mb-4">Por item de consumo</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="font-display text-[11px] tracking-wider text-g500 text-left border-b border-g200">
                <th className="py-2">Item</th>
                <th className="py-2 text-right">Consum.</th>
                <th className="py-2 text-right">Resg.</th>
              </tr>
            </thead>
            <tbody>
              {perItem.map(({ item, consumed, rewards }) => (
                <tr key={item.id} className="border-b border-g200 last:border-0">
                  <td className="py-2.5 text-ink font-display text-base">{item.label}</td>
                  <td className="py-2.5 text-right text-g600">{consumed}</td>
                  <td className="py-2.5 text-right text-g600">{rewards}</td>
                </tr>
              ))}
              {perItem.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-g500">
                    Sem itens.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* cadastro do programa */}
        <section className="bg-surface border border-g200 p-6 lg:col-span-2">
          <h2 className="font-display text-sm text-ink mb-4">Cadastro do programa</h2>
          <ProgramForm value={draft} onChange={setDraft} />

          <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-g200">
            <button type="button" className={`${btn('primary')} min-h-13`} onClick={() => setConfirm('save')}>
              Salvar
            </button>
            {program.is_active ? (
              <button
                type="button"
                className={`${btn('danger')} min-h-13`}
                onClick={() => setConfirm('deactivate')}
              >
                Inativar programa
              </button>
            ) : (
              <button
                type="button"
                className={`${btn('primary')} min-h-13`}
                onClick={() => setConfirm('reactivate')}
              >
                Reativar programa
              </button>
            )}
          </div>
        </section>
      </div>

      {dialog && (
        <ConfirmDialog
          open={!!confirm}
          title={dialog.title}
          message={dialog.message}
          confirmLabel={dialog.confirmLabel}
          tone={dialog.tone}
          onConfirm={runConfirm}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
