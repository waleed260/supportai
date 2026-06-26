import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { escalationsPatchSchema } from '@/lib/validation'
import { limiters } from '@/lib/rate-limit'

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase.from('memberships')
    .select('organization_id').eq('user_id', session.user.id).limit(1).single()
  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '50')))
  const offset = (page - 1) * pageSize

  const { data, count, error } = await supabase
    .from('escalations')
    .select('*, conversation:conversations(customer_name, channel, customer_email, sentiment)', { count: 'exact' })
    .eq('organization_id', membership.organization_id)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) return NextResponse.json({ error: 'Failed to fetch escalations' }, { status: 500 })
  return NextResponse.json({ data: data || [], total: count ?? 0, page, pageSize })
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = escalationsPatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { id, status, resolved_by } = parsed.data

  const { success, remaining, reset } = await limiters.api(`escalations:${id}`)
  if (!success) {
    return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded. Please slow down.' }), {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)) },
    })
  }

  const updates: Record<string, unknown> = { resolved_at: new Date().toISOString() }
  if (status) updates.status = status
  if (resolved_by) updates.resolved_by = resolved_by

  const { error } = await supabase.from('escalations').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: 'Failed to update escalation' }, { status: 500 })

  if (status === 'resolved') {
    const { data: esc } = await supabase.from('escalations')
      .select('conversation_id').eq('id', id).single()
    if (esc) {
      await supabase.from('conversations')
        .update({ status: 'resolved', escalated_to: null }).eq('id', esc.conversation_id)
    }
  }

  return NextResponse.json({ success: true })
}
