import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { log } from '@/lib/logger'

const MRR_STATUSES = ['active', 'trialing', 'past_due']

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

    const svc = await createServiceRoleClient()

    const { data: orgs } = await svc
      .from('organizations')
      .select('id, name, slug, website, company_size, industry, status, is_active, approved_at, created_at, logo_url')

    const { data: subs } = await svc
      .from('subscriptions')
      .select('organization_id, status, billing_interval, current_period_start, current_period_end, plan_id, created_at')

    const { data: plans } = await svc
      .from('subscription_plans')
      .select('id, name, price_monthly, price_yearly')

    const orgList = orgs || []
    const subList = subs || []
    const planList = plans || []

    const planById = new Map(planList.map(p => [p.id, p]))

    const monthlyAmount = (sub: { plan_id: string; billing_interval?: string | null }) => {
      const plan = planById.get(sub.plan_id)
      if (!plan) return 0
      return sub.billing_interval === 'year' ? Math.round(plan.price_yearly / 12) : plan.price_monthly
    }

    const payingSubs = subList.filter(s => MRR_STATUSES.includes(s.status))
    const mrr = payingSubs.reduce((sum, s) => sum + (monthlyAmount(s) || 0), 0)

    const now = new Date()
    const mrrSeries: { month: string; revenue: number }[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const next = new Date(d.getFullYear(), d.getMonth() + 1, 1)
      const label = d.toLocaleDateString('en-US', { month: 'short' })
      const revenue = subList.reduce((sum, s) => {
        const start = s.current_period_start ? new Date(s.current_period_start) : s.created_at ? new Date(s.created_at) : null
        if (!start || start >= next) return sum
        if (!MRR_STATUSES.includes(s.status)) return sum
        return sum + (monthlyAmount(s) || 0)
      }, 0)
      mrrSeries.push({ month: label, revenue })
    }

    const counts = {
      total: orgList.length,
      active: orgList.filter(o => o.status === 'active' || (!o.status && o.is_active)).length,
      pending: orgList.filter(o => o.status === 'pending' || (!o.status && !o.is_active)).length,
      paused: orgList.filter(o => o.status === 'paused').length,
      suspended: orgList.filter(o => o.status === 'suspended').length,
    }

    const activeSubIds = new Set(payingSubs.map(s => s.organization_id))
    const recentClients = orgList
      .filter(o => o.status === 'active' || (!o.status && o.is_active))
      .map(o => {
        const sub = subList.find(s => s.organization_id === o.id && MRR_STATUSES.includes(s.status))
        const plan = sub ? planById.get(sub.plan_id) : undefined
        return {
          id: o.id,
          name: o.name,
          slug: o.slug,
          website: o.website,
          company_size: o.company_size,
          industry: o.industry,
          logo_url: o.logo_url,
          status: o.status ?? (o.is_active ? 'active' : 'pending'),
          approved_at: o.approved_at,
          created_at: o.created_at,
          plan_name: plan?.name || null,
          mrr: sub ? monthlyAmount(sub) : 0,
          is_subscribed: activeSubIds.has(o.id),
        }
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)

    return NextResponse.json({ counts, mrr, mrrSeries, recentClients })
  } catch (error) {
    Sentry.captureException(error, { tags: { route: '/api/admin/platform-stats' } })
    log.error('platform stats error', { route: '/api/admin/platform-stats', error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
