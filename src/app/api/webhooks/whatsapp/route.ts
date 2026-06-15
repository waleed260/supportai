import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generateAIResponse, storeMessage, storeSentiment } from '@/lib/ai/agent'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'supportai_verify_2026'

  if (mode === 'subscribe' && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const entry = body.entry?.[0]
    const change = entry?.changes?.[0]
    const message = change?.value?.messages?.[0]
    const phoneNumberId = change?.value?.metadata?.phone_number_id

    if (!message || !phoneNumberId) {
      return NextResponse.json({ status: 'ok' })
    }

    const from = message.from
    const text = message.text?.body || ''
    const msgId = message.id

    const supabase = await createServiceRoleClient()

    const { data: connection } = await supabase.from('channel_connections')
      .select('organization_id')
      .eq('channel', 'whatsapp')
      .single()

    if (!connection) return NextResponse.json({ status: 'ok' })

    const orgId = connection.organization_id

    let conversationId: string
    const { data: existing } = await supabase.from('conversations')
      .select('id').eq('organization_id', orgId)
      .eq('channel', 'whatsapp').eq('channel_conversation_id', from)
      .limit(1).single()

    if (existing) {
      conversationId = existing.id
    } else {
      const { data: newConvo } = await supabase.from('conversations').insert({
        organization_id: orgId,
        channel: 'whatsapp',
        channel_conversation_id: from,
        customer_phone: from,
        customer_name: `WA-${from.slice(-4)}`,
        status: 'active',
      }).select().single()
      conversationId = newConvo!.id
    }

    await storeMessage({
      conversationId,
      organizationId: orgId,
      role: 'customer',
      content: text,
    })

    const { data: history } = await supabase.from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    const { data: agent } = await supabase.from('ai_agents')
      .select('*').eq('organization_id', orgId).single()

    const response = await generateAIResponse({
      organizationId: orgId,
      conversationId,
      message: text,
      history: history || [],
      agentConfig: agent || undefined,
    })

    await storeMessage({
      conversationId,
      organizationId: orgId,
      role: 'assistant',
      content: response.text,
      sentiment: response.sentiment,
    })

    await storeSentiment({
      conversationId,
      organizationId: orgId,
      sentiment: response.sentiment,
    })

    const whatsappToken = process.env.WHATSAPP_TOKEN
    if (whatsappToken) {
      const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`
      await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: from,
          text: { body: response.text },
        }),
      })
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('WhatsApp webhook error:', error)
    return NextResponse.json({ status: 'ok' })
  }
}
