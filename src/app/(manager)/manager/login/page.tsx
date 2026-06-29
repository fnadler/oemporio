import Link from 'next/link'
import { btn, inputCls, Field } from '@/components/manager/ui'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-subtle px-4">
      <div className="w-full max-w-sm bg-surface border border-g300 shadow-2xl p-8">
        <div className="text-center mb-7">
          <div className="bg-ink2 inline-flex px-5 py-4 mb-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/v2/img/logo-oemporio-branco.png" alt="O Empório" className="h-8 w-auto" />
          </div>
          <h1 className="font-display text-xl text-ink">Manager · CRM</h1>
          <p className="text-sm text-g500 mt-1">Acesso restrito à equipa</p>
        </div>

        <div className="space-y-4">
          <Field label="E-mail">
            <input type="email" defaultValue="vinicius@oemporio.pt" className={inputCls} />
          </Field>
          <Field label="Senha">
            <input type="password" defaultValue="demo" className={inputCls} />
          </Field>

          <Link href="/manager" className={`${btn('primary')} w-full justify-center`}>
            Entrar →
          </Link>

          <p className="text-[11px] text-g500 text-center pt-2">
            Protegido por MFA · Convite apenas (invite-only)
          </p>
          <p className="text-[11px] text-warn font-display text-center tracking-wider">
            Protótipo · dados fictícios
          </p>
        </div>
      </div>
    </div>
  )
}
