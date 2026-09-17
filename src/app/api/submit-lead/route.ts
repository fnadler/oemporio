import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyRecaptcha } from '@/lib/security/recaptcha'
import { submitLead } from '@/lib/backend/submitLead'

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const json = await request.json()
    const supabase = createServiceClient()

    const { status, body } = await submitLead(supabase, ip, json, { verifyRecaptcha })
    return NextResponse.json(body, { status })
  } catch (error: any) {
    console.error('submit-lead API error:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
