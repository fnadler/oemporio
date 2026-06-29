'use client'

import { useMemo, useState } from 'react'
import { useManager } from '@/lib/manager/store'
import { customerName, fmtDate } from '@/lib/manager/mock'
import { PageHeader, VoucherBadge, inputCls, btn } from '@/components/manager/ui'

export default function VouchersPage() {
  const { data, redeemVoucher, cancelVoucher } = useManager()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')

  const byId = useMemo(
    () => Object.fromEntries(data.customers.map((c) => [c.id, c])),
    [data.customers],
  )

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    return data.vouchers.filter((v) => {
      if (status !== 'all' && v.status !== status) return false
      const cust = byId[v.customer_id]
      const hay = `${v.code} ${cust ? customerName(cust) + ' ' + cust.email : ''}`.toLowerCase()
      return !s || hay.includes(s)
    })
  }, [data.vouchers, q, status, byId])

  const counts = {
    issued: data.vouchers.filter((v) => v.status === 'issued').length,
    redeemed: data.vouchers.filter((v) => v.status === 'redeemed').length,
  }

  return (
    <div>
      <PageHeader
        title="Vouchers"
        subtitle={`${counts.issued} emitidos por usar · ${counts.redeemed} utilizados`}
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          className={`${inputCls} max-w-xs`}
          placeholder="Buscar por código, nome ou e-mail…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className={`${inputCls} w-auto`} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Status: todos</option>
          <option value="issued">Emitido</option>
          <option value="redeemed">Utilizado</option>
          <option value="expired">Expirado</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      <div className="bg-surface border border-g200 overflow-x-auto mgr-scroll">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="font-display text-[11px] tracking-wider text-g500 text-left border-b border-g200">
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Emitido</th>
              <th className="px-4 py-3">Expira</th>
              <th className="px-4 py-3">Utilizado</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => {
              const cust = byId[v.customer_id]
              return (
                <tr key={v.id} className="border-b border-g200 last:border-0 hover:bg-subtle">
                  <td className="px-4 py-3 font-mono text-ink">{v.code}</td>
                  <td className="px-4 py-3 text-g600">
                    {cust ? customerName(cust) : '—'}
                    <div className="text-xs text-g500">{cust?.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <VoucherBadge status={v.status} />
                  </td>
                  <td className="px-4 py-3 text-g600">{fmtDate(v.issued_at)}</td>
                  <td className="px-4 py-3 text-g600">{fmtDate(v.expires_at)}</td>
                  <td className="px-4 py-3 text-g600">{fmtDate(v.redeemed_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {v.status === 'issued' ? (
                        <>
                          <button className={btn('primary')} onClick={() => redeemVoucher(v.id)}>
                            Validar
                          </button>
                          <button className={btn('danger')} onClick={() => cancelVoucher(v.id)}>
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-g400">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-g500">
                  Nenhum voucher encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
