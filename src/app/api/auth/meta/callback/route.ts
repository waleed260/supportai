import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { safeEncryptCredentials } from '@/lib/crypto'
import { logAudit } from '@/lib/audit'
import { log } from '@/lib/logger'

const FB_API_VERSION = 'v21.0'
const GRAPH_URL = `https://graph.facebook.com/${FB_API_VERSION}`

async function exchangeCodeForToken(code: string, redirectUri: string) {
  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET
  if (!appId || !appSecret) throw new Error('Meta App not configured')

  const res = await fetch(
    `${GRAPH_URL}/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`,
  )
  const data = await res.json()
  if (!res.ok || !data.access_token) throw new Error(data.error?.message || 'Failed to exchange code for token')
  return data.access_token as string
}

async function getLongLivedToken(shortToken: string) {
  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET
  const res = await fetch(
    `${GRAPH_URL}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortToken}`,
  )
  const data = await res.json()
  if (!res.ok || !data.access_token) throw new Error(data.error?.message || 'Failed to extend token')
  return data.access_token as string
}

async function getPages(longToken: string) {
  const res = await fetch(`${GRAPH_URL}/me/accounts?access_token=${longToken}&limit=100`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch pages')
  return data.data as { id: string; name: string; access_token: string; category: string }[]
}

async function getInstagramBusinessAccount(pageId: string, pageToken: string) {
  const res = await fetch(`${GRAPH_URL}/${pageId}?fields=instagram_business_account{id,username,name}&access_token=${pageToken}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch Instagram account')
  return data.instagram_business_account as { id: string; username: string; name: string } | undefined
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const errorReason = searchParams.get('error_reason')
    const stateParam = searchParams.get('state')

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/admin/channels?oauth_error=${errorReason || error}`,
      )
    }

    if (!code || !stateParam) {
      return NextResponse.json({ error: 'Missing code or state' }, { status: 400 })
    }

    let state: { org_id: string; channel: string; uid: string }
    try {
      state = JSON.parse(Buffer.from(stateParam, 'base64url').toString())
    } catch {
      return NextResponse.json({ error: 'Invalid state' }, { status: 400 })
    }

    const { org_id: orgId, channel, uid: userId } = state
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const redirectUri = `${appUrl}/api/auth/meta/callback`

    const shortToken = await exchangeCodeForToken(code, redirectUri)
    const longToken = await getLongLivedToken(shortToken)

    const supabase = await createServiceRoleClient()

    if (channel === 'facebook') {
      const pages = await getPages(longToken)
      if (pages.length === 0) {
        return NextResponse.redirect(`${appUrl}/dashboard/admin/channels?oauth_error=No Facebook pages found`)
      }
      const page = pages[0]
      const encryptedCreds = safeEncryptCredentials({ access_token: page.access_token })
      await supabase.from('channel_connections').upsert({
        organization_id: orgId,
        channel: 'facebook',
        name: `Facebook — ${page.name}`,
        credentials: encryptedCreds,
        config: { page_id: page.id },
        is_connected: true,
        webhook_url: `${appUrl}/api/webhooks/facebook`,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'organization_id,channel' })

      await logAudit({
        userId,
        organizationId: orgId,
        action: 'channel_connected',
        resourceType: 'channel_connection',
        details: { channel: 'facebook', page_id: page.id, page_name: page.name, method: 'oauth' },
      })

      return NextResponse.redirect(`${appUrl}/dashboard/admin/channels?oauth_success=facebook`)
    }

    if (channel === 'instagram') {
      const pages = await getPages(longToken)
      if (pages.length === 0) {
        return NextResponse.redirect(`${appUrl}/dashboard/admin/channels?oauth_error=No Facebook pages found`)
      }
      const page = pages[0]
      const igAccount = await getInstagramBusinessAccount(page.id, page.access_token)
      if (!igAccount) {
        return NextResponse.redirect(`${appUrl}/dashboard/admin/channels?oauth_error=No Instagram Business Account linked to your page`)
      }

      const encryptedCreds = safeEncryptCredentials({ access_token: longToken })
      await supabase.from('channel_connections').upsert({
        organization_id: orgId,
        channel: 'instagram',
        name: `Instagram — ${igAccount.name || igAccount.username}`,
        credentials: encryptedCreds,
        config: { business_account_id: igAccount.id },
        is_connected: true,
        webhook_url: `${appUrl}/api/webhooks/instagram`,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'organization_id,channel' })

      await logAudit({
        userId,
        organizationId: orgId,
        action: 'channel_connected',
        resourceType: 'channel_connection',
        details: { channel: 'instagram', ig_account_id: igAccount.id, method: 'oauth' },
      })

      return NextResponse.redirect(`${appUrl}/dashboard/admin/channels?oauth_success=instagram`)
    }

    if (channel === 'whatsapp') {
      const encryptedCreds = safeEncryptCredentials({ access_token: longToken })
      await supabase.from('channel_connections').upsert({
        organization_id: orgId,
        channel: 'whatsapp',
        name: 'WhatsApp Business',
        credentials: encryptedCreds,
        config: {},
        is_connected: true,
        webhook_url: `${appUrl}/api/webhooks/whatsapp`,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'organization_id,channel' })

      await logAudit({
        userId,
        organizationId: orgId,
        action: 'channel_connected',
        resourceType: 'channel_connection',
        details: { channel: 'whatsapp', method: 'oauth' },
      })

      return NextResponse.redirect(`${appUrl}/dashboard/admin/channels?oauth_success=whatsapp`)
    }

    return NextResponse.redirect(`${appUrl}/dashboard/admin/channels?oauth_error=Unknown channel`)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'OAuth failed'
    log.error('Meta OAuth callback error', { error: msg })
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return NextResponse.redirect(`${appUrl}/dashboard/admin/channels?oauth_error=${encodeURIComponent(msg)}`)
  }
}
