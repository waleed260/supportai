import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { log } from '@/lib/logger'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServiceRoleClient()
    const token = authHeader.slice(7)
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get('organization_id')
    if (!orgId) {
      return NextResponse.json({ error: 'organization_id required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .eq('organization_id', orgId)
      .maybeSingle()

    if (error) {
      log.error('Failed to fetch preferences', { error })
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
    }

    return NextResponse.json({
      preferences: data ?? {
        escalation_alerts: true,
        usage_alerts: true,
        billing_alerts: true,
      },
    })
  } catch (error) {
    log.error('Preferences fetch error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServiceRoleClient()
    const token = authHeader.slice(7)
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { organization_id, escalation_alerts, usage_alerts, billing_alerts } = body

    if (!organization_id) {
      return NextResponse.json({ error: 'organization_id required' }, { status: 400 })
    }

    const { error: upsertError } = await supabase.from('notification_preferences').upsert({
      user_id: user.id,
      organization_id,
      escalation_alerts: escalation_alerts ?? true,
      usage_alerts: usage_alerts ?? true,
      billing_alerts: billing_alerts ?? true,
    }, { onConflict: 'user_id,organization_id', ignoreDuplicates: false })

    if (upsertError) {
      log.error('Failed to update preferences', { error: upsertError })
      return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    log.error('Preferences update error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
