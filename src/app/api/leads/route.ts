import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isRateLimited } from '@/lib/security/rateLimit'
import { sendCouponEmail } from '@/lib/email/sendCouponEmail'

const leadSchema = z.object({
  primeiro_nome: z.string().trim().min(1).max(100),
  sobrenome: z.string().trim().min(1).max(100),
  telefone: z.string().trim().min(1).max(40),
  email: z.string().trim().toLowerCase().email().max(200),
  idioma_preferido: z.enum(['pt_PT', 'en']),
  aceitou_cupom: z.boolean(),
  aceitou_marketing: z.boolean().optional().default(false),
  recaptchaToken: z.string().optional(),
  // Honeypot: campo oculto no formulário. Bots costumam preenchê-lo; humanos nunca o veem.
  website: z.string().optional().default(''),
})

async function verifyRecaptcha(token: string | undefined, ip: string): Promise<boolean> {
  const recaptchaApiKey = process.env.RECAPTCHA_API_KEY
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  if (!recaptchaApiKey || !recaptchaSiteKey) {
    console.error('reCAPTCHA configuration is missing')
    return false
  }
  if (!token) return false

  try {
    const res = await fetch(
      `https://recaptchaenterprise.googleapis.com/v1/projects/o-emporio/assessments?key=${recaptchaApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: {
            token,
            siteKey: recaptchaSiteKey,
            expectedAction: 'submit_lead',
          },
        }),
      }
    )
    const data = await res.json()

    if (!data.tokenProperties?.valid) {
      console.error('reCAPTCHA invalid:', data.tokenProperties?.invalidReason, 'ip:', ip)
      return false
    }
    if (typeof data.riskAnalysis?.score === 'number' && data.riskAnalysis.score < 0.5) {
      console.error('reCAPTCHA low score:', data.riskAnalysis.score, 'ip:', ip)
      return false
    }
    return true
  } catch (err) {
    console.error('reCAPTCHA verification error:', err)
    return false
  }
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

    if (isRateLimited(`leads:${ip}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json({ error: 'RATE_LIMITED' }, { status: 429 })
    }

    const json = await request.json()
    const parsed = leadSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
    }

    const {
      primeiro_nome,
      sobrenome,
      telefone,
      email,
      idioma_preferido,
      aceitou_cupom,
      aceitou_marketing,
      recaptchaToken,
      website,
    } = parsed.data

    // Honeypot preenchido → bot. Responde como sucesso, sem gravar nada (não denuncia a armadilha).
    if (website) {
      return NextResponse.json({ success: true })
    }

    const captchaOk = await verifyRecaptcha(recaptchaToken, ip)
    if (!captchaOk) {
      return NextResponse.json({ error: 'RECAPTCHA_FAILED' }, { status: 400 })
    }

    const { createServiceClient } = await import('@/lib/supabase/server')
    const supabase = createServiceClient()

    const { data: lead, error: dbError } = await supabase
      .from('leads')
      .insert([
        {
          primeiro_nome,
          sobrenome,
          email,
          telefone,
          idioma_preferido,
          aceitou_cupom,
          aceitou_marketing,
          cupom_utilizado: false,
        },
      ])
      .select()
      .single()

    if (dbError) {
      console.error('Supabase Error Details:', JSON.stringify(dbError, null, 2))
      if (dbError.code === '23505') {
        // unique violation
        return NextResponse.json({ error: 'EMAIL_ALREADY_EXISTS' }, { status: 400 })
      }
      return NextResponse.json({ error: 'DATABASE_ERROR', message: dbError.message }, { status: 500 })
    }

    try {
      await sendCouponEmail({ email, primeiro_nome, sobrenome, telefone, idioma_preferido })
    } catch (e) {
      console.error('Error sending coupon email', e)
      // não bloqueia o sucesso do cadastro se o e-mail falhar
    }

    return NextResponse.json({ success: true, lead })
  } catch (error: any) {
    console.error('Leads API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
