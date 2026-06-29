'use client'

import { useState } from 'react'
import { useManager } from '@/lib/manager/store'
import { customerName } from '@/lib/manager/mock'
import { PageHeader, Field, inputCls, btn, Toggle, Badge } from '@/components/manager/ui'

export default function FidelidadePage() {
  const { data, role, updateProgram, addStamps, redeemReward } = useManager()
  const isOwner = role === 'owner'

  const [form, setForm] = useState(data.program)
  const [cardId, setCardId] = useState(data.cards[0]?.id ?? '')
  const [qty, setQty] = useState(1)

  const req = data.program.points_required
  const byCustomer = Object.fromEntries(data.customers.map((c) => [c.id, c]))

  return (
    <div>
      <PageHeader title="Cartão Fidelidade" subtitle="Programa configurável + registo de consumo" />

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Configuração do programa */}
        <div className="bg-surface border border-g200 p-5">
          <h3 className="font-display text-base text-ink mb-4">
            Regra do programa {!isOwner && <Badge tone="outline">Só leitura</Badge>}
          </h3>
          <div className="space-y-3">
            <Field label="Nome do programa">
              <input
                className={inputCls}
                value={form.name}
                disabled={!isOwner}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Escopo elegível">
                <select
                  className={inputCls}
                  value={form.eligible_scope}
                  disabled={!isOwner}
                  onChange={(e) =>
                    setForm({ ...form, eligible_scope: e.target.value as 'category' | 'item' })
                  }
                >
                  <option value="category">Categoria</option>
                  <option value="item">Item</option>
                </select>
              </Field>
              <Field label="Referência (ex.: taps)">
                <input
                  className={inputCls}
                  value={form.eligible_ref}
                  disabled={!isOwner}
                  onChange={(e) => setForm({ ...form, eligible_ref: e.target.value })}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pontos necessários">
                <input
                  type="number"
                  className={inputCls}
                  value={form.points_required}
                  disabled={!isOwner}
                  onChange={(e) => setForm({ ...form, points_required: Number(e.target.value) })}
                />
              </Field>
              <Field label="Validade (dias)">
                <input
                  type="number"
                  className={inputCls}
                  value={form.validity_days}
                  disabled={!isOwner}
                  onChange={(e) => setForm({ ...form, validity_days: Number(e.target.value) })}
                />
              </Field>
            </div>
            <Field label="Benefício">
              <input
                className={inputCls}
                value={form.reward_description}
                disabled={!isOwner}
                onChange={(e) => setForm({ ...form, reward_description: e.target.value })}
              />
            </Field>
            <div className="flex items-center justify-between pt-1">
              <Toggle
                checked={form.is_active}
                onChange={() => isOwner && setForm({ ...form, is_active: !form.is_active })}
                label={form.is_active ? 'Ativo' : 'Inativo'}
              />
              {isOwner && (
                <button className={btn('primary')} onClick={() => updateProgram(form)}>
                  Guardar regra
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Registar consumo */}
        <div className="bg-surface border border-g200 p-5">
          <h3 className="font-display text-base text-ink mb-4">Registar consumo</h3>
          <div className="space-y-3">
            <Field label="Cliente">
              <select className={inputCls} value={cardId} onChange={(e) => setCardId(e.target.value)}>
                {data.cards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {byCustomer[c.customer_id] ? customerName(byCustomer[c.customer_id]) : c.customer_id}{' '}
                    — {c.balance}/{req}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Quantidade de selos">
              <input
                type="number"
                min={1}
                className={inputCls}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              />
            </Field>
            <button
              className={`${btn('primary')} w-full justify-center`}
              onClick={() => cardId && addStamps(cardId, qty)}
            >
              + Adicionar selos
            </button>
            <p className="text-xs text-g500">
              Saldo = soma dos selos − resgates. Ao atingir {req} selos, o resgate fica disponível.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de cartões */}
      <div className="bg-surface border border-g200">
        <div className="border-b border-g200 px-5 py-3.5">
          <h3 className="font-display text-base text-ink">Cartões ativos</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="font-display text-[11px] tracking-wider text-g500 text-left border-b border-g200">
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Posição</th>
              <th className="px-5 py-3 w-1/3">Progresso</th>
              <th className="px-5 py-3">Resgates</th>
              <th className="px-5 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {data.cards.map((c) => {
              const cust = byCustomer[c.customer_id]
              const pct = Math.min(100, Math.round((c.balance / req) * 100))
              const canRedeem = c.balance >= req
              return (
                <tr key={c.id} className="border-b border-g200 last:border-0">
                  <td className="px-5 py-3 text-ink">{cust ? customerName(cust) : c.customer_id}</td>
                  <td className="px-5 py-3 font-display text-ink">
                    {c.balance}/{req}
                  </td>
                  <td className="px-5 py-3">
                    <div className="h-2 bg-g200 w-full">
                      <div className="h-2 bg-ink" style={{ width: `${pct}%` }} />
                    </div>
                  </td>
                  <td className="px-5 py-3 text-g600">{c.rewards_redeemed}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      className={btn(canRedeem ? 'primary' : 'ghost')}
                      disabled={!canRedeem}
                      onClick={() => redeemReward(c.id)}
                    >
                      Resgatar benefício
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
