'use client'

import { useMemo, useState } from 'react'
import { useManager } from '@/lib/manager/store'
import { useConfirm } from '@/lib/manager/confirm'
import { customerName, fmtDate } from '@/lib/manager/mock'
import { PageHeader, VoucherBadge, Select, inputCls, btn } from '@/components/manager/ui'

// campo de data compacto (sem w-full do inputCls, p/ caber na linha de filtros)
const dateCls =
  'w-44 border border-g300 bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-ink'

export default function VouchersPage() {
  const { data, redeemVoucher, cancelVoucher } = useManager()
  const confirm = useConfirm()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const dayISO = (offset = 0) => {
    const d = new Date()
    d.setDate(d.getDate() + offset)
    const p = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
  }
  const today = dayISO(0)
  const yesterday = dayISO(-1)
  const setDay = (iso: string) => {
    setFrom(iso)
    setTo(iso)
  }
  const clearPeriod = () => {
    setFrom('')
    setTo('')
  }
  const periodSet = !!(from || to)
  const isDay = (iso: string) => from === iso && to === iso

  const byId = useMemo(
    () => Object.fromEntries(data.customers.map((c) => [c.id, c])),
    [data.customers],
  )

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    return data.vouchers.filter((v) => {
      if (status !== 'all' && v.status !== status) return false
      // período de emissão (issued_at no formato YYYY-MM-DD → comparação lexicográfica)
      if (from && v.issued_at < from) return false
      if (to && v.issued_at > to) return false
      const cust = byId[v.customer_id]
      const hay = `${v.code} ${cust ? customerName(cust) + ' ' + cust.email : ''}`.toLowerCase()
      return !s || hay.includes(s)
    })
  }, [data.vouchers, q, status, from, to, byId])

  const counts = {
    total: data.vouchers.length,
    redeemed: data.vouchers.filter((v) => v.status === 'redeemed').length,
    issued: data.vouchers.filter((v) => v.status === 'issued').length,
    expired: data.vouchers.filter((v) => v.status === 'expired').length,
  }

  // cards clicáveis (filtram por status). "Emitidos" = todos.
  const cards: { key: string; label: string; value: number }[] = [
    { key: 'all', label: 'Emitidos', value: counts.total },
    { key: 'redeemed', label: 'Resgatados', value: counts.redeemed },
    { key: 'issued', label: 'Não usados', value: counts.issued },
    { key: 'expired', label: 'Expirados', value: counts.expired },
  ]

  // clicar num card alterna o filtro (clicar no ativo volta para "todos")
  const pickStatus = (key: string) => setStatus((prev) => (prev === key ? 'all' : key))

  return (
    <div>
      <PageHeader title="Vouchers" subtitle={`${counts.total} vouchers no total`} />

      {/* big numbers — clicáveis para filtrar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((c) => {
          const active = status === c.key
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => pickStatus(c.key)}
              aria-pressed={active}
              className={`text-left p-5 border transition-colors ${
                active
                  ? 'bg-subtle border-ink'
                  : 'bg-surface border-g200 hover:border-g400'
              }`}
            >
              <div className="font-display text-[11px] tracking-widest text-g500">{c.label}</div>
              <div className="font-display text-4xl text-ink mt-2 leading-none">{c.value}</div>
              <div className="text-[11px] text-g500 mt-2 min-h-4">
                {active && c.key !== 'all' ? 'A filtrar ✕' : active ? 'Todos' : 'Filtrar'}
              </div>
            </button>
          )
        })}
      </div>

      {/* filtros — todos na mesma linha */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          className={`${inputCls} max-w-xs`}
          placeholder="Buscar por código, nome ou e-mail…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Select
          className="w-auto"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Status"
        >
          <option value="all">Status: todos</option>
          <option value="issued">Não usado</option>
          <option value="redeemed">Utilizado</option>
          <option value="expired">Expirado</option>
          <option value="cancelled">Cancelado</option>
        </Select>

        <span className="font-display text-[11px] tracking-wider text-g500 ml-1">Emitido:</span>
        <input
          type="date"
          className={dateCls}
          value={from}
          max={to || undefined}
          onChange={(e) => setFrom(e.target.value)}
          aria-label="Emitido de"
        />
        <span className="text-g400">–</span>
        <input
          type="date"
          className={dateCls}
          value={to}
          min={from || undefined}
          onChange={(e) => setTo(e.target.value)}
          aria-label="Emitido até"
        />
        <button
          type="button"
          aria-pressed={isDay(today)}
          onClick={() => setDay(today)}
          className={`font-display text-sm tracking-wide min-h-11 px-4 border transition-colors ${
            isDay(today) ? 'bg-ink text-paper border-ink' : 'bg-surface text-ink border-g300 hover:border-ink'
          }`}
        >
          Hoje
        </button>
        <button
          type="button"
          aria-pressed={isDay(yesterday)}
          onClick={() => setDay(yesterday)}
          className={`font-display text-sm tracking-wide min-h-11 px-4 border transition-colors ${
            isDay(yesterday) ? 'bg-ink text-paper border-ink' : 'bg-surface text-ink border-g300 hover:border-ink'
          }`}
        >
          Ontem
        </button>
        {periodSet && (
          <button
            type="button"
            onClick={clearPeriod}
            className="font-display text-sm tracking-wide min-h-11 px-3 text-g600 hover:text-ink transition-colors"
          >
            Limpar
          </button>
        )}
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
                          <button
                            className={btn('danger')}
                            onClick={async () => {
                              if (
                                await confirm({
                                  title: 'Cancelar voucher',
                                  message: `Cancelar o voucher ${v.code}? Ele deixará de ser válido para o cliente.`,
                                  confirmLabel: 'Cancelar voucher',
                                  tone: 'danger',
                                })
                              )
                                cancelVoucher(v.id)
                            }}
                          >
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
