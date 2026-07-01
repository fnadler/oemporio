'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useManager } from '@/lib/manager/store'
import { useToast } from '@/lib/manager/toast'
import { fmtDate } from '@/lib/manager/mock'
import { PageHeader, Field, Badge, inputCls, btn } from '@/components/manager/ui'

export default function PerfilPage() {
  const { data, user, role } = useManager()
  const toast = useToast()
  const router = useRouter()

  const profile = data.profiles.find((p) => p.name === user) ?? null

  const [cur, setCur] = useState('')
  const [pwd, setPwd] = useState('')
  const [confirm, setConfirm] = useState('')

  const info: [string, string][] = [
    ['Nome', profile?.name ?? user],
    ['E-mail', profile?.email ?? '—'],
    ['Papel', role === 'owner' ? 'Owner' : 'Staff'],
    ['Último acesso', fmtDate(profile?.last_login_at ?? null)],
  ]

  function changePassword() {
    if (!cur.trim()) return toast('Informe a senha atual.', 'danger')
    if (pwd.length < 6) return toast('A nova senha deve ter ao menos 6 caracteres.', 'danger')
    if (pwd !== confirm) return toast('A confirmação não confere.', 'danger')
    // mock — sem backend de autenticação
    setCur('')
    setPwd('')
    setConfirm('')
    toast('Senha alterada com sucesso.')
  }

  return (
    <div>
      <PageHeader
        title="Meu perfil"
        subtitle={profile?.email}
        actions={
          <button
            type="button"
            className={`${btn('ghost')} min-h-13`}
            onClick={() => router.push('/manager/login')}
          >
            Sair
          </button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2 items-start max-w-4xl">
        {/* dados do perfil */}
        <section className="bg-surface border border-g200 p-6">
          <h2 className="font-display text-sm text-ink mb-5">Dados</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            {info.map(([k, v]) => (
              <div key={k}>
                <dt className="font-display text-[11px] tracking-wider text-g500">{k}</dt>
                <dd className="text-base text-ink mt-1">{v}</dd>
              </div>
            ))}
            <div>
              <dt className="font-display text-[11px] tracking-wider text-g500">Status</dt>
              <dd className="mt-1">
                <Badge tone={profile?.is_active === false ? 'muted' : 'ok'}>
                  {profile?.is_active === false ? 'Inativo' : 'Ativo'}
                </Badge>
              </dd>
            </div>
          </dl>
        </section>

        {/* alterar senha */}
        <section className="bg-surface border border-g200 p-6">
          <h2 className="font-display text-sm text-ink mb-5">Alterar senha</h2>
          <div className="space-y-4">
            <Field label="Senha atual">
              <input type="password" className={inputCls} value={cur} onChange={(e) => setCur(e.target.value)} />
            </Field>
            <Field label="Nova senha">
              <input type="password" className={inputCls} value={pwd} onChange={(e) => setPwd(e.target.value)} />
            </Field>
            <Field label="Confirmar nova senha">
              <input
                type="password"
                className={inputCls}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </Field>
            <div className="pt-1">
              <button type="button" className={`${btn('primary')} min-h-13`} onClick={changePassword}>
                Alterar senha
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
