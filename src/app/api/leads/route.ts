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

    // 1. Validate reCAPTCHA
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY
    if (!recaptchaSecret) {
      console.error('RECAPTCHA_SECRET_KEY is not set')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const recaptchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${recaptchaSecret}&response=${recaptchaToken}`
    })
    
    const recaptchaData = await recaptchaRes.json()
    
    if (!recaptchaData.success) {
      return NextResponse.json({ error: 'Invalid reCAPTCHA' }, { status: 400 })
    }

    // 2. Initialize Supabase
    const supabase = createClient()

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
      if (dbError.code === '23505') { // unique violation
        return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 400 })
      }
      console.error('Supabase Error:', dbError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // 4. Call /api/send-email
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    try {
      const emailRes = await fetch(`${baseUrl}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, primeiro_nome, idioma_preferido })
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
