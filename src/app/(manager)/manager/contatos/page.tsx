'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useManager } from '@/lib/manager/store'
import { customerName, loyaltyConsumed, loyaltyRewards } from '@/lib/manager/mock'
import {
  PageHeader,
  Badge,
  VoucherBadge,
  Select,
  Pagination,
  Modal,
  inputCls,
  LIVES_LABEL,
} from '@/components/manager/ui'
import { LoyaltyCartela } from '@/components/manager/LoyaltyCartela'
import { VoucherManager } from '@/components/manager/VoucherManager'

const actionBtn =
  'font-display text-xs tracking-wide min-h-11 px-3 border border-g300 bg-surface text-ink hover:border-ink transition-colors whitespace-nowrap'

const PAGE_SIZE = 8

export default function ContatosPage() {
  const { data } = useManager()
  const router = useRouter()
  const [q, setQ] = useState('')
  const [lang, setLang] = useState('all')
  const [lives, setLives] = useState('all')
  const [voucher, setVoucher] = useState('all')
  const [card, setCard] = useState('all')
  const [page, setPage] = useState(1)
  // modais de ação rápida na listagem (id do contato)
  const [loyaltyFor, setLoyaltyFor] = useState<string | null>(null)
  const [voucherFor, setVoucherFor] = useState<string | null>(null)

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    const hasVoucher = (cid: string) => data.vouchers.some((v) => v.customer_id === cid)
    const hasCard = (cid: string) => data.cards.some((c) => c.customer_id === cid)
    return data.customers.filter((c) => {
      if (lang !== 'all' && c.language !== lang) return false
      if (lives !== 'all' && c.lives_in_portugal !== lives) return false
      if (voucher === 'sim' && !hasVoucher(c.id)) return false
      if (voucher === 'nao' && hasVoucher(c.id)) return false
      if (card === 'sim' && !hasCard(c.id)) return false
      if (card === 'nao' && hasCard(c.id)) return false
      if (s && !`${customerName(c)} ${c.email}`.toLowerCase().includes(s)) return false
      return true
    })
  }, [data.customers, data.vouchers, data.cards, q, lang, lives, voucher, card])

  // volta à primeira página quando o filtro muda (ajuste de estado no render — padrão React)
  const filterKey = `${q}|${lang}|${lives}|${voucher}|${card}`
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey)
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey)
    setPage(1)
  }

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const paged = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const lastVoucher = (cid: string) =>
    data.vouchers.find((v) => v.customer_id === cid) ?? null

  const loyaltyStats = (cid: string) => {
    const card = data.cards.find((c) => c.customer_id === cid)
    if (!card) return null
    return { consumed: loyaltyConsumed(card), rewards: loyaltyRewards(card) }
  }

  const customerById = (cid: string) => {
    const c = data.customers.find((x) => x.id === cid)
    return c ? customerName(c) : 'Contato'
  }

  return (
    <div>
      <PageHeader
        title="Contatos"
        subtitle={`${data.customers.length} clientes / leads`}
      />

      {/* filtros */}
      <div className="flex gap-2 mb-4 items-center">
        <input
          className={`${inputCls} max-w-xs`}
          placeholder="Buscar por nome ou e-mail…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Select className="w-auto" value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Idioma">
          <option value="all">Idioma: todos</option>
          <option value="pt">PT</option>
          <option value="en">EN</option>
        </Select>
        <Select className="w-auto" value={lives} onChange={(e) => setLives(e.target.value)} aria-label="Vive em PT">
          <option value="all">Vive em PT: todos</option>
          <option value="sim">Sim</option>
          <option value="freq">Frequente</option>
          <option value="nao">Não</option>
          <option value="na">N/D</option>
        </Select>
        <Select className="w-auto" value={voucher} onChange={(e) => setVoucher(e.target.value)} aria-label="Voucher">
          <option value="all">Voucher: todos</option>
          <option value="sim">Com voucher</option>
          <option value="nao">Sem voucher</option>
        </Select>
        <Select className="w-auto" value={card} onChange={(e) => setCard(e.target.value)} aria-label="Cartão fidelidade">
          <option value="all">Fidelidade: todos</option>
          <option value="sim">Com cartão</option>
          <option value="nao">Sem cartão</option>
        </Select>
      </div>

      <div className="bg-surface border border-g200 overflow-x-auto mgr-scroll">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="font-display text-[11px] tracking-wider text-g500 text-left border-b border-g200">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Idioma</th>
              <th className="px-4 py-3">Vive em PT</th>
              <th className="px-4 py-3">Distrito</th>
              <th className="px-4 py-3">Mkt</th>
              <th className="px-4 py-3">Fidelidade</th>
              <th className="px-4 py-3">Voucher</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((c) => {
              const v = lastVoucher(c.id)
              const loy = loyaltyStats(c.id)
              return (
                <tr
                  key={c.id}
                  onClick={() => router.push(`/manager/contatos/${c.id}`)}
                  className="border-b border-g200 last:border-0 hover:bg-subtle cursor-pointer"
                >
                  <td className="px-4 py-3 text-ink">{customerName(c)}</td>
                  <td className="px-4 py-3">
                    <Badge tone="outline">{c.language.toUpperCase()}</Badge>
                  </td>
                  <td className="px-4 py-3 text-g600">{LIVES_LABEL[c.lives_in_portugal]}</td>
                  <td className="px-4 py-3 text-g600">{c.district || '—'}</td>
                  <td className="px-4 py-3">{c.consent_marketing ? '✓' : '—'}</td>
                  <td className="px-4 py-3 text-g600">
                    {loy ? (
                      <span>
                        {loy.consumed} selo{loy.consumed === 1 ? '' : 's'}
                        {loy.rewards > 0 && <span className="text-g500"> · {loy.rewards}★</span>}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3">{v ? <VoucherBadge status={v.status} /> : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className={actionBtn}
                        onClick={() => setLoyaltyFor(c.id)}
                      >
                        Fidelidade
                      </button>
                      <button
                        type="button"
                        className={actionBtn}
                        onClick={() => setVoucherFor(c.id)}
                      >
                        Voucher
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-g500">
                  Nenhum contato encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {rows.length > 0 && (
        <div className="flex items-center justify-between gap-4 mt-4">
          <p className="text-xs text-g500">
            {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, rows.length)} de {rows.length}
          </p>
          <Pagination page={current} pageCount={pageCount} onPage={setPage} />
        </div>
      )}

      {/* ação rápida: fidelidade */}
      {loyaltyFor && (
        <Modal
          open
          onClose={() => setLoyaltyFor(null)}
          width="max-w-2xl"
          title={`Fidelidade — ${customerById(loyaltyFor)}`}
        >
          <LoyaltyCartela customerId={loyaltyFor} />
        </Modal>
      )}

      {/* ação rápida: vouchers */}
      {voucherFor && (
        <Modal
          open
          onClose={() => setVoucherFor(null)}
          title={`Vouchers — ${customerById(voucherFor)}`}
        >
          <VoucherManager customerId={voucherFor} />
        </Modal>
      )}
    </div>
  )
}
