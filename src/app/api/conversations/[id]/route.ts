import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { conversationsPatchSchema, sanitizeText, conversationIdSchema } from '@/lib/validation'
import { limiters } from '@/lib/rate-limit'
import { log } from '@/lib/logger'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const parsed = conversationIdSchema.safeParse({ id })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid conversation ID' }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase.from('memberships')
    .select('organization_id').eq('user_id', session.user.id).limit(1).single()
  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 403 })

  const { data, error } = await supabase.from('conversations')
    .select('*, messages(*)').eq('id', id).eq('organization_id', membership.organization_id).single()

  if (error) {
    Sentry.captureException(error, { tags: { route: '/api/conversations/[id]' } })
    log.error('conversation fetch error', { route: '/api/conversations/[id]', error, conversationId: id })
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = conversationsPatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { success, remaining, reset } = await limiters.api(`conversation:${id}`)
  if (!success) {
    return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded. Please slow down.' }), {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)) },
    })
  }

  const { data, error } = await supabase.from('conversations').update(parsed.data).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: 'Failed to update conversation' }, { status: 400 })
  return NextResponse.json(data)
}
