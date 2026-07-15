import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import crypto from 'crypto'

const FB_API_VERSION = 'v21.0'
const FB_AUTH_URL = `https://www.facebook.com/${FB_API_VERSION}/dialog/oauth`

const CHANNEL_SCOPES: Record<string, string> = {
  whatsapp: 'pages_show_list,pages_manage_metadata,pages_messaging,business_management',
  instagram: 'pages_show_list,instagram_basic,instagram_manage_messages,pages_read_engagement',
  facebook: 'pages_manage_metadata,pages_messaging,pages_read_engagement,pages_show_list',
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const channel = searchParams.get('channel')
  const orgId = searchParams.get('org_id')

  if (!channel || !['whatsapp', 'instagram', 'facebook'].includes(channel)) {
    return NextResponse.json({ error: 'Invalid channel' }, { status: 400 })
  }
  if (!orgId) {
    return NextResponse.json({ error: 'org_id is required' }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const appId = process.env.META_APP_ID
  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
  const redirectUri = `${origin}/api/auth/meta/callback`

  if (!appId) {
    return NextResponse.json({ error: 'META_APP_ID not configured' }, { status: 500 })
  }

  const statePayload = JSON.stringify({ org_id: orgId, channel, uid: session.user.id, nonce: crypto.randomUUID() })
  const state = Buffer.from(statePayload).toString('base64url')

  const scope = CHANNEL_SCOPES[channel] || 'pages_show_list'

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    scope,
    response_type: 'code',
  })

  return NextResponse.redirect(`${FB_AUTH_URL}?${params.toString()}`)
}
