'use client'

import { useMemo, useState } from 'react'
import { useManager } from '@/lib/manager/store'
import { customerName, fmtDate, type Customer } from '@/lib/manager/mock'
import {
  PageHeader,
  Badge,
  VoucherBadge,
  Modal,
  inputCls,
  LIVES_LABEL,
} from '@/components/manager/ui'

export default function ContatosPage() {
  const { data } = useManager()
  const [q, setQ] = useState('')
  const [lang, setLang] = useState('all')
  const [lives, setLives] = useState('all')
  const [consent, setConsent] = useState('all')
  const [openId, setOpenId] = useState<string | null>(null)

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    return data.customers.filter((c) => {
      if (lang !== 'all' && c.language !== lang) return false
      if (lives !== 'all' && c.lives_in_portugal !== lives) return false
      if (consent === 'sim' && !c.consent_marketing) return false
      if (consent === 'nao' && c.consent_marketing) return false
      if (s && !`${customerName(c)} ${c.email}`.toLowerCase().includes(s)) return false
      return true
    })
  }, [data.customers, q, lang, lives, consent])

  const lastVoucher = (cid: string) =>
    data.vouchers.find((v) => v.customer_id === cid) ?? null

  const selected = data.customers.find((c) => c.id === openId) ?? null

  return (
    <div>
      <PageHeader
        title="Contatos"
        subtitle={`${data.customers.length} clientes / leads`}
      />

      {/* filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          className={`${inputCls} max-w-xs`}
          placeholder="Buscar por nome ou e-mail…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className={`${inputCls} w-auto`} value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value="all">Idioma: todos</option>
          <option value="pt">PT</option>
          <option value="en">EN</option>
        </select>
        <select className={`${inputCls} w-auto`} value={lives} onChange={(e) => setLives(e.target.value)}>
          <option value="all">Vive em PT: todos</option>
          <option value="sim">Sim</option>
          <option value="freq">Frequente</option>
          <option value="nao">Não</option>
          <option value="na">N/D</option>
        </select>
        <select className={`${inputCls} w-auto`} value={consent} onChange={(e) => setConsent(e.target.value)}>
          <option value="all">Marketing: todos</option>
          <option value="sim">Consentiu</option>
          <option value="nao">Não consentiu</option>
        </select>
      </div>

      <div className="bg-surface border border-g200 overflow-x-auto mgr-scroll">
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr className="font-display text-[11px] tracking-wider text-g500 text-left border-b border-g200">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">Idioma</th>
              <th className="px-4 py-3">Vive em PT</th>
              <th className="px-4 py-3">Distrito</th>
              <th className="px-4 py-3">Mkt</th>
              <th className="px-4 py-3">Cadastro</th>
              <th className="px-4 py-3">Voucher</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const v = lastVoucher(c.id)
              return (
                <tr
                  key={c.id}
                  onClick={() => setOpenId(c.id)}
                  className="border-b border-g200 last:border-0 hover:bg-subtle cursor-pointer"
                >
                  <td className="px-4 py-3 text-ink">{customerName(c)}</td>
                  <td className="px-4 py-3 text-g600">{c.email}</td>
                  <td className="px-4 py-3 text-g600">
                    {c.phone_dialcode} {c.phone_number}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="outline">{c.language.toUpperCase()}</Badge>
                  </td>
                  <td className="px-4 py-3 text-g600">{LIVES_LABEL[c.lives_in_portugal]}</td>
                  <td className="px-4 py-3 text-g600">{c.district || '—'}</td>
                  <td className="px-4 py-3">{c.consent_marketing ? '✓' : '—'}</td>
                  <td className="px-4 py-3 text-g600">{fmtDate(c.created_at)}</td>
                  <td className="px-4 py-3">{v ? <VoucherBadge status={v.status} /> : '—'}</td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-g500">
                  Nenhum contato encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CustomerDetail
        customer={selected}
        onClose={() => setOpenId(null)}
        vouchers={selected ? data.vouchers.filter((v) => v.customer_id === selected.id) : []}
        cardBalance={selected ? data.cards.find((c) => c.customer_id === selected.id)?.balance ?? null : null}
        pointsRequired={data.program.points_required}
      />
    </div>
  )
}

function CustomerDetail({
  customer,
  onClose,
  vouchers,
  cardBalance,
  pointsRequired,
}: {
  customer: Customer | null
  onClose: () => void
  vouchers: { id: string; code: string; status: string; issued_at: string }[]
  cardBalance: number | null
  pointsRequired: number
}) {
  if (!customer) return null
  const rows: [string, string][] = [
    ['E-mail', customer.email],
    ['Telefone', `${customer.phone_dialcode} ${customer.phone_number}`],
    ['Idioma', customer.language.toUpperCase()],
    ['Onde nasceu', customer.birth_country],
    ['Vive em Portugal', LIVES_LABEL[customer.lives_in_portugal]],
    ['Distrito', customer.district || '—'],
    ['Consent. marketing', customer.consent_marketing ? 'Sim' : 'Não'],
    ['Cadastro', fmtDate(customer.created_at)],
  ]

  return (
    <Modal open={!!customer} onClose={onClose} title={customerName(customer)}>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 mb-6">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="font-display text-[11px] tracking-wider text-g500">{k}</dt>
            <dd className="text-sm text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="border-t border-g200 pt-4 mb-4">
        <h4 className="font-display text-sm text-ink mb-2">Vouchers</h4>
        {vouchers.length ? (
          <ul className="space-y-1.5">
            {vouchers.map((v) => (
              <li key={v.id} className="flex items-center justify-between text-sm">
                <span className="font-mono text-g600">{v.code}</span>
                <span className="flex items-center gap-3">
                  <span className="text-xs text-g500">{fmtDate(v.issued_at)}</span>
                  <VoucherBadge status={v.status} />
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-g500">Sem vouchers.</p>
        )}
      </div>

      <div className="border-t border-g200 pt-4">
        <h4 className="font-display text-sm text-ink mb-2">Cartão Fidelidade</h4>
        {cardBalance !== null ? (
          <p className="text-sm text-ink">
            Saldo: <b>{cardBalance}</b> / {pointsRequired} selos
          </p>
        ) : (
          <p className="text-sm text-g500">Sem cartão ativo.</p>
        )}
      </div>
    </Modal>
  )
}
