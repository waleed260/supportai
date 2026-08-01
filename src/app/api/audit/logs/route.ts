import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { paginationSchema } from '@/lib/validation'
import { limiters } from '@/lib/rate-limit'
import { log } from '@/lib/logger'

const VALID_SOURCES = ['audit', 'analytics', 'all'] as const

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: membership } = await supabase.from('memberships')
      .select('organization_id, role')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .limit(1)
      .single()
    if (!membership || membership.role === 'team_member') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const sourceParam = searchParams.get('source') || 'all'
    const source = VALID_SOURCES.includes(sourceParam as typeof VALID_SOURCES[number])
      ? sourceParam as typeof VALID_SOURCES[number]
      : 'all'

    const parsed = paginationSchema.safeParse({
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
    })
    const page = parsed.data?.page ?? 1
    const pageSize = Math.min(parsed.data?.pageSize ?? 50, 200)
    const offset = (page - 1) * pageSize

    const { success, reset } = await limiters.api(`logs:${session.user.id}`)
    if (!success) {
      return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded. Please slow down.' }), {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)) },
      })
    }

    const isSuperAdmin = membership.role === 'super_admin'
    const orgId = isSuperAdmin ? (searchParams.get('organization_id') || null) : membership.organization_id

    // audit_logs + analytics_events carry org-scoped data with RLS.
    // Use the service role to join user/organization display names (users has no broad select policy).
    const svc = await createServiceRoleClient()

    const results: Record<string, unknown> = {}

    if (source === 'audit' || source === 'all') {
      let query = svc.from('audit_logs')
        .select('*, users(full_name, email), organizations(name)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1)

      if (orgId) query = query.eq('organization_id', orgId)

      const { data, count, error } = await query
      if (error) {
        log.error('audit logs fetch error', { route: '/api/audit/logs', error })
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
      }
      results.audit = data || []
      results.auditTotal = count ?? 0
    }

    if (source === 'analytics' || source === 'all') {
      let query = svc.from('analytics_events')
        .select('*, organizations(name)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1)

      if (orgId) query = query.eq('organization_id', orgId)

      const { data, count, error } = await query
      if (error) {
        log.error('analytics events fetch error', { route: '/api/audit/logs', error })
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
      }
      results.analytics = data || []
      results.analyticsTotal = count ?? 0
    }

    results.page = page
    results.pageSize = pageSize

    return NextResponse.json(results)
  } catch (error) {
    Sentry.captureException(error, { tags: { route: '/api/audit/logs' } })
    log.error('logs route error', { route: '/api/audit/logs', error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
