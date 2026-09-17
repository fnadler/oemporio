import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { HandlerResult } from './types'

/**
 * Contrato de `invite-admin`.
 *
 * Entrada (JSON): { email, name, role: 'owner'|'staff' }
 * Exige sessão autenticada de um `owner` ativo (verificado via o client do
 * próprio chamador, respeitando RLS). A ação de convidar em si (Auth Admin
 * API) usa `service_role`, mas só é executada depois de confirmado que
 * quem chamou é owner — nunca confiar num "sou owner" vindo do payload.
 *
 * Saída: { success: true, id } ou { error: string }, com status:
 *  - 400 INVALID_INPUT
 *  - 401 UNAUTHORIZED (sem sessão)
 *  - 403 FORBIDDEN (autenticado, mas não é owner ativo)
 *  - 409 EMAIL_ALREADY_INVITED
 *  - 500 DATABASE_ERROR | AUTH_ERROR
 */
export const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  name: z.string().trim().min(1).max(100),
  role: z.enum(['owner', 'staff']),
})

export async function inviteAdmin(
  callerClient: SupabaseClient,
  serviceClient: SupabaseClient,
  callerId: string | null,
  rawBody: unknown
): Promise<HandlerResult> {
  if (!callerId) {
    return { status: 401, body: { error: 'UNAUTHORIZED' } }
  }

  const { data: callerProfile, error: callerErr } = await callerClient
    .from('profiles')
    .select('role, is_active')
    .eq('id', callerId)
    .maybeSingle()
  if (callerErr) {
    return { status: 500, body: { error: 'DATABASE_ERROR', message: callerErr.message } }
  }
  if (!callerProfile || callerProfile.role !== 'owner' || !callerProfile.is_active) {
    return { status: 403, body: { error: 'FORBIDDEN' } }
  }

  const parsed = inviteSchema.safeParse(rawBody)
  if (!parsed.success) {
    return { status: 400, body: { error: 'INVALID_INPUT' } }
  }
  const { email, name, role } = parsed.data

  const { data: invited, error: inviteErr } = await serviceClient.auth.admin.inviteUserByEmail(email)
  if (inviteErr) {
    if (inviteErr.status === 422 || /already registered/i.test(inviteErr.message)) {
      return { status: 409, body: { error: 'EMAIL_ALREADY_INVITED' } }
    }
    return { status: 500, body: { error: 'AUTH_ERROR', message: inviteErr.message } }
  }

  const { error: profileErr } = await serviceClient.from('profiles').insert({
    id: invited.user.id,
    name,
    email,
    role,
    is_active: true,
    invited_by: callerId,
  })
  if (profileErr) {
    return { status: 500, body: { error: 'DATABASE_ERROR', message: profileErr.message } }
  }

  return { status: 200, body: { success: true, id: invited.user.id } }
}
