'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useManager } from '@/lib/manager/store'
import {
  customerName,
  fmtDate,
  loyaltyConsumed,
  loyaltyRewards,
  postCategoryLabel,
} from '@/lib/manager/mock'
import { PageHeader, StatCard, Badge } from '@/components/manager/ui'

export default function DashboardPage() {
  const { data, user } = useManager()
  const [view, setView] = useState<'latest' | 'best'>('latest')

  // big numbers
  const vRedeemed = data.vouchers.filter((v) => v.status === 'redeemed').length
  const vTotal = data.vouchers.length
  const cardsTotal = data.cards.length
  const cardsInUse = data.cards.filter((c) => loyaltyConsumed(c) > 0).length
  const loyRewards = data.cards.reduce((s, c) => s + loyaltyRewards(c), 0)
  const loyConsumed = data.cards.reduce((s, c) => s + loyaltyConsumed(c), 0)

  const latest = [...data.customers]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 6)

  const best = data.cards
    .map((c) => ({
      customer: data.customers.find((x) => x.id === c.customer_id) ?? null,
      consumed: loyaltyConsumed(c),
      rewards: loyaltyRewards(c),
    }))
    .filter((x) => x.customer)
    .sort((a, b) => b.consumed - a.consumed || b.rewards - a.rewards)
    .slice(0, 6)

  const agenda = [...data.posts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4)

  const tab = (v: 'latest' | 'best', label: string) => (
    <button
      type="button"
      onClick={() => setView(v)}
      className={`font-display text-xs tracking-wider min-h-9 px-3 border transition-colors ${
        view === v ? 'bg-ink text-paper border-ink' : 'bg-surface text-g600 border-g300 hover:border-ink'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div>
      <PageHeader title={`Olá, ${user.split(' ')[0]}`} subtitle="Visão geral do O Empório" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total de contatos" value={data.customers.length} hint="clientes / leads" />
        <StatCard label="Vouchers" value={`${vRedeemed}/${vTotal}`} hint="utilizados / emitidos" />
        <StatCard label="Fidelidade (cartões)" value={`${cardsInUse}/${cardsTotal}`} hint="em uso / atribuídos" />
        <StatCard label="Fidelidade (itens)" value={`${loyRewards}/${loyConsumed}`} hint="resgatados / consumidos" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-g200">
          <div className="flex items-center justify-between gap-3 border-b border-g200 px-5 py-3.5">
            <div className="flex gap-1.5">
              {tab('latest', 'Últimos')}
              {tab('best', 'Melhores clientes')}
            </div>
            <Link href="/manager/contatos" className="font-display text-xs text-g600 hover:text-ink">
              Ver todos →
            </Link>
          </div>

          {view === 'latest' ? (
            <ul>
              {latest.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between px-5 py-3 border-b border-g200 last:border-0"
                >
                  <div>
                    <div className="text-sm text-ink">{customerName(c)}</div>
                    <div className="text-xs text-g500">{c.email}</div>
                  </div>
                  <div className="text-right">
                    <Badge tone="outline">{c.language.toUpperCase()}</Badge>
                    <div className="text-[11px] text-g500 mt-1">{fmtDate(c.created_at)}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <ul>
              {best.map(({ customer, consumed, rewards }) => (
                <li
                  key={customer!.id}
                  className="flex items-center justify-between px-5 py-3 border-b border-g200 last:border-0"
                >
                  <div>
                    <div className="text-sm text-ink">{customerName(customer!)}</div>
                    <div className="text-xs text-g500">{customer!.email}</div>
                  </div>
                  <div className="text-right leading-tight">
                    <div className="font-display text-ink">{consumed} <span className="text-g500 text-xs">consumidos</span></div>
                    <div className="text-[11px] text-g500 mt-0.5">{rewards} resgate{rewards === 1 ? '' : 's'}</div>
                  </div>
                </li>
              ))}
              {best.length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-g500">Sem clientes em programas ainda.</li>
              )}
            </ul>
          )}
        </div>

        <div className="bg-surface border border-g200">
          <div className="flex items-center justify-between border-b border-g200 px-5 py-3.5">
            <h3 className="font-display text-base text-ink">Agenda &amp; novidades</h3>
            <Link href="/manager/novidades" className="font-display text-xs text-g600 hover:text-ink">
              Gerir →
            </Link>
          </div>
          <ul>
            {agenda.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between px-5 py-3 border-b border-g200 last:border-0"
              >
                <div>
                  <div className="text-sm text-ink">{p.title_pt}</div>
                  <div className="text-xs text-g500">
                    {postCategoryLabel(data.postCategories, p.category_id)}
                  </div>
                </div>
                <div className="text-right">
                  <Badge tone={p.status === 'published' ? 'ok' : 'outline'}>
                    {p.status === 'published' ? 'Publicado' : 'Rascunho'}
                  </Badge>
                  <div className="text-[11px] text-g500 mt-1">{fmtDate(p.date)}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
