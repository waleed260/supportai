import { NextResponse } from 'next/server'
import crypto from 'crypto'
import * as Sentry from '@sentry/nextjs'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generateAIResponse, storeMessage, storeSentiment, getAgentConfig } from '@/lib/ai/agent'
import { limiters } from '@/lib/rate-limit'
import { checkUsageLimit } from '@/lib/billing/usage'
import { cachedQuery } from '@/lib/cache'
import { log } from '@/lib/logger'
import { safeDecryptCredentials } from '@/lib/crypto'

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
    const rawBody = await request.text()

    const signature = request.headers.get('x-hub-signature-256') || ''
    const appSecret = process.env.META_APP_SECRET
    if (!appSecret) {
      log.error('META_APP_SECRET not configured', { route: '/api/webhooks/facebook' })
      Sentry.captureException(new Error('META_APP_SECRET not configured'), {
        tags: { route: '/api/webhooks/facebook' },
      })
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const expected = 'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex')
    if (!signature || signature !== expected) {
      log.error('invalid or missing signature', { route: '/api/webhooks/facebook' })
      Sentry.captureException(new Error('Invalid webhook signature'), {
        tags: { route: '/api/webhooks/facebook' },
        extra: { channel: 'facebook', hasSignature: !!signature, matches: signature === expected },
      })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)

    const entry = body.entry?.[0]
    const messaging = entry?.messaging?.[0]

    if (!messaging) return NextResponse.json({ status: 'ok' })

    const senderId = messaging.sender?.id
    const text = messaging.message?.text || ''
    const pageId = messaging.recipient?.id

    if (!senderId || !text) return NextResponse.json({ status: 'ok' })

    const supabase = await createServiceRoleClient()

    const connection = await cachedQuery(
      `channel_conn:facebook:${pageId}`,
      300,
      async () => {
        const { data: conn } = await supabase.from('channel_connections')
          .select('organization_id, credentials')
          .eq('channel', 'facebook')
          .filter('config->>page_id', 'eq', String(pageId))
          .maybeSingle()
        return conn
      },
    )

    if (!connection) {
      log.warn('webhook_no_connection', {
        route: '/api/webhooks/facebook',
        channel: 'facebook',
        external_id: pageId,
      })
      return NextResponse.json({ status: 'ok' })
    }

    function getChannelToken(conn: typeof connection): string | null {
      if (conn?.credentials && conn.credentials !== '{}') {
        const decrypted = safeDecryptCredentials(conn.credentials)
        if (decrypted && typeof decrypted.access_token === 'string') return decrypted.access_token
      }
      return null
    }

    const orgId = connection.organization_id

    const { success: allowed, remaining, reset } = await limiters.webhook(`webhook:facebook:${orgId}`)
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
      .eq('channel', 'facebook').eq('channel_conversation_id', senderId)
      .limit(1).maybeSingle()

    if (!existing) {
      const usage = await checkUsageLimit(orgId)
      if (!usage.allowed) {
        log.warn('usage_limit_reached', {
          route: '/api/webhooks/facebook',
          orgId,
          channel: 'facebook',
          used: usage.used,
          limit: usage.limit,
          plan: usage.planName,
        })
        await supabase.from('analytics_events').insert({
          organization_id: orgId,
          event_type: 'usage_limit_reached',
          event_data: { channel: 'facebook', sender_id: senderId, used: usage.used, limit: usage.limit, plan: usage.planName },
        })
        const unavailableToken = getChannelToken(connection) || process.env.FACEBOOK_PAGE_TOKEN
        if (unavailableToken && pageId) {
          await fetch(`https://graph.facebook.com/v21.0/${pageId}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + unavailableToken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              recipient: { id: senderId },
              message: { text: 'Support is temporarily unavailable. Please try again later.' },
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

    const agent = await getAgentConfig(orgId)

    const response = await generateAIResponse({
      organizationId: orgId,
      conversationId,
      message: text,
      history: history || [],
      agentConfig: agent || undefined,
      channelConversationId: senderId,
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

    const replyToken = getChannelToken(connection) || process.env.FACEBOOK_PAGE_TOKEN
    if (replyToken && pageId) {
      const url = 'https://graph.facebook.com/v21.0/' + pageId + '/messages'
      await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + replyToken,
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
    Sentry.captureException(error, {
      tags: { route: '/api/webhooks/facebook' },
    })
    log.error('Facebook webhook error', {
      route: '/api/webhooks/facebook',
      error,
    })
    return NextResponse.json({ status: 'ok' })
  }
}
