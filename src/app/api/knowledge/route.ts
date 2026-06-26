import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase.from('memberships')
    .select('organization_id').eq('user_id', session.user.id).limit(1).single()
  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 403 })

  const { data } = await supabase.from('knowledge_sources')
    .select('*').eq('organization_id', membership.organization_id)
    .order('created_at', { ascending: false })
  return NextResponse.json(data || [])
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase.from('memberships')
    .select('organization_id').eq('user_id', session.user.id).limit(1).single()
  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 403 })

  const body = await request.json()
  const { name, type, source_url } = body

  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

  const svc = await createServiceRoleClient()
  const { data, error } = await svc.from('knowledge_sources').insert({
    organization_id: membership.organization_id,
    name,
    type: type || 'website',
    source_url: source_url || null,
    status: 'pending',
  }).select().single()

  if (error) return NextResponse.json({ error: 'Failed to save knowledge source' }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase.from('memberships')
    .select('organization_id').eq('user_id', session.user.id).limit(1).single()
  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const svc = await createServiceRoleClient()
  const { error } = await svc.from('knowledge_sources')
    .delete().eq('id', id).eq('organization_id', membership.organization_id)
  if (error) return NextResponse.json({ error: 'Failed to delete knowledge source' }, { status: 500 })
  return NextResponse.json({ success: true })
}
