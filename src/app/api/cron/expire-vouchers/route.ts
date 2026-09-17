import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorizedCron } from '@/lib/security/cronAuth'
import { expireVouchers } from '@/lib/backend/expireVouchers'

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }
  try {
    const supabase = createServiceClient()
    const result = await expireVouchers(supabase)
    return NextResponse.json({ success: true, ...result })
  } catch (error: any) {
    console.error('expire-vouchers cron error:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
