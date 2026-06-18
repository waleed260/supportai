import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase.from('memberships')
    .select('*').eq('user_id', session.user.id).limit(1).single()
  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 403 })

  const { data } = await supabase.from('memberships')
    .select('*, user:users(*)')
    .eq('organization_id', membership.organization_id)
  return NextResponse.json(data || [])
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase.from('memberships')
    .select('organization_id, role').eq('user_id', session.user.id).limit(1).single()
  if (!membership || membership.role === 'team_member') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { user_id, email, role } = await request.json()
  let targetUserId = user_id

  if (!targetUserId) {
    if (!email) return NextResponse.json({ error: 'user_id or email is required' }, { status: 400 })
    const { data: userData } = await supabase.from('users')
      .select('id').eq('email', email).single()
    if (!userData) return NextResponse.json({ error: 'User not found. They need to register first.' }, { status: 404 })
    targetUserId = userData.id
  }

  const { data, error } = await supabase.from('memberships').insert({
    user_id: targetUserId,
    organization_id: membership.organization_id,
    role: role || 'team_member',
  }).select('*, user:users(*)').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const { data: membership } = await supabase.from('memberships')
    .select('organization_id, role').eq('user_id', session.user.id).limit(1).single()
  if (!membership || membership.role === 'team_member') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase.from('memberships')
    .delete().eq('id', id).eq('organization_id', membership.organization_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
