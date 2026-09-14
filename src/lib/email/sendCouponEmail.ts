function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

interface CouponEmailInput {
  email: string
  primeiro_nome: string
  sobrenome: string
  telefone: string
  idioma_preferido: string
}

/**
 * Envia o e-mail do cupão ao cliente e a notificação interna ao marketing via Brevo.
 * Chamado diretamente pela rota /api/leads (nunca exposto como endpoint público —
 * evita que terceiros usem o envio de e-mail como relay/spam).
 */
export async function sendCouponEmail({
  email,
  primeiro_nome,
  sobrenome,
  telefone,
  idioma_preferido,
}: CouponEmailInput): Promise<void> {
  const brevoApiKey = process.env.BREVO_API_KEY
  if (!brevoApiKey) {
    console.error('BREVO_API_KEY is missing')
    return
  }

  const safeName = escapeHtml(primeiro_nome)
  const safeFullName = `${escapeHtml(primeiro_nome)} ${escapeHtml(sobrenome)}`
  const safePhone = escapeHtml(telefone)
  const safeEmail = escapeHtml(email)
  const safeLang = escapeHtml(idioma_preferido)

  const isPt = idioma_preferido === 'pt_PT'
  const subject = isPt
    ? 'Seu cupom de 20% de desconto no O Empório!'
    : 'Your 20% Off Coupon for O Empório!'
  const htmlContent = isPt
    ? `<h1>Olá ${safeName},</h1><p>Obrigado por se inscrever! Aqui está o seu cupom de 20% de desconto em Comfort Food.</p><p>Apresente este e-mail no restaurante.</p><br><p>Equipe O Empório</p>`
    : `<h1>Hello ${safeName},</h1><p>Thank you for signing up! Here is your 20% off coupon for Comfort Food.</p><p>Please present this email at the restaurant.</p><br><p>O Empório Team</p>`

  const customerEmailPromise = fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'api-key': brevoApiKey,
    },
    body: JSON.stringify({
      sender: { name: 'O Empório', email: 'mkt@oemporio.pt' },
      to: [{ email, name: primeiro_nome }],
      subject,
      htmlContent,
    }),
  })

  const adminEmailPromise = fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'api-key': brevoApiKey,
    },
    body: JSON.stringify({
      sender: { name: 'O Empório System', email: 'mkt@oemporio.pt' },
      to: [{ email: 'mkt@oemporio.pt', name: 'O Empório Marketing' }],
      subject: `Novo Lead: ${safeFullName}`,
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
          <h1 style="color: #373435;">Novo Lead Capturado!</h1>
          <p><strong>Nome:</strong> ${safeFullName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Telefone:</strong> ${safePhone}</p>
          <p><strong>Idioma:</strong> ${safeLang}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">Este é um e-mail automático enviado pelo sistema O Empório.</p>
        </div>
      `,
    }),
  })

  const [customerRes, adminRes] = await Promise.all([customerEmailPromise, adminEmailPromise])

  if (!customerRes.ok || !adminRes.ok) {
    console.error('Brevo API error:', {
      customer: customerRes.ok ? 'OK' : await customerRes.text(),
      admin: adminRes.ok ? 'OK' : await adminRes.text(),
    })
  }
}
