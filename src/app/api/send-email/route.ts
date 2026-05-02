import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, primeiro_nome, sobrenome, telefone, idioma_preferido } = await request.json()
    const brevoApiKey = process.env.BREVO_API_KEY
    
    if (!brevoApiKey) {
      console.error('BREVO_API_KEY is missing')
      return NextResponse.json({ error: 'Missing Brevo API Key' }, { status: 500 })
    }

    // 1. Send coupon email to the lead
    const isPt = idioma_preferido === 'pt_PT'
    const subject = isPt ? 'Seu cupom de 20% de desconto no O Empório!' : 'Your 20% Off Coupon for O Empório!'
    const htmlContent = isPt 
      ? `<h1>Olá ${primeiro_nome},</h1><p>Obrigado por se inscrever! Aqui está o seu cupom de 20% de desconto em Comfort Food.</p><p>Apresente este e-mail no restaurante.</p><br><p>Equipe O Empório</p>`
      : `<h1>Hello ${primeiro_nome},</h1><p>Thank you for signing up! Here is your 20% off coupon for Comfort Food.</p><p>Please present this email at the restaurant.</p><br><p>O Empório Team</p>`

    const customerEmailPromise = fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': brevoApiKey
      },
      body: JSON.stringify({
        sender: {
          name: "O Empório",
          email: "mkt@oemporio.pt"
        },
        to: [{ email, name: primeiro_nome }],
        subject: subject,
        htmlContent: htmlContent
      })
    })

    // 2. Send notification email to admin (mkt@oemporio.pt)
    const adminEmailPromise = fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': brevoApiKey
      },
      body: JSON.stringify({
        sender: {
          name: "O Empório System",
          email: "mkt@oemporio.pt"
        },
        to: [{ email: "mkt@oemporio.pt", name: "O Empório Marketing" }],
        subject: `Novo Lead: ${primeiro_nome} ${sobrenome}`,
        htmlContent: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
            <h1 style="color: #373435;">Novo Lead Capturado!</h1>
            <p><strong>Nome:</strong> ${primeiro_nome} ${sobrenome}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Telefone:</strong> ${telefone}</p>
            <p><strong>Idioma:</strong> ${idioma_preferido}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">Este é um e-mail automático enviado pelo sistema O Empório.</p>
          </div>
        `
      })
    })

    // Wait for both emails to finish
    const [customerRes, adminRes] = await Promise.all([customerEmailPromise, adminEmailPromise])

    if (!customerRes.ok || !adminRes.ok) {
      console.error('Brevo API error:', {
        customer: customerRes.ok ? 'OK' : await customerRes.text(),
        admin: adminRes.ok ? 'OK' : await adminRes.text()
      })
      // Even if one fails, we might still want to return success if the other worked
      // but for now let's be strict or at least log it.
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Send Email Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
