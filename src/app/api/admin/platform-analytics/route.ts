import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { log } from '@/lib/logger'

const DAYS_DEFAULT = 30

function daysFromQuery(url: string) {
  const parsed = new URL(url)
  const d = Number(parsed.searchParams.get('days') ?? DAYS_DEFAULT)
  return Number.isFinite(d) && [7, 30, 90].includes(d) ? d : DAYS_DEFAULT
}

export async function GET(request: Request) {
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

    const days = daysFromQuery(request.url)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    const svc = await createServiceRoleClient()

    const { data: convos } = await svc
      .from('conversations')
      .select('id, channel, status, sentiment, created_at')
      .gte('created_at', since)

    const convosList = convos || []

    const total = convosList.length
    const resolved = convosList.filter(c => c.status === 'resolved').length
    const escalated = convosList.filter(c => c.status === 'escalated').length
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0
    const escalationRate = total > 0 ? Math.round((escalated / total) * 100) : 0

    const byDay: Record<string, number> = {}
    convosList.forEach(c => {
      const d = new Date(c.created_at).toISOString().slice(0, 10)
      byDay[d] = (byDay[d] || 0) + 1
    })
    const conversationTrends = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }))

    const channelData: Record<string, number> = {}
    convosList.forEach(c => {
      channelData[c.channel] = (channelData[c.channel] || 0) + 1
    })
    const channelDistribution = Object.entries(channelData)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    const sentimentData: Record<string, number> = {}
    convosList.forEach(c => {
      sentimentData[c.sentiment] = (sentimentData[c.sentiment] || 0) + 1
    })
    const sentimentBreakdown = Object.entries(sentimentData).map(([name, count]) => ({ name, count }))

    const weekly: Record<string, { total: number; resolved: number }> = {}
    convosList.forEach(c => {
      const date = new Date(c.created_at)
      const day = date.getDay()
      const diffToMonday = (day + 6) % 7
      const monday = new Date(date)
      monday.setDate(date.getDate() - diffToMonday)
      const key = monday.toISOString().slice(0, 10)
      weekly[key] = weekly[key] || { total: 0, resolved: 0 }
      weekly[key].total += 1
      if (c.status === 'resolved') weekly[key].resolved += 1
    })
    const weeklyResolutionRate = Object.entries(weekly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, v]) => ({
        week,
        rate: v.total > 0 ? Math.round((v.resolved / v.total) * 100) : 0,
      }))

    return NextResponse.json({
      days,
      kpis: { total, resolved, escalated, resolutionRate, escalationRate, avgResponseText: null },
      conversationTrends,
      channelDistribution,
      sentimentBreakdown,
      weeklyResolutionRate,
    })
  } catch (error) {
    Sentry.captureException(error, { tags: { route: '/api/admin/platform-analytics' } })
    log.error('platform analytics error', { route: '/api/admin/platform-analytics', error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
