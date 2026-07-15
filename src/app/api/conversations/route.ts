import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { conversationsPostSchema, sanitizeText, paginationSchema } from '@/lib/validation'
import { limiters } from '@/lib/rate-limit'

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase.from('memberships')
    .select('organization_id').eq('user_id', session.user.id).limit(1).single()
  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const parsed = paginationSchema.safeParse({
    page: searchParams.get('page'),
    pageSize: searchParams.get('pageSize'),
  })
  const page = parsed.data?.page ?? 1
  const pageSize = parsed.data?.pageSize ?? 50
  const offset = (page - 1) * pageSize

  const { data, count, error } = await supabase
    .from('conversations')
    .select('*, messages(*)', { count: 'exact' })
    .eq('organization_id', membership.organization_id)
    .order('updated_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  return NextResponse.json({ data: data || [], total: count ?? 0, page, pageSize })
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase.from('memberships')
    .select('organization_id').eq('user_id', session.user.id).limit(1).single()
  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 403 })

  const body = await request.json()
  const parsed = conversationsPostSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { success, remaining, reset } = await limiters.api(`conversations:${membership.organization_id}`)
  if (!success) {
    return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded. Please slow down.' }), {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)) },
    })
  }

  const { data, error } = await supabase.from('conversations').insert({
    ...parsed.data,
    organization_id: membership.organization_id,
  }).select().single()

  if (error) return NextResponse.json({ error: 'Failed to create conversation' }, { status: 400 })
  return NextResponse.json(data)
}
