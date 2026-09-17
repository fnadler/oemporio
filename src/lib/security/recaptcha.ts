export async function verifyRecaptcha(token: string | undefined, ip: string): Promise<boolean> {
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
