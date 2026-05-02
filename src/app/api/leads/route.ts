import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      primeiro_nome,
      sobrenome,
      telefone,
      email,
      idioma_preferido,
      aceitou_cupom,
      aceitou_marketing,
      recaptchaToken
    } = body

    /* 
    // 1. Validate reCAPTCHA Enterprise
    const recaptchaApiKey = process.env.RECAPTCHA_API_KEY
    const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
    
    if (!recaptchaApiKey || !recaptchaSiteKey) {
      console.error('reCAPTCHA configuration is missing')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const recaptchaRes = await fetch(
      `https://recaptchaenterprise.googleapis.com/v1/projects/o-emporio/assessments?key=${recaptchaApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: {
            token: recaptchaToken,
            siteKey: recaptchaSiteKey,
            expectedAction: 'LOGIN'
          }
        })
      }
    )
    
    const recaptchaData = await recaptchaRes.json()
    console.log('reCAPTCHA Full Response:', JSON.stringify(recaptchaData, null, 2))
    
    // Check if the assessment is valid
    if (!recaptchaData.tokenProperties?.valid) {
      console.error('reCAPTCHA Invalid:', recaptchaData.tokenProperties?.invalidReason)
      return NextResponse.json({ 
        error: `reCAPTCHA Invalid: ${recaptchaData.tokenProperties?.invalidReason || 'Unknown reason'}`,
        details: recaptchaData
      }, { status: 400 })
    }

    // Optional: Check score for risk analysis (typical threshold is 0.5)
    if (recaptchaData.riskAnalysis && recaptchaData.riskAnalysis.score < 0.3) {
      return NextResponse.json({ error: 'High risk detected' }, { status: 403 })
    }
    */

    // 2. Initialize Supabase (Use service client to bypass RLS and ensure success)
    const { createServiceClient } = await import('@/lib/supabase/server')
    const supabase = createServiceClient()

    // 3. Insert into Supabase
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
        }
      ])
      .select()
      .single()

    if (dbError) {
      console.error('Supabase Error Details:', JSON.stringify(dbError, null, 2))
      if (dbError.code === '23505') { // unique violation
        return NextResponse.json({ error: 'EMAIL_ALREADY_EXISTS' }, { status: 400 })
      }
      return NextResponse.json({ error: 'DATABASE_ERROR', message: dbError.message }, { status: 500 })
    }

    // 4. Call /api/send-email
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    try {
      const emailRes = await fetch(`${baseUrl}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          primeiro_nome, 
          sobrenome,
          telefone,
          idioma_preferido 
        })
      })

      if (!emailRes.ok) {
        console.error('Failed to send email:', await emailRes.text())
        // we don't block success to the user if email fails, but you could
      }
    } catch (e) {
      console.error('Error calling /api/send-email', e)
    }

    return NextResponse.json({ success: true, lead })
  } catch (error: any) {
    console.error('Leads API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
