import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { leadsPatchSchema } from '@/lib/validation'
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
    .from('leads')
    .select('*, conversation:conversations(customer_name, channel)', { count: 'exact' })
    .eq('organization_id', membership.organization_id)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data || [], total: count ?? 0, page, pageSize })
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = leadsPatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { id, status, assigned_to } = parsed.data

  const { success, remaining, reset } = await limiters.api(`leads:${id}`)
  if (!success) {
    return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded. Please slow down.' }), {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)) },
    })
  }

  const updates: Record<string, unknown> = {}
  if (status) updates.status = status
  if (assigned_to) updates.assigned_to = assigned_to

  const { error } = await supabase.from('leads').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
