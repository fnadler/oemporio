import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorizedCron } from '@/lib/security/cronAuth'
import { refreshInstagram } from '@/lib/backend/refreshInstagram'

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }
  const supabase = createServiceClient()
  const result = await refreshInstagram(supabase)
  return NextResponse.json(result, { status: result.ok ? 200 : 500 })
}
