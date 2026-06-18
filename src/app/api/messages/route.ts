import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { messagesPostSchema, sanitizeText } from '@/lib/validation'
import { limiters } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase.from('memberships')
    .select('organization_id').eq('user_id', session.user.id).limit(1).single()
  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 403 })

  const body = await request.json()
  const parsed = messagesPostSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { success, remaining, reset } = await limiters.api(`messages:${membership.organization_id}`)
  if (!success) {
    return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded. Please slow down.' }), {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)) },
    })
  }

  const insertData = { ...parsed.data }
  if (insertData.content) {
    insertData.content = sanitizeText(insertData.content, 8000)
  }

  const { data, error } = await supabase.from('messages').insert({
    ...insertData,
    organization_id: membership.organization_id,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', body.conversation_id)

  return NextResponse.json(data)
}
