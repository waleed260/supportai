import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { knowledgeUploadSchema, sanitizeText } from '@/lib/validation'
import { limiters } from '@/lib/rate-limit'
import { log } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: membership } = await supabase.from('memberships')
      .select('organization_id')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .limit(1)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'No organization membership found' }, { status: 403 })
    }

    const { success, remaining, reset } = await limiters.knowledgeUpload(membership.organization_id)
    if (!success) {
      return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded. Please slow down.' }), {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)) },
      })
    }

    const organization_id = membership.organization_id
    const formData = await request.formData()
    const file = formData.get('file') as File
    const name = formData.get('name') as string
    const type = formData.get('type') as string

    const parsed = knowledgeUploadSchema.safeParse({ name, type })
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    if (!file) {
      return NextResponse.json({ error: [{ path: ['file'], message: 'file is required' }] }, { status: 400 })
    }

    const safeName = sanitizeText(parsed.data.name, 255)

    const svc = await createServiceRoleClient()

    const ext = file.name.split('.').pop()?.toLowerCase() || 'txt'
    const filePath = `uploads/${organization_id}/${Date.now()}-${file.name}`

    const { error: uploadError } = await svc.storage
      .from('knowledge')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    const { data: source, error: dbError } = await svc.from('knowledge_sources').insert({
      organization_id,
      name: safeName,
      type: parsed.data.type || ext,
      file_path: filePath,
      status: 'pending',
    }).select().single()

    if (dbError) {
      return NextResponse.json({ error: 'Failed to save knowledge source' }, { status: 500 })
    }

    const { data: { publicUrl } } = svc.storage
      .from('knowledge')
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      knowledge_source_id: source.id,
      file_url: publicUrl,
    })
  } catch (error) {
    Sentry.captureException(error, {
      tags: { route: '/api/knowledge/upload' },
    })
    log.error('Upload error', { route: '/api/knowledge/upload', error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
