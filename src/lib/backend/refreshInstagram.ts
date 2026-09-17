import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Contrato do job `refresh-instagram`: busca os posts mais recentes via
 * Instagram Graph API (conta profissional) e grava em `instagram_cache`.
 * O site lê só o cache — nunca chama a Graph API direto do browser.
 *
 * Requer INSTAGRAM_ACCESS_TOKEN e INSTAGRAM_BUSINESS_ACCOUNT_ID nas env
 * vars — ainda não configurados neste projeto (pendência: criar o token de
 * longa duração numa conta profissional do Instagram, ver spec §5.7).
 */
export async function refreshInstagram(
  supabase: SupabaseClient
): Promise<{ ok: boolean; count?: number; error?: string }> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
  if (!token || !accountId) {
    return { ok: false, error: 'CONFIG_MISSING: INSTAGRAM_ACCESS_TOKEN/INSTAGRAM_BUSINESS_ACCOUNT_ID' }
  }

  const url = `https://graph.facebook.com/v19.0/${accountId}/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${token}&limit=12`
  const res = await fetch(url)
  const json = await res.json()
  if (!res.ok) {
    return { ok: false, error: `INSTAGRAM_API_ERROR: ${JSON.stringify(json)}` }
  }

  const payload = json.data ?? []
  const { error } = await supabase.from('instagram_cache').insert({ payload })
  if (error) return { ok: false, error: `DATABASE_ERROR: ${error.message}` }

  return { ok: true, count: payload.length }
}
