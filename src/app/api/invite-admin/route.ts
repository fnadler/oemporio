import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { inviteAdmin } from '@/lib/backend/inviteAdmin'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const json = await request.json()
    const serviceClient = createServiceClient()
    const { status, body } = await inviteAdmin(supabase, serviceClient, user?.id ?? null, json)
    return NextResponse.json(body, { status })
  } catch (error: any) {
    console.error('invite-admin API error:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
