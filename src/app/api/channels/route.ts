import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { safeEncryptCredentials, safeDecryptCredentials } from '@/lib/crypto'
import { logAudit } from '@/lib/audit'
import { channelsPostSchema, channelsPatchSchema } from '@/lib/validation'
import { limiters } from '@/lib/rate-limit'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id, role')
    .eq('user_id', session.user.id)
    .eq('is_active', true)
    .limit(1)
    .single()
  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 403 })

  const svc = await createServiceRoleClient()
  const { data, error } = await svc
    .from('channel_connections')
    .select('id, channel, name, is_connected, webhook_url, webhook_verified, created_at, updated_at')
    .eq('organization_id', membership.organization_id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id, role')
    .eq('user_id', session.user.id)
    .eq('is_active', true)
    .limit(1)
    .single()
  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 403 })
  if (membership.role === 'team_member') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = channelsPostSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { channel, name, credentials, webhook_url, config } = parsed.data

  const { success, remaining, reset } = await limiters.api(`channels:${membership.organization_id}`)
  if (!success) {
    return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded. Please slow down.' }), {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)) },
    })
  }

  const encryptedCreds = credentials ? safeEncryptCredentials(credentials) : '{}'

  const svc = await createServiceRoleClient()
  const { data, error } = await svc
    .from('channel_connections')
    .upsert({
      organization_id: membership.organization_id,
      channel,
      name: name ?? channel,
      credentials: encryptedCreds,
      config: config ?? {},
      webhook_url: webhook_url ?? null,
      is_connected: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'organization_id,channel' })
    .select('id, channel, name, is_connected, webhook_url, webhook_verified, created_at, updated_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAudit({
    userId: session.user.id,
    organizationId: membership.organization_id,
    action: 'channel_connected',
    resourceType: 'channel_connection',
    resourceId: data?.id,
    details: { channel },
  })

  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id, role')
    .eq('user_id', session.user.id)
    .eq('is_active', true)
    .limit(1)
    .single()
  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 403 })
  if (membership.role === 'team_member') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = channelsPatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { channel, is_connected, credentials, webhook_url, config } = parsed.data

  const { success, remaining, reset } = await limiters.api(`channels:${membership.organization_id}`)
  if (!success) {
    return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded. Please slow down.' }), {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)) },
    })
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (is_connected !== undefined) updates.is_connected = is_connected
  if (webhook_url !== undefined) updates.webhook_url = webhook_url
  if (credentials !== undefined) updates.credentials = safeEncryptCredentials(credentials)
  if (config !== undefined) updates.config = config

  const svc = await createServiceRoleClient()
  const { data, error } = await svc
    .from('channel_connections')
    .update(updates)
    .eq('organization_id', membership.organization_id)
    .eq('channel', channel)
    .select('id, channel, name, is_connected, webhook_url, webhook_verified, created_at, updated_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id, role')
    .eq('user_id', session.user.id)
    .eq('is_active', true)
    .limit(1)
    .single()
  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 403 })
  if (membership.role === 'team_member') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const channel = searchParams.get('channel')
  if (!channel) return NextResponse.json({ error: 'channel query param required' }, { status: 400 })

  const svc = await createServiceRoleClient()
  const { error } = await svc
    .from('channel_connections')
    .update({ is_connected: false, credentials: '{}', updated_at: new Date().toISOString() })
    .eq('organization_id', membership.organization_id)
    .eq('channel', channel)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAudit({
    userId: session.user.id,
    organizationId: membership.organization_id,
    action: 'channel_disconnected',
    resourceType: 'channel_connection',
    details: { channel },
  })

  return NextResponse.json({ success: true })
}
