'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
  type FormEvent,
} from 'react'
import { DIAL_CODES, COUNTRIES, DISTRICTS, flag } from '@/lib/site/countries'

declare global {
  interface Window {
    grecaptcha: any
  }
}

/* ====================== Contexto ====================== */

interface CouponCtx {
  open: () => void
}

const Ctx = createContext<CouponCtx>({ open: () => {} })

export function useCoupon() {
  return useContext(Ctx)
}

/**
 * Provider do modal de cupão (20% OFF). Renderiza o modal uma única vez e
 * expõe `open()` via contexto para qualquer CTA da v2.
 */
export function CouponProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Ctx.Provider value={{ open: () => setIsOpen(true) }}>
      {children}
      <CouponModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </Ctx.Provider>
  )
}

/** Botão genérico que abre o modal de cupão. */
export function CouponButton({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const { open } = useCoupon()
  return (
    <button type="button" className={className} onClick={open}>
      {children}
    </button>
  )
}

/* ====================== Modal ====================== */

function CouponModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [live, setLive] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const liveIsSim = live === 'sim'

  // Trava o scroll do body e fecha com Esc enquanto aberto.
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [isOpen, onClose])

  // Ao fechar, reseta o estado para a próxima abertura.
  useEffect(() => {
    if (isOpen) return
    const t = setTimeout(() => {
      setDone(false)
      setError(null)
      setLive('')
      formRef.current?.reset()
    }, 250)
    return () => clearTimeout(t)
  }, [isOpen])

  if (!isOpen) return null

  async function recaptcha(): Promise<string | undefined> {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
    if (typeof window === 'undefined' || !window.grecaptcha || !siteKey) return undefined
    return new Promise<string | undefined>((resolve) => {
      window.grecaptcha.enterprise.ready(async () => {
        try {
          resolve(await window.grecaptcha.enterprise.execute(siteKey, { action: 'LOGIN' }))
        } catch {
          resolve(undefined)
        }
      })
    })
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }
    setSubmitting(true)
    setError(null)

    const fd = new FormData(form)
    const ddi = String(fd.get('ddi') || '')
    const phone = String(fd.get('phone') || '')
    const lang = String(fd.get('lang') || 'pt')

    const payload = {
      primeiro_nome: String(fd.get('fname') || ''),
      sobrenome: String(fd.get('lname') || ''),
      telefone: `${ddi} ${phone}`.trim(),
      email: String(fd.get('email') || ''),
      idioma_preferido: lang === 'pt' ? 'pt_PT' : 'en',
      aceitou_cupom: fd.get('coupon') === 'on',
      aceitou_marketing: fd.get('mkt') === 'on',
      // Campos extra (ainda não persistidos pelo back-end atual — ver item 3):
      pais_nascimento: String(fd.get('born') || ''),
      vive_portugal: live,
      distrito: liveIsSim ? String(fd.get('dist') || '') : '',
      recaptchaToken: await recaptcha(),
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (result.error === 'EMAIL_ALREADY_EXISTS') {
          throw new Error('Este e-mail já está registado.')
        }
        throw new Error(result.error || 'Algo correu mal. Tente novamente.')
      }
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo correu mal.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal open" aria-hidden={false}>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="m20t">
        <button className="modal-x" type="button" onClick={onClose} aria-label="Fechar">
          &times;
        </button>

        {done ? (
          <div className="modal-head" style={{ paddingRight: 0 }}>
            <span className="rotulo">Cupão a caminho</span>
            <h2 id="m20t">
              Bem-vindo ao <em>Clube</em>
            </h2>
            <p>
              O seu cupão de 20% foi gerado. Verifique o seu e-mail (e a pasta de spam)
              para o resgatar na sua próxima visita ao O Empório.
            </p>
            <button
              className="btn submit"
              type="button"
              style={{ marginTop: 18 }}
              onClick={onClose}
            >
              Fechar
            </button>
          </div>
        ) : (
          <>
            <div className="modal-head">
              <span className="rotulo">Cupão de boas-vindas</span>
              <h2 id="m20t">
                Ganhe 20% <em>OFF</em>
              </h2>
              <p>Preencha os dados e receba o seu cupão para a primeira visita ao O Empório.</p>
            </div>

            <form className="f20" ref={formRef} noValidate onSubmit={handleSubmit}>
              {error && (
                <div
                  className="full"
                  style={{
                    background: 'rgba(180,40,40,.08)',
                    border: '1.5px solid rgba(180,40,40,.4)',
                    color: '#9a2b2b',
                    padding: '10px 13px',
                    fontSize: 13,
                  }}
                >
                  {error}
                </div>
              )}

              <div>
                <label>Primeiro nome *</label>
                <input type="text" name="fname" required />
              </div>
              <div>
                <label>Sobrenome *</label>
                <input type="text" name="lname" required />
              </div>

              <div className="full">
                <label>Telefone *</label>
                <div className="phone">
                  <select name="ddi" aria-label="DDI" defaultValue="+351">
                    {DIAL_CODES.map((c) => (
                      <option key={`${c.iso}-${c.ddi}`} value={c.ddi}>
                        {(c.iso ? `${flag(c.iso)}  ` : '') + c.ddi + '  ·  ' + c.name}
                      </option>
                    ))}
                  </select>
                  <input type="tel" name="phone" placeholder="912 345 678" required />
                </div>
              </div>

              <div className="full">
                <label>E-mail *</label>
                <input type="email" name="email" placeholder="voce@email.com" required />
              </div>

              <div>
                <label>Idioma *</label>
                <select name="lang" required defaultValue="pt">
                  <option value="pt">Português</option>
                  <option value="en">Inglês</option>
                </select>
              </div>

              <div>
                <label>Onde nasceu *</label>
                <select name="born" required defaultValue="">
                  <option value="">Selecione…</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="full">
                <label>Vive em Portugal? *</label>
                <select
                  name="live"
                  required
                  value={live}
                  onChange={(e) => setLive(e.target.value)}
                >
                  <option value="">Selecione…</option>
                  <option value="sim">Sim</option>
                  <option value="freq">Não, mas venho frequentemente</option>
                  <option value="nao">Não</option>
                  <option value="na">Prefiro não informar</option>
                </select>
              </div>

              {liveIsSim && (
                <div className="full">
                  <label>Distrito *</label>
                  <select name="dist" required defaultValue="">
                    <option value="">Selecione…</option>
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <label className="check">
                <input type="checkbox" name="coupon" required /> Quero receber o cupão de 20% de
                desconto *
              </label>
              <label className="check">
                <input type="checkbox" name="mkt" /> Concordo em receber notícias, ofertas e
                comunicações de marketing do O Empório.
              </label>

              <button className="btn submit" type="submit" disabled={submitting}>
                {submitting ? 'A enviar…' : 'Quero o meu cupão →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
