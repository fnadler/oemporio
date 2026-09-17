import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { HandlerResult } from './types'

/**
 * Contrato de `redeem-voucher` (ações do balcão sobre um voucher).
 *
 * Entrada (JSON): { action: 'redeem'|'cancel'|'reactivate', code: string }
 * Exige sessão autenticada (staff/owner) — usa o client autenticado do
 * chamador (nunca service_role), para que RLS e o trigger
 * `stamp_voucher_redemption` carimbem `redeemed_by`/`redeemed_at` a partir
 * de `auth.uid()` de verdade. `redeemed_by` NUNCA é aceito no payload.
 *
 * Saída: { success: true } ou { error: string }, com status:
 *  - 400 INVALID_INPUT | INVALID_TRANSITION
 *  - 401 UNAUTHORIZED (sem sessão)
 *  - 404 VOUCHER_NOT_FOUND
 *  - 403 FORBIDDEN (RLS recusou — sessão sem perfil staff/owner ativo)
 *  - 500 DATABASE_ERROR
 */
export const voucherActionSchema = z.object({
  action: z.enum(['redeem', 'cancel', 'reactivate']),
  code: z.string().trim().min(1).max(40),
})

export async function redeemVoucherAction(
  supabase: SupabaseClient,
  userId: string | null,
  rawBody: unknown
): Promise<HandlerResult> {
  if (!userId) {
    return { status: 401, body: { error: 'UNAUTHORIZED' } }
  }

  const parsed = voucherActionSchema.safeParse(rawBody)
  if (!parsed.success) {
    return { status: 400, body: { error: 'INVALID_INPUT' } }
  }
  const { action, code } = parsed.data

  const { data: voucher, error: findErr } = await supabase
    .from('vouchers')
    .select('id, status')
    .eq('code', code)
    .maybeSingle()

  if (findErr) {
    return { status: 500, body: { error: 'DATABASE_ERROR', message: findErr.message } }
  }
  if (!voucher) {
    return { status: 404, body: { error: 'VOUCHER_NOT_FOUND' } }
  }

  let patch: Record<string, unknown>
  if (action === 'redeem') {
    if (voucher.status !== 'issued') {
      return { status: 400, body: { error: 'INVALID_TRANSITION', from: voucher.status } }
    }
    // redeemed_at/redeemed_by são carimbados pelo trigger a partir de auth.uid().
    patch = { status: 'redeemed' }
  } else if (action === 'cancel') {
    if (voucher.status !== 'issued') {
      return { status: 400, body: { error: 'INVALID_TRANSITION', from: voucher.status } }
    }
    patch = { status: 'cancelled' }
  } else {
    // reactivate
    if (voucher.status !== 'expired' && voucher.status !== 'cancelled') {
      return { status: 400, body: { error: 'INVALID_TRANSITION', from: voucher.status } }
    }
    const { data: settingsRows, error: settingsErr } = await supabase
      .from('site_settings')
      .select('welcome_voucher_validity_days')
      .limit(1)
    if (settingsErr) {
      return { status: 500, body: { error: 'DATABASE_ERROR', message: settingsErr.message } }
    }
    const validityDays = settingsRows?.[0]?.welcome_voucher_validity_days ?? 30
    patch = {
      status: 'issued',
      redeemed_at: null,
      expires_at: new Date(Date.now() + validityDays * 86400000).toISOString(),
    }
  }

  const { error: updateErr } = await supabase.from('vouchers').update(patch).eq('id', voucher.id)
  if (updateErr) {
    // RLS bloqueando (usuário sem perfil staff/owner ativo) chega aqui como erro de permissão.
    return { status: 403, body: { error: 'FORBIDDEN', message: updateErr.message } }
  }

  return { status: 200, body: { success: true } }
}
