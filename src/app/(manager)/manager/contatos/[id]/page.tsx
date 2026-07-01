'use client'

import { useParams, useRouter } from 'next/navigation'
import { useManager } from '@/lib/manager/store'
import { customerName, fmtDate } from '@/lib/manager/mock'
import { PageHeader, btn, LIVES_LABEL } from '@/components/manager/ui'
import { LoyaltyCartela } from '@/components/manager/LoyaltyCartela'
import { VoucherManager } from '@/components/manager/VoucherManager'

export default function ContatoDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data } = useManager()

  const customer = data.customers.find((c) => c.id === id) ?? null

  if (!customer) {
    return (
      <div>
        <PageHeader title="Contato" />
        <div className="bg-surface border border-g200 p-8 text-center">
          <p className="text-g600 text-sm">Contato não encontrado.</p>
          <button
            type="button"
            className={`${btn('ghost')} min-h-13 mt-4`}
            onClick={() => router.push('/manager/contatos')}
          >
            ← Voltar aos contatos
          </button>
        </div>
      </div>
    )
  }

  const voucherCount = data.vouchers.filter((v) => v.customer_id === customer.id).length

  const fields: [string, string][] = [
    ['E-mail', customer.email],
    ['Telefone', `${customer.phone_dialcode} ${customer.phone_number}`],
    ['Idioma', customer.language.toUpperCase()],
    ['Onde nasceu', customer.birth_country],
    ['Vive em Portugal', LIVES_LABEL[customer.lives_in_portugal]],
    ['Distrito', customer.district || '—'],
    ['Consent. marketing', customer.consent_marketing ? 'Sim' : 'Não'],
    ['Cadastro', fmtDate(customer.created_at)],
  ]

  return (
    <div>
      <PageHeader
        title={customerName(customer)}
        subtitle={customer.email}
        actions={
          <button
            type="button"
            className={`${btn('ghost')} min-h-13`}
            onClick={() => router.push('/manager/contatos')}
          >
            ← Voltar
          </button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3 items-start">
        {/* dados do contato */}
        <section className="bg-surface border border-g200 p-6 lg:col-span-2">
          <h2 className="font-display text-sm text-ink mb-5">Dados</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            {fields.map(([k, v]) => (
              <div key={k}>
                <dt className="font-display text-[11px] tracking-wider text-g500">{k}</dt>
                <dd className="text-base text-ink mt-1">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* vouchers — ao lado dos dados */}
        <section className="bg-surface border border-g200 p-6">
          <h2 className="font-display text-sm text-ink mb-5">
            Vouchers <span className="text-g400">({voucherCount})</span>
          </h2>
          <VoucherManager customerId={customer.id} />
        </section>

        {/* fidelidade — largura total */}
        <section className="bg-surface border border-g200 p-6 lg:col-span-3">
          <h2 className="font-display text-sm text-ink mb-5">Cartão Fidelidade</h2>
          <LoyaltyCartela customerId={customer.id} />
        </section>
      </div>
    </div>
  )
}
