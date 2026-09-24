import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { processAndUploadImage, deleteImageIfOwned, isValidFolder } from '@/lib/backend/uploadImage'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_active')
      .eq('id', user.id)
      .maybeSingle()
    if (!profile?.is_active) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
    }

    const form = await request.formData()
    const file = form.get('file')
    const folder = String(form.get('folder') ?? '')
    const previousUrl = form.get('previousUrl')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
    }
    if (!isValidFolder(folder)) {
      return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
    }

    const serviceClient = createServiceClient()
    const bytes = await file.arrayBuffer()
    const result = await processAndUploadImage(serviceClient, folder, bytes)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    if (typeof previousUrl === 'string') {
      await deleteImageIfOwned(serviceClient, previousUrl)
    }

    return NextResponse.json({ success: true, url: result.url })
  } catch (error: any) {
    console.error('upload-image API error:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
