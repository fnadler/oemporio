'use client'

import Link from 'next/link'
import { useManager } from '@/lib/manager/store'
import { customerName, fmtDate } from '@/lib/manager/mock'
import { PageHeader, StatCard, Badge } from '@/components/manager/ui'

export default function DashboardPage() {
  const { data, user } = useManager()

  const issued = data.vouchers.length
  const redeemed = data.vouchers.filter((v) => v.status === 'redeemed').length
  const stamps = data.cards.reduce((s, c) => s + c.balance, 0)
  const published = data.posts.filter((p) => p.status === 'published').length

  const latest = [...data.customers]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 6)

  const agenda = [...data.posts]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4)

  return (
    <div>
      <PageHeader title={`Olá, ${user.split(' ')[0]}`} subtitle="Visão geral do O Empório" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Leads no mês" value={data.customers.length} hint="novos cadastros" />
        <StatCard
          label="Vouchers"
          value={`${redeemed}/${issued}`}
          hint="utilizados / emitidos"
        />
        <StatCard label="Selos (fidelidade)" value={stamps} hint="cervejas registadas" />
        <StatCard label="Novidades" value={published} hint="publicadas" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-g200">
          <div className="flex items-center justify-between border-b border-g200 px-5 py-3.5">
            <h3 className="font-display text-base text-ink">Últimos cadastros</h3>
            <Link href="/manager/contatos" className="font-display text-xs text-g600 hover:text-ink">
              Ver todos →
            </Link>
          </div>
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
                  <div className="text-xs text-g500">{p.category_pt}</div>
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
