import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'
import { log } from '@/lib/logger'
import { limiters } from '@/lib/rate-limit'

const validActions = ['approve_client', 'suspend_client', 'reject_client', 'reopen_client'] as const
type AdminAction = typeof validActions[number]

export async function GET() {
  try {
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
    if (!membership || membership.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data } = await supabase.from('organizations')
      .select('*')
      .order('created_at', { ascending: false })

    return NextResponse.json(data || [])
  } catch (error) {
    Sentry.captureException(error, { tags: { route: '/api/admin/actions' } })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
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
    if (!membership || membership.role === 'team_member') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { action, target_organization_id } = body as { action?: string; target_organization_id?: string }

    if (!action || !validActions.includes(action as AdminAction)) {
      return NextResponse.json({ error: `Invalid action. Must be one of: ${validActions.join(', ')}` }, { status: 400 })
    }
    if (!target_organization_id || typeof target_organization_id !== 'string') {
      return NextResponse.json({ error: 'target_organization_id is required' }, { status: 400 })
    }

    const { success, reset } = await limiters.api(`admin:${session.user.id}`)
    if (!success) {
      return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded. Please slow down.' }), {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)) },
      })
    }

    const svc = await createServiceRoleClient()

    switch (action as AdminAction) {
      case 'approve_client': {
        const { error } = await svc
          .from('organizations')
          .update({
            is_active: true,
            status: 'active',
            approved_at: new Date().toISOString(),
            approved_by: session.user.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', target_organization_id)
        if (error) return NextResponse.json({ error: 'Action failed' }, { status: 500 })
        break
      }
      case 'suspend_client': {
        const { error } = await svc
          .from('organizations')
          .update({ is_active: false, status: 'suspended', updated_at: new Date().toISOString() })
          .eq('id', target_organization_id)
        if (error) return NextResponse.json({ error: 'Action failed' }, { status: 500 })
        break
      }
      case 'reject_client': {
        const { error } = await svc
          .from('organizations')
          .update({ is_active: false, status: 'suspended', updated_at: new Date().toISOString() })
          .eq('id', target_organization_id)
        if (error) return NextResponse.json({ error: 'Action failed' }, { status: 500 })
        break
      }
      case 'reopen_client': {
        const { error } = await svc
          .from('organizations')
          .update({ is_active: false, status: 'pending', updated_at: new Date().toISOString() })
          .eq('id', target_organization_id)
        if (error) return NextResponse.json({ error: 'Action failed' }, { status: 500 })
        break
      }
    }

    await logAudit({
      userId: session.user.id,
      organizationId: membership.organization_id,
      action,
      resourceType: 'organization',
      resourceId: target_organization_id,
      details: { target_organization_id, performed_by: session.user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    Sentry.captureException(error, { tags: { route: '/api/admin/actions' } })
    log.error('admin action error', { route: '/api/admin/actions', error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
