import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const organization_id = formData.get('organization_id') as string
    const name = formData.get('name') as string
    const type = formData.get('type') as string

    if (!file || !organization_id || !name) {
      return NextResponse.json({ error: 'file, organization_id, and name are required' }, { status: 400 })
    }

    const supabase = await createServiceRoleClient()

    const ext = file.name.split('.').pop()?.toLowerCase() || 'txt'
    const filePath = `uploads/${organization_id}/${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('knowledge')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 })
    }

    const { data: source, error: dbError } = await supabase.from('knowledge_sources').insert({
      organization_id,
      name,
      type: type || ext,
      file_path: filePath,
      status: 'pending',
    }).select().single()

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
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
