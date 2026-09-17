import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redeemVoucherAction } from '@/lib/backend/redeemVoucher'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const json = await request.json()
    const { status, body } = await redeemVoucherAction(supabase, user?.id ?? null, json)
    return NextResponse.json(body, { status })
  } catch (error: any) {
    console.error('redeem-voucher API error:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
