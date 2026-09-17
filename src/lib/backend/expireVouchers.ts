import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Contrato do job diário `expire-vouchers`: marca como `expired` todo
 * voucher `issued` cuja `expires_at` já passou. Roda com service_role
 * (cron, sem sessão de usuário).
 */
export async function expireVouchers(supabase: SupabaseClient): Promise<{ expired: number }> {
  const { data, error } = await supabase
    .from('vouchers')
    .update({ status: 'expired' })
    .eq('status', 'issued')
    .lt('expires_at', new Date().toISOString())
    .select('id')

  if (error) throw error
  return { expired: data?.length ?? 0 }
}
