import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import { isRateLimited } from '@/lib/security/rateLimit'
import { sendCouponEmail } from '@/lib/email/sendCouponEmail'
import type { HandlerResult } from './types'

/**
 * Contrato de `submit-lead` (cadastro do cupão de boas-vindas).
 *
 * Entrada (JSON):
 *  - primeiro_nome, sobrenome, telefone, email, idioma_preferido ('pt_PT'|'en')
 *  - aceitou_cupom (true obrigatório), aceitou_marketing (opcional)
 *  - pais_nascimento, vive_portugal ('sim'|'freq'|'nao'|'na'), distrito (opcional)
 *  - recaptchaToken, website (honeypot — deve ficar vazio)
 *
 * Saída: { success: true } ou { error: string }, com status HTTP:
 *  - 200 success
 *  - 400 INVALID_INPUT | RECAPTCHA_FAILED | EMAIL_ALREADY_EXISTS
 *  - 429 RATE_LIMITED
 *  - 500 DATABASE_ERROR | INTERNAL_ERROR
 */
export const leadSchema = z.object({
  primeiro_nome: z.string().trim().min(1).max(100),
  sobrenome: z.string().trim().min(1).max(100),
  telefone: z.string().trim().min(1).max(40),
  email: z.string().trim().toLowerCase().email().max(200),
  idioma_preferido: z.enum(['pt_PT', 'en']),
  aceitou_cupom: z.boolean().refine((v) => v === true, 'aceitou_cupom deve ser true'),
  aceitou_marketing: z.boolean().optional().default(false),
  pais_nascimento: z.string().trim().max(100).optional().default(''),
  vive_portugal: z.enum(['sim', 'freq', 'nao', 'na']).optional().default('na'),
  distrito: z.string().trim().max(100).optional().default(''),
  recaptchaToken: z.string().optional(),
  website: z.string().optional().default(''), // honeypot
})

export type LeadInput = z.infer<typeof leadSchema>

export interface SubmitLeadDeps {
  verifyRecaptcha: (token: string | undefined, ip: string) => Promise<boolean>
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sem 0/O/1/I

function genVoucherCode(): string {
  let s = ''
  for (let i = 0; i < 4; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  return `EMP-${s}`
}

function splitPhone(telefone: string): { dialcode: string; number: string } {
  const s = telefone.trim()
  const i = s.indexOf(' ')
  if (i === -1) return { dialcode: '', number: s }
  return { dialcode: s.slice(0, i), number: s.slice(i + 1) }
}

/**
 * Lógica pura de `submit-lead`, sem depender do objeto `Request` do Next —
 * recebe o client Supabase (service_role) e os dados já brutos, e retorna
 * status+corpo HTTP. Isso permite testar contra qualquer projeto (staging,
 * produção) sem subir o servidor Next.
 */
export async function submitLead(
  supabase: SupabaseClient,
  ip: string,
  rawBody: unknown,
  deps: SubmitLeadDeps
): Promise<HandlerResult> {
  if (isRateLimited(`submit-lead:${ip}`, 5, 10 * 60 * 1000)) {
    return { status: 429, body: { error: 'RATE_LIMITED' } }
  }

  const parsed = leadSchema.safeParse(rawBody)
  if (!parsed.success) {
    return { status: 400, body: { error: 'INVALID_INPUT' } }
  }
  const input = parsed.data

  // Honeypot preenchido → bot. Sucesso falso, sem gravar nada.
  if (input.website) {
    return { status: 200, body: { success: true } }
  }

  const captchaOk = await deps.verifyRecaptcha(input.recaptchaToken, ip)
  if (!captchaOk) {
    return { status: 400, body: { error: 'RECAPTCHA_FAILED' } }
  }

  const { data: settingsRows, error: settingsErr } = await supabase
    .from('site_settings')
    .select('welcome_voucher_pct, welcome_voucher_validity_days, consent_version')
    .limit(1)
  if (settingsErr) {
    return { status: 500, body: { error: 'DATABASE_ERROR', message: settingsErr.message } }
  }
  const settings = settingsRows?.[0] ?? {
    welcome_voucher_pct: 20,
    welcome_voucher_validity_days: 30,
    consent_version: null,
  }

  const { dialcode, number } = splitPhone(input.telefone)

  const { data: customer, error: custErr } = await supabase
    .from('customers')
    .insert({
      first_name: input.primeiro_nome,
      last_name: input.sobrenome,
      phone_dialcode: dialcode,
      phone_number: number,
      email: input.email,
      language: input.idioma_preferido === 'en' ? 'en' : 'pt',
      birth_country: input.pais_nascimento,
      lives_in_portugal: input.vive_portugal,
      district: input.vive_portugal === 'sim' ? input.distrito : '',
      consent_coupon: input.aceitou_cupom,
      consent_marketing: input.aceitou_marketing,
      consent_version: settings.consent_version,
      consent_at: new Date().toISOString(),
      source: 'site_form',
    })
    .select('id')
    .single()

  if (custErr) {
    if (custErr.code === '23505') {
      return { status: 400, body: { error: 'EMAIL_ALREADY_EXISTS' } }
    }
    return { status: 500, body: { error: 'DATABASE_ERROR', message: custErr.message } }
  }

  const issuedAt = new Date()
  const expiresAt = new Date(issuedAt.getTime() + settings.welcome_voucher_validity_days * 86400000)

  const { error: voucherErr } = await supabase.from('vouchers').insert({
    customer_id: customer.id,
    code: genVoucherCode(),
    type: 'welcome_20',
    discount_pct: settings.welcome_voucher_pct,
    status: 'issued',
    issued_at: issuedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
  })
  if (voucherErr) {
    return { status: 500, body: { error: 'DATABASE_ERROR', message: voucherErr.message } }
  }

  try {
    await sendCouponEmail({
      email: input.email,
      primeiro_nome: input.primeiro_nome,
      sobrenome: input.sobrenome,
      telefone: input.telefone,
      idioma_preferido: input.idioma_preferido,
    })
  } catch (e) {
    console.error('submit-lead: falha ao enviar e-mail do cupão', e)
    // não bloqueia o sucesso do cadastro se o e-mail falhar
  }

  return { status: 200, body: { success: true } }
}
