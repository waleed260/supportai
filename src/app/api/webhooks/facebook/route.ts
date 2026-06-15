import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generateAIResponse, storeMessage, storeSentiment } from '@/lib/ai/agent'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.FACEBOOK_VERIFY_TOKEN || 'supportai_verify_2026'

  if (mode === 'subscribe' && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const entry = body.entry?.[0]
    const messaging = entry?.messaging?.[0]

    if (!messaging) return NextResponse.json({ status: 'ok' })

    const senderId = messaging.sender?.id
    const text = messaging.message?.text || ''
    const pageId = messaging.recipient?.id

    if (!senderId || !text) return NextResponse.json({ status: 'ok' })

    const supabase = await createServiceRoleClient()

    const { data: connection } = await supabase.from('channel_connections')
      .select('organization_id')
      .eq('channel', 'facebook')
      .single()

    if (!connection) return NextResponse.json({ status: 'ok' })

    const orgId = connection.organization_id

    let conversationId: string
    const { data: existing } = await supabase.from('conversations')
      .select('id').eq('organization_id', orgId)
      .eq('channel', 'facebook').eq('channel_conversation_id', senderId)
      .limit(1).single()

    if (existing) {
      conversationId = existing.id
    } else {
      const shortId = senderId.slice(-4)
      const { data: newConvo } = await supabase.from('conversations').insert({
        organization_id: orgId,
        channel: 'facebook',
        channel_conversation_id: senderId,
        customer_name: 'FB-' + shortId,
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

    const fbToken = process.env.FACEBOOK_PAGE_TOKEN
    if (fbToken && pageId) {
      const url = 'https://graph.facebook.com/v21.0/' + pageId + '/messages'
      await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + fbToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: { id: senderId },
          message: { text: response.text },
        }),
      })
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Facebook webhook error:', error)
    return NextResponse.json({ status: 'ok' })
  }
}
