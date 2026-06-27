import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id')
    .eq('user_id', session.user.id)
    .eq('is_active', true)
    .limit(1)
    .single()
  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 403 })

  const svc = await createServiceRoleClient()
  const { data } = await svc.from('widget_settings')
    .select('title, welcome_message, primary_color, position, show_branding')
    .eq('organization_id', membership.organization_id)
    .maybeSingle()

  return NextResponse.json(data ?? {})
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
  const { title, welcome_message, primary_color } = body

  const svc = await createServiceRoleClient()
  const { error } = await svc.from('widget_settings').upsert({
    organization_id: membership.organization_id,
    title: title || 'Chat with us',
    welcome_message: welcome_message || 'Hi! How can we help you today?',
    primary_color: primary_color || '#2563eb',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'organization_id' })

  if (error) return NextResponse.json({ error: 'Failed to update widget settings' }, { status: 500 })
  return NextResponse.json({ success: true })
}
