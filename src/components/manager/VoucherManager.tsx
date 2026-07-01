'use client'

import { useState } from 'react'
import { useManager } from '@/lib/manager/store'
import { fmtDate, type Voucher } from '@/lib/manager/mock'
import { VoucherBadge, ConfirmDialog } from '@/components/manager/ui'

type ConfirmType = 'redeem' | 'cancel' | 'reactivate'

const CONFIRM: Record<
  ConfirmType,
  { title: string; message: string; confirmLabel: string; tone: 'primary' | 'danger' }
> = {
  redeem: {
    title: 'Resgatar voucher',
    message: 'Marcar este voucher como utilizado? O desconto será validado para o cliente.',
    confirmLabel: 'Resgatar',
    tone: 'primary',
  },
  cancel: {
    title: 'Cancelar voucher',
    message: 'Cancelar este voucher? Ele deixará de ser válido para o cliente.',
    confirmLabel: 'Cancelar voucher',
    tone: 'danger',
  },
  reactivate: {
    title: 'Reativar voucher',
    message: 'Reativar este voucher? Ele volta a ficar emitido, com nova validade de 30 dias.',
    confirmLabel: 'Reativar',
    tone: 'primary',
  },
}

// botões grandes p/ uso por toque (tablet)
const touchBtn =
  'min-h-13 px-5 flex-1 font-display text-sm tracking-wide border inline-flex items-center justify-center gap-2 transition-colors'
const touchPrimary = `${touchBtn} bg-ink text-paper border-ink hover:bg-ink2`
const touchDanger = `${touchBtn} bg-transparent text-danger border-danger hover:bg-danger hover:text-paper`

/**
 * Gestão dos vouchers de um contato (resgatar / cancelar / reativar, com
 * confirmação). Reutilizada na tela de detalhe e no modal da listagem.
 * Não renderiza título próprio.
 */
export function VoucherManager({ customerId }: { customerId: string }) {
  const { data, redeemVoucher, cancelVoucher, reactivateVoucher } = useManager()
  const [confirm, setConfirm] = useState<{ id: string; type: ConfirmType } | null>(null)

  const vouchers = data.vouchers.filter((v) => v.customer_id === customerId)

  const runConfirm = () => {
    if (!confirm) return
    if (confirm.type === 'redeem') redeemVoucher(confirm.id)
    else if (confirm.type === 'cancel') cancelVoucher(confirm.id)
    else reactivateVoucher(confirm.id)
  }

  const dialog = confirm ? CONFIRM[confirm.type] : null

  return (
    <div>
      {vouchers.length ? (
        <div className="flex flex-col gap-4">
          {vouchers.map((v) => (
            <VoucherCard key={v.id} voucher={v} onAction={(type) => setConfirm({ id: v.id, type })} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-g500">Sem vouchers.</p>
      )}

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

function VoucherCard({
  voucher: v,
  onAction,
}: {
  voucher: Voucher
  onAction: (type: ConfirmType) => void
}) {
  const dates: [string, string][] = [
    ['Emitido', fmtDate(v.issued_at)],
    ['Utilizado', fmtDate(v.redeemed_at)],
    ['Expira', fmtDate(v.expires_at)],
    ['Desconto', `${v.discount_pct}%`],
  ]

  return (
    <div className="border border-g200 p-5 flex flex-col">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="font-mono text-base text-ink">{v.code}</span>
        <VoucherBadge status={v.status} />
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 mt-4 mb-5">
        {dates.map(([k, val]) => (
          <div key={k}>
            <dt className="font-display text-[11px] tracking-wider text-g500">{k}</dt>
            <dd className="text-sm text-ink mt-0.5">{val}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto flex gap-3">
        {v.status === 'issued' && (
          <>
            <button type="button" className={touchPrimary} onClick={() => onAction('redeem')}>
              Resgatar
            </button>
            <button type="button" className={touchDanger} onClick={() => onAction('cancel')}>
              Cancelar
            </button>
          </>
        )}
        {(v.status === 'expired' || v.status === 'cancelled') && (
          <button type="button" className={touchPrimary} onClick={() => onAction('reactivate')}>
            Reativar
          </button>
        )}
        {v.status === 'redeemed' && (
          <p className="text-sm text-g500">Utilizado em {fmtDate(v.redeemed_at)}.</p>
        )}
      </div>
    </div>
  )
}
