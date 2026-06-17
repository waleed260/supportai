import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase.from('memberships')
    .select('organization_id').eq('user_id', session.user.id).limit(1).single()
  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 403 })

  const { data } = await supabase.from('org_integrations')
    .select('*')
    .eq('organization_id', membership.organization_id)
  return NextResponse.json(data || [])
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase.from('memberships')
    .select('organization_id, role').eq('user_id', session.user.id).limit(1).single()
  if (!membership || membership.role === 'team_member') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { provider, credentials, settings } = body

  if (!provider) return NextResponse.json({ error: 'provider is required' }, { status: 400 })

  const svc = await createServiceRoleClient()
  const { data, error } = await svc.from('org_integrations').upsert({
    organization_id: membership.organization_id,
    provider,
    credentials: credentials || {},
    settings: settings || {},
    is_enabled: true,
    name: `${provider} integration`,
  }, { onConflict: 'organization_id,provider' }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase.from('memberships')
    .select('organization_id, role').eq('user_id', session.user.id).limit(1).single()
  if (!membership || membership.role === 'team_member') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { provider, is_enabled, credentials, settings } = body

  const svc = await createServiceRoleClient()
  const updateData: Record<string, any> = {}
  if (is_enabled !== undefined) updateData.is_enabled = is_enabled
  if (credentials !== undefined) updateData.credentials = credentials
  if (settings !== undefined) updateData.settings = settings

  const { data, error } = await svc.from('org_integrations')
    .update(updateData)
    .eq('organization_id', membership.organization_id)
    .eq('provider', provider)
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
