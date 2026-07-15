import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { log } from '@/lib/logger'

const EXPO_PUSH_API = 'https://exp.host/--/api/v2/push/send'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (!authHeader?.startsWith('Bearer ') || authHeader.slice(7) !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { organization_id, title, body: messageBody, data } = body

    if (!organization_id || !title || !messageBody) {
      return NextResponse.json({ error: 'organization_id, title, and body required' }, { status: 400 })
    }

    const supabase = await createServiceRoleClient()

    const { data: tokens, error: tokenError } = await supabase
      .from('device_tokens')
      .select('expo_push_token, user_id')
      .eq('organization_id', organization_id)
      .eq('is_active', true)

    if (tokenError) {
      log.error('Failed to fetch device tokens', { error: tokenError })
      return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 })
    }

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ sent: 0 })
    }

    const userIds = tokens.map(t => t.user_id)
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('user_id, escalation_alerts, usage_alerts, billing_alerts')
      .in('user_id', userIds)
      .eq('organization_id', organization_id)

    const prefMap = new Map((prefs ?? []).map(p => [p.user_id, p]))

    const messages = tokens
      .filter(t => {
        const p = prefMap.get(t.user_id)
        if (!p) return true
        if (data?.type === 'escalation' && !p.escalation_alerts) return false
        if (data?.type === 'usage' && !p.usage_alerts) return false
        if (data?.type === 'billing' && !p.billing_alerts) return false
        return true
      })
      .map(t => ({
        to: t.expo_push_token,
        sound: 'default' as const,
        title,
        body: messageBody,
        data: data ?? {},
        priority: 'high' as const,
      }))

    if (messages.length === 0) {
      return NextResponse.json({ sent: 0, filtered: tokens.length })
    }

    const expoRes = await fetch(EXPO_PUSH_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    })

    const result = await expoRes.json()

    if (!expoRes.ok) {
      log.error('Expo push API error', { result })
    }

    return NextResponse.json({
      sent: messages.length,
      total_tokens: tokens.length,
      result,
    })
  } catch (error) {
    log.error('Notification dispatch error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
