'use client'

import { useState } from 'react'
import { useManager } from '@/lib/manager/store'
import { type Settings } from '@/lib/manager/mock'
import { PageHeader, Field, inputCls, btn, Restricted } from '@/components/manager/ui'

export default function ConfiguracoesPage() {
  const { data, role, updateSettings } = useManager()
  const [form, setForm] = useState<Settings>(data.settings)

  if (role !== 'owner') return <Restricted />

  const set = (patch: Partial<Settings>) => setForm((f) => ({ ...f, ...patch }))

  return (
    <div>
      <PageHeader title="Configurações do site" subtitle="Apenas Owner" />

      <div className="bg-surface border border-g200 p-6 max-w-3xl space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="URL da carta de cervejas online">
            <input className={inputCls} value={form.external_beer_menu_url} onChange={(e) => set({ external_beer_menu_url: e.target.value })} />
          </Field>
          <Field label="@ do Instagram">
            <input className={inputCls} value={form.instagram_handle} onChange={(e) => set({ instagram_handle: e.target.value })} />
          </Field>
        </div>

        <Field label="Endereço">
          <input className={inputCls} value={form.address} onChange={(e) => set({ address: e.target.value })} />
        </Field>
        <Field label="Horários">
          <input className={inputCls} value={form.hours} onChange={(e) => set({ hours: e.target.value })} />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Mapa — latitude">
            <input className={inputCls} value={form.map_lat} onChange={(e) => set({ map_lat: e.target.value })} />
          </Field>
          <Field label="Mapa — longitude">
            <input className={inputCls} value={form.map_lng} onChange={(e) => set({ map_lng: e.target.value })} />
          </Field>
        </div>

        <div className="border-t border-g200 pt-5">
          <h3 className="font-display text-sm text-ink mb-3">Voucher de boas-vindas</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Desconto (%)">
              <input type="number" className={inputCls} value={form.welcome_voucher_pct} onChange={(e) => set({ welcome_voucher_pct: Number(e.target.value) })} />
            </Field>
            <Field label="Validade (dias)">
              <input type="number" className={inputCls} value={form.welcome_voucher_validity_days} onChange={(e) => set({ welcome_voucher_validity_days: Number(e.target.value) })} />
            </Field>
          </div>
        </div>

        <Field label="Versão do texto de consentimento">
          <input className={inputCls} value={form.consent_version} onChange={(e) => set({ consent_version: e.target.value })} />
        </Field>

        <div className="flex justify-end pt-2">
          <button className={btn('primary')} onClick={() => updateSettings(form)}>
            Guardar configurações
          </button>
        </div>
      </div>
    </div>
  )
}
