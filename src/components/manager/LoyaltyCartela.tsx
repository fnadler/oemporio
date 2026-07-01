'use client'

import { useState } from 'react'
import { useManager } from '@/lib/manager/store'
import {
  activeLine,
  fmtDate,
  fmtDateTime,
  loyaltyConsumed,
  loyaltyRewards,
  type LoyaltyCard,
} from '@/lib/manager/mock'
import { StatCard, ConfirmDialog, Select, btn } from '@/components/manager/ui'

/**
 * Cartela de fidelidade (big numbers + grade de selos + histórico).
 * Reutilizada na tela de detalhe do contato e no modal da listagem.
 * Não renderiza título próprio — quem usa define o cabeçalho/título do modal.
 * Se o contato ainda não estiver num programa, mostra a atribuição.
 */
export function LoyaltyCartela({ customerId }: { customerId: string }) {
  const { data, assignProgram, markStamp, unmarkStamp, redeemCartela } = useManager()
  const [redeemCat, setRedeemCat] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [assignTo, setAssignTo] = useState('')

  const card = data.cards.find((c) => c.customer_id === customerId) ?? null
  const program = card ? data.programs.find((p) => p.id === card.program_id) ?? null : null

  // sem programa atribuído → tela de atribuição
  if (!card || !program) {
    const actives = data.programs.filter((p) => p.is_active)
    const selected = assignTo || actives[0]?.id || ''
    return (
      <div>
        <p className="text-sm text-g600 mb-4">
          Este contato ainda não participa de um programa de fidelidade.
        </p>
        {actives.length ? (
          <div className="flex flex-wrap gap-2 items-center">
            <Select
              className="w-auto"
              value={selected}
              onChange={(e) => setAssignTo(e.target.value)}
              aria-label="Programa"
            >
              {actives.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.points_required} selos
                </option>
              ))}
            </Select>
            <button
              type="button"
              className={btn('primary')}
              onClick={() => selected && assignProgram(customerId, selected)}
            >
              Atribuir programa
            </button>
          </div>
        ) : (
          <p className="text-sm text-g500">Nenhum programa ativo disponível.</p>
        )}
      </div>
    )
  }

  const threshold = program.points_required
  const items = program.items

  const consumed = loyaltyConsumed(card)
  const rewards = loyaltyRewards(card)

  const marksOf = (itemId: string) => activeLine(card, itemId)?.stamps.length ?? 0
  const completedOf = (itemId: string) =>
    card.lines.filter((l) => l.item_id === itemId && l.redeemed_at).length

  const itemLabel = (itemId: string) => items.find((it) => it.id === itemId)?.label ?? itemId
  const redeemItemLabel = redeemCat ? itemLabel(redeemCat) : ''

  return (
    <div>
      <p className="text-xs text-g500 mb-4">
        Programa: <span className="text-ink font-display">{program.name}</span> · resgate a cada{' '}
        {threshold} selos
      </p>

      {/* big numbers */}
      <div className="grid grid-cols-2 sm:max-w-md gap-4 mb-7">
        <StatCard label="Itens consumidos" value={consumed} hint="selos registrados" />
        <StatCard label="Itens resgatados" value={rewards} hint="prêmios resgatados" />
      </div>

      {/* cartela */}
      <div className="overflow-x-auto mgr-scroll pb-1">
        <CartelaHeader threshold={threshold} />
        {items.map((it) => (
          <CartelaRow
            key={it.id}
            label={it.label}
            marks={marksOf(it.id)}
            threshold={threshold}
            completed={completedOf(it.id)}
            onMark={() => markStamp(customerId, it.id)}
            onUnmark={() => unmarkStamp(customerId, it.id)}
            onRedeem={() => setRedeemCat(it.id)}
          />
        ))}
      </div>
      <p className="text-xs text-g500 mt-3">
        Toque no próximo quadrado para registar um selo; o último selo pode ser desfeito. Ao completar{' '}
        {threshold}, o resgate do prêmio é liberado.
      </p>

      {/* histórico */}
      <LoyaltyHistory
        card={card}
        catLabel={itemLabel}
        open={showHistory}
        onToggle={() => setShowHistory((v) => !v)}
      />

      {redeemCat && (
        <ConfirmDialog
          open={!!redeemCat}
          title="Resgatar prêmio"
          message={`Confirmar o resgate do prêmio da cartela ${redeemItemLabel}? A cartela será fechada e uma nova, zerada, será aberta para o item.`}
          confirmLabel="Resgatar prêmio"
          tone="primary"
          onConfirm={() => redeemCartela(customerId, redeemCat)}
          onClose={() => setRedeemCat(null)}
        />
      )}
    </div>
  )
}

const COLS = (threshold: number) => ({
  display: 'grid',
  // largura fixa na coluna FREE para alinhar cabeçalho e linhas (grids independentes)
  gridTemplateColumns: `3.5rem repeat(${threshold}, 3.5rem) 7rem`,
  alignItems: 'center',
  gap: '0.5rem',
})

function CartelaHeader({ threshold }: { threshold: number }) {
  return (
    <div style={COLS(threshold)} className="mb-2 min-w-max">
      <div />
      {Array.from({ length: threshold }).map((_, i) => (
        <div key={i} className="text-center font-display text-[11px] tracking-wider text-g500">
          {i + 1}X
        </div>
      ))}
      <div className="text-center font-display text-[11px] tracking-wider text-g500">FREE</div>
    </div>
  )
}

function CartelaRow({
  label,
  marks,
  threshold,
  completed,
  onMark,
  onUnmark,
  onRedeem,
}: {
  label: string
  marks: number
  threshold: number
  completed: number
  onMark: () => void
  onUnmark: () => void
  onRedeem: () => void
}) {
  const canRedeem = marks >= threshold

  return (
    <div style={COLS(threshold)} className="mb-2 min-w-max">
      <div className="leading-none">
        <div className="font-display text-2xl text-ink">{label}</div>
        {completed > 0 && <div className="text-[10px] text-g500 mt-1">✓ {completed}</div>}
      </div>

      {Array.from({ length: threshold }).map((_, i) => {
        const filled = i < marks
        const isNext = i === marks // próximo a marcar
        const isLastFilled = i === marks - 1 // último marcado (desfazer)
        const clickable = isNext || isLastFilled
        const onClick = isNext ? onMark : isLastFilled ? onUnmark : undefined
        return (
          <button
            key={i}
            type="button"
            disabled={!clickable}
            onClick={onClick}
            aria-label={
              isNext ? `Marcar ${i + 1}` : isLastFilled ? `Desfazer ${i + 1}` : `Quadrado ${i + 1}`
            }
            title={isLastFilled ? 'Desfazer último selo' : undefined}
            className={`w-14 h-14 border-2 flex items-center justify-center text-xl transition-colors disabled:cursor-default ${
              filled
                ? 'bg-ink border-ink text-paper'
                : isNext
                  ? 'bg-surface border-g400 text-g400 hover:border-ink hover:text-ink'
                  : 'bg-surface border-g200 text-transparent'
            }`}
          >
            {filled ? '✓' : isNext ? '+' : ''}
          </button>
        )
      })}

      <button
        type="button"
        disabled={!canRedeem}
        onClick={onRedeem}
        className={`w-full min-h-14 px-3 font-display text-sm tracking-wide border inline-flex items-center justify-center transition-colors ${
          canRedeem
            ? 'bg-ink text-paper border-ink hover:bg-ink2'
            : 'bg-surface text-g400 border-g200 cursor-not-allowed'
        }`}
      >
        {canRedeem ? 'Resgatar' : 'FREE'}
      </button>
    </div>
  )
}

type LoyEvent = { kind: 'stamp' | 'redeem'; at: string; by: string; cat: string }

function LoyaltyHistory({
  card,
  catLabel,
  open,
  onToggle,
}: {
  card: LoyaltyCard | null
  catLabel: (id: string) => string
  open: boolean
  onToggle: () => void
}) {
  const events: LoyEvent[] = card
    ? card.lines
        .flatMap((l) => {
          const cat = catLabel(l.item_id)
          const evs: LoyEvent[] = l.stamps.map((s) => ({ kind: 'stamp', at: s.at, by: s.by, cat }))
          if (l.redeemed_at) {
            evs.push({ kind: 'redeem', at: l.redeemed_at, by: l.redeemed_by ?? '—', cat })
          }
          return evs
        })
        .sort((a, b) => b.at.localeCompare(a.at))
    : []

  if (!events.length) return null

  return (
    <div className="border-t border-g200 mt-6 pt-4">
      <button
        type="button"
        onClick={onToggle}
        className="font-display text-sm text-ink inline-flex items-center gap-2 min-h-11"
        aria-expanded={open}
      >
        Histórico ({events.length})
        <span className="text-g500">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <ul className="divide-y divide-g200 border-t border-g200 mt-3">
          {events.map((e, i) => (
            <li key={i} className="flex items-center justify-between gap-4 py-3 text-sm">
              <span className="text-ink">
                {e.kind === 'redeem' ? '🎁 Prêmio resgatado' : 'Selo registrado'}
                <span className="text-g500"> · cat. {e.cat}</span>
              </span>
              <span className="text-right shrink-0">
                <span className="text-g600">
                  {e.kind === 'redeem' ? fmtDate(e.at) : fmtDateTime(e.at)}
                </span>
                <span className="block text-[11px] text-g500">{e.by}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
