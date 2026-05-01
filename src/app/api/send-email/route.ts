import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, primeiro_nome, idioma_preferido } = await request.json()

    const brevoApiKey = process.env.BREVO_API_KEY
    
    if (!brevoApiKey) {
      console.error('BREVO_API_KEY is missing')
      return NextResponse.json({ error: 'Missing Brevo API Key' }, { status: 500 })
    }

    const isPt = idioma_preferido === 'pt_PT'
    const subject = isPt ? 'Seu cupom de 20% de desconto no O Empório!' : 'Your 20% Off Coupon for O Empório!'
    const htmlContent = isPt 
      ? `<h1>Olá ${primeiro_nome},</h1><p>Obrigado por se inscrever! Aqui está o seu cupom de 20% de desconto em Comfort Food.</p><p>Apresente este e-mail no restaurante.</p><br><p>Equipe O Empório</p>`
      : `<h1>Hello ${primeiro_nome},</h1><p>Thank you for signing up! Here is your 20% off coupon for Comfort Food.</p><p>Please present this email at the restaurant.</p><br><p>O Empório Team</p>`

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
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
        to: [
          {
            email: email,
            name: primeiro_nome
          }
        ],
        subject: subject,
        htmlContent: htmlContent
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Brevo API error:', errorData)
      return NextResponse.json({ error: 'Failed to send email' }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Send Email Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
