import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase.from('memberships')
    .select('organization_id').eq('user_id', session.user.id).limit(1).single()
  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 403 })

  const orgId = membership.organization_id

  const [convos, active, resolved, escalated, leads, byDay, sentiment] = await Promise.all([
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'active'),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'resolved'),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'escalated'),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
    supabase.rpc('get_conversations_by_day', { p_organization_id: orgId, p_days: 30 }),
    supabase.rpc('get_sentiment_breakdown', { p_organization_id: orgId }),
  ])

  return NextResponse.json({
    total_conversations: convos.count || 0,
    active_conversations: active.count || 0,
    resolved_conversations: resolved.count || 0,
    escalation_rate: convos.count ? ((escalated.count || 0) / convos.count) * 100 : 0,
    resolution_rate: convos.count ? ((resolved.count || 0) / convos.count) * 100 : 0,
    total_leads: leads.count || 0,
    conversations_over_time: byDay.data || [],
    sentiment_breakdown: sentiment.data || [],
  })
}
