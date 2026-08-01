import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { conversationIdSchema } from '@/lib/validation'
import { generateAIResponse, getAgentConfig } from '@/lib/ai/agent'
import { limiters } from '@/lib/rate-limit'
import { log } from '@/lib/logger'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const { success } = await limiters.api(`suggest:${id}`)
  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please slow down.' }, { status: 429 })
  }

  const { data: conversation } = await supabase.from('conversations')
    .select('*, messages(role, content)')
    .eq('id', id)
    .eq('organization_id', membership.organization_id)
    .single()

  if (!conversation) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const messages = conversation.messages as { role: string; content: string }[] | null
  const lastCustomerMessage = messages?.filter(m => m.role === 'customer').pop()?.content

  if (!lastCustomerMessage) {
    return NextResponse.json({ error: 'No customer message to reply to' }, { status: 400 })
  }

  const agentConfig = await getAgentConfig(membership.organization_id)

  try {
    const response = await generateAIResponse({
      organizationId: membership.organization_id,
      conversationId: id,
      message: lastCustomerMessage,
      history: (messages || []).slice(0, -1),
      agentConfig: agentConfig || undefined,
    })

    return NextResponse.json({ suggestion: response.text, sentiment: response.sentiment })
  } catch (error) {
    Sentry.captureException(error, { tags: { route: '/api/conversations/[id]/suggest' } })
    log.error('AI suggestion error', { route: '/api/conversations/[id]/suggest', error, conversationId: id })
    return NextResponse.json({ error: 'Failed to generate suggestion' }, { status: 500 })
  }
}
