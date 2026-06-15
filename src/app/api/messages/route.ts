import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase.from('memberships')
    .select('organization_id').eq('user_id', session.user.id).limit(1).single()
  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 403 })

  const body = await request.json()
  const { data, error } = await supabase.from('messages').insert({
    ...body,
    organization_id: membership.organization_id,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', body.conversation_id)

  return NextResponse.json(data)
}
