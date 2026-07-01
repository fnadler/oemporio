'use client'

import { useState } from 'react'
import { useManager } from '@/lib/manager/store'
import { type Settings } from '@/lib/manager/mock'
import { PageHeader, Field, Toggle, inputCls, btn, Restricted } from '@/components/manager/ui'

// campo sem w-full (para uso em linha, ex.: DDI + número)
const fieldInput =
  'border border-g300 bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-ink'

export default function ConfiguracoesPage() {
  const { data, role, updateSettings } = useManager()
  const [form, setForm] = useState<Settings>(data.settings)

  if (role !== 'owner') return <Restricted />

  const set = (patch: Partial<Settings>) => setForm((f) => ({ ...f, ...patch }))
  const toggleDay = (i: number) =>
    set({ hours: form.hours.map((d, idx) => (idx === i ? { ...d, open: !d.open } : d)) })
  const setDayHours = (i: number, v: string) =>
    set({ hours: form.hours.map((d, idx) => (idx === i ? { ...d, hours: v } : d)) })

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

        <Field label="Telefone">
          <div className="flex gap-2">
            <input
              className={`${fieldInput} w-24`}
              placeholder="DDI"
              value={form.phone_dialcode}
              onChange={(e) => set({ phone_dialcode: e.target.value })}
            />
            <input
              className={`${fieldInput} flex-1`}
              placeholder="Número"
              value={form.phone_number}
              onChange={(e) => set({ phone_number: e.target.value })}
            />
          </div>
        </Field>

        <Field label="Endereço">
          <input className={inputCls} value={form.address} onChange={(e) => set({ address: e.target.value })} />
        </Field>

        {/* Horários por dia da semana */}
        <div>
          <span className="font-display text-[11px] tracking-wider text-g500 block mb-1.5">
            Horários de funcionamento
          </span>
          <div className="border border-g200 divide-y divide-g200">
            {form.hours.map((d, i) => (
              <div key={d.day} className="flex items-center gap-4 px-3 py-2.5">
                <div className="w-36 shrink-0">
                  <Toggle checked={d.open} onChange={() => toggleDay(i)} label={d.day} />
                </div>
                {d.open ? (
                  <input
                    className={`${fieldInput} flex-1`}
                    placeholder="ex.: 16:00 – 00:00"
                    value={d.hours}
                    onChange={(e) => setDayHours(i, e.target.value)}
                  />
                ) : (
                  <span className="text-sm text-g400">Fechado</span>
                )}
              </div>
            ))}
          </div>
        </div>

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

        <div className="border-t border-g200 pt-5 space-y-4">
          <Field label="Versão do texto de consentimento">
            <input className={inputCls} value={form.consent_version} onChange={(e) => set({ consent_version: e.target.value })} />
          </Field>
          <Field label="Texto de consentimento">
            <textarea
              className={`${inputCls} h-32 resize-y`}
              value={form.consent_text}
              onChange={(e) => set({ consent_text: e.target.value })}
            />
          </Field>
        </div>

        <div className="flex justify-end pt-2">
          <button className={btn('primary')} onClick={() => updateSettings(form)}>
            Guardar configurações
          </button>
        </div>
      </div>
    </div>
  )
}
