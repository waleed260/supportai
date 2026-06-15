import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generateAIResponse, storeMessage, storeSentiment } from '@/lib/ai/agent'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { organization_id, message, customer_name, customer_email } = body

    if (!organization_id || !message) {
      return NextResponse.json({ error: 'organization_id and message are required' }, { status: 400 })
    }

    const supabase = await createServiceRoleClient()

    const { data: agent } = await supabase.from('ai_agents')
      .select('*').eq('organization_id', organization_id).single()

    const { data: widget } = await supabase.from('widget_settings')
      .select('*').eq('organization_id', organization_id).single()

    let conversationId: string

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

    const response = await generateAIResponse({
      organizationId: organization_id,
      conversationId,
      message,
      history: history || [],
      agentConfig: agent || undefined,
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
