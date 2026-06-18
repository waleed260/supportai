import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'

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

    const organization_id = membership.organization_id
    const formData = await request.formData()
    const file = formData.get('file') as File
    const name = formData.get('name') as string
    const type = formData.get('type') as string

    if (!file || !name) {
      return NextResponse.json({ error: 'file and name are required' }, { status: 400 })
    }

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
      return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 })
    }

    const { data: source, error: dbError } = await svc.from('knowledge_sources').insert({
      organization_id,
      name,
      type: type || ext,
      file_path: filePath,
      status: 'pending',
    }).select().single()

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
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
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
