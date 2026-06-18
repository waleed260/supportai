import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generateAIResponse, storeMessage, storeSentiment, getAgentConfig } from '@/lib/ai/agent'
import { checkFeature } from '@/lib/feature-gate'
import { webchatSchema, sanitizeText } from '@/lib/validation'
import { limiters } from '@/lib/rate-limit'
import { checkUsageLimit } from '@/lib/billing/usage'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const parsed = webchatSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    const { organization_id, message: rawMessage, customer_name, customer_email, conversation_id } = parsed.data
    const message = sanitizeText(rawMessage)

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const rateKey = conversation_id || ip
    const { success: allowed, remaining, reset } = await limiters.chat(rateKey)
    if (!allowed) {
      return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded. Please slow down.' }), {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)) },
      })
    }

    const supabase = await createServiceRoleClient()

    const agent = await getAgentConfig(organization_id)

    const { data: widget } = await supabase.from('widget_settings')
      .select('*').eq('organization_id', organization_id).single()

    const { data: org } = await supabase.from('organizations')
      .select('is_active').eq('id', organization_id).single()
    if (!org?.is_active) {
      return NextResponse.json({ error: 'Organization is not active' }, { status: 403 })
    }

    const usage = await checkUsageLimit(organization_id)
    if (!usage.allowed) {
      await supabase.from('analytics_events').insert({
        organization_id,
        event_type: 'usage_limit_reached',
        event_data: { channel: 'web_chat', used: usage.used, limit: usage.limit, plan: usage.planName },
      })
      return NextResponse.json({
        error: 'plan_limit_reached',
        text: 'This support channel is currently unavailable. Please contact the business directly.',
        usage_limit_reached: true,
      }, { status: 403 })
    }

    const [canCaptureLead, canAnalyzeSentiment] = await Promise.all([
      checkFeature(organization_id, 'lead_capture'),
      checkFeature(organization_id, 'sentiment_analysis'),
    ])

    let conversationId: string

    if (conversation_id) {
      conversationId = conversation_id
    } else {
      const { data: existingConvo } = await supabase.from('conversations')
        .select('id')
        .eq('organization_id', organization_id)
        .eq('channel', 'web_chat')
        .eq('status', 'active')
        .is('channel_conversation_id', null)
        .limit(1).single()

      if (existingConvo) {
        conversationId = existingConvo.id
      } else {
        const { data: newConvo } = await supabase.from('conversations').insert({
          organization_id,
          channel: 'web_chat',
          customer_name: customer_name || 'Website Visitor',
          customer_email: customer_email || null,
          status: 'active',
        }).select().single()
        conversationId = newConvo!.id
      }
    }

    await storeMessage({
      conversationId,
      organizationId: organization_id,
      role: 'customer',
      content: message,
    })

    const { data: history } = await supabase.from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    const agentConfig = agent
      ? {
          ...agent,
          lead_capture_enabled: agent.lead_capture_enabled && canCaptureLead,
          sentiment_analysis_enabled: agent.sentiment_analysis_enabled && canAnalyzeSentiment,
        }
      : undefined

    const response = await generateAIResponse({
      organizationId: organization_id,
      conversationId,
      message,
      history: history || [],
      agentConfig,
    })

    await storeMessage({
      conversationId,
      organizationId: organization_id,
      role: 'assistant',
      content: response.text,
      sentiment: response.sentiment,
    })

    await storeSentiment({
      conversationId,
      organizationId: organization_id,
      sentiment: response.sentiment,
    })

    await supabase.from('analytics_events').insert({
      organization_id,
      event_type: 'message_sent',
      event_data: { conversation_id: conversationId, channel: 'web_chat' },
    })

    if (response.shouldEscalate) {
      return NextResponse.json({
        text: response.text,
        conversation_id: conversationId,
        sentiment: response.sentiment,
        escalated: true,
      })
    }

    return NextResponse.json({
      text: response.text,
      conversation_id: conversationId,
      sentiment: response.sentiment,
    })
  } catch (error) {
    console.error('Web chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
