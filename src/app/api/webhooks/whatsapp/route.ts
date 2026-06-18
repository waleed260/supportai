import { NextResponse } from 'next/server'
import crypto from 'crypto'
import * as Sentry from '@sentry/nextjs'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generateAIResponse, storeMessage, storeSentiment, getAgentConfig } from '@/lib/ai/agent'
import { limiters } from '@/lib/rate-limit'
import { checkUsageLimit } from '@/lib/billing/usage'
import { cachedQuery } from '@/lib/cache'
import { log, getRouteName } from '@/lib/logger'

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
    const rawBody = await request.text()

    const signature = request.headers.get('x-hub-signature-256') || ''
    const appSecret = process.env.META_APP_SECRET
    if (!appSecret) {
      log.error('META_APP_SECRET not configured', { route: '/api/webhooks/whatsapp' })
      Sentry.captureException(new Error('META_APP_SECRET not configured'), {
        tags: { route: '/api/webhooks/whatsapp' },
      })
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const expected = 'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex')
    if (!signature || signature !== expected) {
      log.error('invalid or missing signature', { route: '/api/webhooks/whatsapp' })
      Sentry.captureException(new Error('Invalid webhook signature'), {
        tags: { route: '/api/webhooks/whatsapp' },
        extra: { channel: 'whatsapp', hasSignature: !!signature, matches: signature === expected },
      })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)

    const entry = body.entry?.[0]
    const change = entry?.changes?.[0]
    const message = change?.value?.messages?.[0]
    const phoneNumberId = change?.value?.metadata?.phone_number_id

    if (!message || !phoneNumberId) {
      return NextResponse.json({ status: 'ok' })
    }

    const from = message.from
    const text = message.text?.body || ''

    const supabase = await createServiceRoleClient()

    const connection = await cachedQuery(
      `channel_conn:whatsapp:${phoneNumberId}`,
      300,
      async () => {
        const { data: conn } = await supabase.from('channel_connections')
          .select('organization_id')
          .eq('channel', 'whatsapp')
          .filter('config->>phone_number_id', 'eq', String(phoneNumberId))
          .maybeSingle()
        return conn
      },
    )

    if (!connection) {
      log.warn('webhook_no_connection', {
        route: '/api/webhooks/whatsapp',
        channel: 'whatsapp',
        external_id: phoneNumberId,
      })
      return NextResponse.json({ status: 'ok' })
    }

    const orgId = connection.organization_id

    const { success: allowed, remaining, reset } = await limiters.webhook(`webhook:whatsapp:${orgId}`)
    if (!allowed) {
      return new NextResponse(JSON.stringify({ status: 'ok' }), {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)) },
      })
    }

    const { data: org } = await supabase.from('organizations').select('is_active').eq('id', orgId).single()
    if (!org?.is_active) return NextResponse.json({ status: 'ok' })

    const { data: existing } = await supabase.from('conversations')
      .select('id').eq('organization_id', orgId)
      .eq('channel', 'whatsapp').eq('channel_conversation_id', from)
      .limit(1).maybeSingle()

    if (!existing) {
      const usage = await checkUsageLimit(orgId)
      if (!usage.allowed) {
        log.warn('usage_limit_reached', {
          route: '/api/webhooks/whatsapp',
          orgId,
          channel: 'whatsapp',
          used: usage.used,
          limit: usage.limit,
          plan: usage.planName,
        })
        await supabase.from('analytics_events').insert({
          organization_id: orgId,
          event_type: 'usage_limit_reached',
          event_data: { channel: 'whatsapp', from, used: usage.used, limit: usage.limit, plan: usage.planName },
        })
        const whatsappToken = process.env.WHATSAPP_TOKEN
        if (whatsappToken) {
          await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${whatsappToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: from,
              text: { body: 'Support is temporarily unavailable. Please try again later.' },
            }),
          })
        }
        return NextResponse.json({ status: 'ok' })
      }
    }

    let conversationId: string
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

    const agent = await getAgentConfig(orgId)

    const response = await generateAIResponse({
      organizationId: orgId,
      conversationId,
      message: text,
      history: history || [],
      agentConfig: agent || undefined,
      channelConversationId: from,
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
    Sentry.captureException(error, {
      tags: { route: '/api/webhooks/whatsapp' },
    })
    log.error('WhatsApp webhook error', {
      route: '/api/webhooks/whatsapp',
      error,
    })
    return NextResponse.json({ status: 'ok' })
  }
}
