'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { btn, inputCls, Field } from '@/components/manager/ui'
import { Loader2 } from 'lucide-react'

/**
 * Login real do Manager. Cobre dois fluxos:
 *  - login normal (e-mail + senha)
 *  - link de convite/recuperação (#access_token=...&type=invite|recovery):
 *    o client do Supabase já troca isso por uma sessão sozinho
 *    (detectSessionInUrl); aqui só detectamos o `type` no hash pra mostrar
 *    "defina sua senha" em vez do formulário de login.
 */
export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()

  const [mode, setMode] = useState<'login' | 'set-password' | 'checking'>('checking')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : ''
    const isInviteOrRecovery = /type=(invite|recovery)/.test(hash) || /access_token=/.test(hash)
    setMode(isInviteOrRecovery ? 'set-password' : 'login')
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (signInError) {
      setError('E-mail ou senha inválidos.')
      return
    }
    router.push('/manager')
    router.refresh()
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError('A senha deve ter ao menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }
    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (updateError) {
      setError(updateError.message)
      return
    }
    router.push('/manager')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-subtle px-4">
      <div className="w-full max-w-sm bg-surface border border-g300 shadow-2xl p-8">
        <div className="text-center mb-7">
          <div className="bg-ink2 inline-flex px-5 py-4 mb-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/v2/img/logo-oemporio-branco.png" alt="O Empório" className="h-8 w-auto" />
          </div>
          <h1 className="font-display text-xl text-ink">Manager · CRM</h1>
          <p className="text-sm text-g500 mt-1">
            {mode === 'set-password' ? 'Defina sua senha de acesso' : 'Acesso restrito à equipa'}
          </p>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger text-danger p-3 mb-4 text-sm">{error}</div>
        )}

        {mode === 'checking' && <p className="text-sm text-g500 text-center">Carregando…</p>}

        {mode === 'login' && (
          <form className="space-y-4" onSubmit={handleLogin}>
            <Field label="E-mail">
              <input
                type="email"
                className={inputCls}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Field label="Senha">
              <input
                type="password"
                className={inputCls}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
            <button type="submit" disabled={loading} className={`${btn('primary')} w-full justify-center`}>
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Entrar →'}
            </button>
            <p className="text-[11px] text-g500 text-center pt-2">Protegido por MFA · Convite apenas</p>
          </form>
        )}

        {mode === 'set-password' && (
          <form className="space-y-4" onSubmit={handleSetPassword}>
            <Field label="Nova senha">
              <input
                type="password"
                className={inputCls}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
            <Field label="Confirmar senha">
              <input
                type="password"
                className={inputCls}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </Field>
            <button type="submit" disabled={loading} className={`${btn('primary')} w-full justify-center`}>
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Definir senha e entrar →'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
