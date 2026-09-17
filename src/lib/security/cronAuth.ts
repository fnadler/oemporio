/**
 * Protege endpoints de cron (chamados pela Vercel, nunca pelo browser).
 * A Vercel injeta automaticamente `Authorization: Bearer $CRON_SECRET` nas
 * chamadas de cron quando a env var `CRON_SECRET` está configurada no
 * projeto — checar isso aqui impede que qualquer um dispare o job
 * batendo direto na URL pública da rota.
 */
export function isAuthorizedCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error('CRON_SECRET não configurado — recusando chamada de cron por segurança')
    return false
  }
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${secret}`
}
