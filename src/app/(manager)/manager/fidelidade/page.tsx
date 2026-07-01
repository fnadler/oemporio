'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useManager } from '@/lib/manager/store'
import { fmtDate, loyaltyConsumed, loyaltyRewards, programStats } from '@/lib/manager/mock'
import { PageHeader, StatCard, Badge, Select, inputCls, btn } from '@/components/manager/ui'

export default function FidelidadePage() {
  const { data } = useManager()
  const router = useRouter()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')

  const totals = {
    programs: data.programs.length,
    consumed: data.cards.reduce((s, c) => s + loyaltyConsumed(c), 0),
    rewards: data.cards.reduce((s, c) => s + loyaltyRewards(c), 0),
  }

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    return data.programs.filter((p) => {
      if (status === 'active' && !p.is_active) return false
      if (status === 'inactive' && p.is_active) return false
      if (s && !p.name.toLowerCase().includes(s)) return false
      return true
    })
  }, [data.programs, q, status])

  return (
    <div>
      <PageHeader
        title="Fidelidade"
        subtitle={`${data.programs.length} programa${data.programs.length === 1 ? '' : 's'}`}
        actions={
          <Link href="/manager/fidelidade/novo" className={btn('primary')}>
            + Novo programa
          </Link>
        }
      />

      {/* big numbers */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total de programas" value={totals.programs} hint="cadastrados" />
        <StatCard label="Itens consumidos" value={totals.consumed} hint="selos registrados" />
        <StatCard label="Itens resgatados" value={totals.rewards} hint="prêmios resgatados" />
      </div>

      {/* filtros — mesma linha */}
      <div className="flex gap-2 mb-4 items-center">
        <input
          className={`${inputCls} max-w-xs`}
          placeholder="Buscar por nome do programa…"
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
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </Select>
      </div>

      <div className="bg-surface border border-g200 overflow-x-auto mgr-scroll">
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr className="font-display text-[11px] tracking-wider text-g500 text-left border-b border-g200">
              <th className="px-4 py-3">Programa</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ativação</th>
              <th className="px-4 py-3">Inativação</th>
              <th className="px-4 py-3">Clientes</th>
              <th className="px-4 py-3">Consumidos</th>
              <th className="px-4 py-3">Resgatados</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const st = programStats(data.cards, p.id)
              return (
                <tr
                  key={p.id}
                  onClick={() => router.push(`/manager/fidelidade/${p.id}`)}
                  className="border-b border-g200 last:border-0 hover:bg-subtle cursor-pointer"
                >
                  <td className="px-4 py-3 text-ink">
                    {p.name}
                    <div className="text-xs text-g500">
                      {p.items.length} {p.items.length === 1 ? 'item' : 'itens'} · {p.points_required} selos
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={p.is_active ? 'ok' : 'muted'}>{p.is_active ? 'Ativo' : 'Inativo'}</Badge>
                  </td>
                  <td className="px-4 py-3 text-g600">{fmtDate(p.activated_at)}</td>
                  <td className="px-4 py-3 text-g600">{fmtDate(p.deactivated_at)}</td>
                  <td className="px-4 py-3 font-display text-ink">{st.customers}</td>
                  <td className="px-4 py-3 text-g600">{st.consumed}</td>
                  <td className="px-4 py-3 text-g600">{st.rewards}</td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-g500">
                  Nenhum programa encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
