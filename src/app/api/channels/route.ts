import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { safeEncryptCredentials, safeDecryptCredentials } from '@/lib/crypto'
import { logAudit } from '@/lib/audit'

/**
 * GET /api/channels
 * Returns channel connections for the authenticated user's organization.
 * Credentials are decrypted before returning (never expose raw encrypted string to client).
 */
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

/**
 * POST /api/channels
 * Creates or updates a channel connection with encrypted credentials.
 * Body: { channel, name, credentials, webhook_url }
 */
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
  const { channel, name, credentials, webhook_url, config } = body

  if (!channel) return NextResponse.json({ error: 'channel is required' }, { status: 400 })

  // Encrypt sensitive credentials before storing
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

/**
 * PATCH /api/channels
 * Update connection status or credentials for a channel.
 * Body: { channel, is_connected?, credentials?, webhook_url? }
 */
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
  const { channel, is_connected, credentials, webhook_url, config } = body
  if (!channel) return NextResponse.json({ error: 'channel is required' }, { status: 400 })

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

/**
 * DELETE /api/channels?channel=whatsapp
 * Disconnects a channel (sets is_connected=false, clears credentials).
 */
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
