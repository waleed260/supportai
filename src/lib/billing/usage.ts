import { createServiceRoleClient } from '@/lib/supabase/server'

export type UsageResult = {
  allowed: boolean
  used: number
  limit: number
  planName: string | null
}

export async function checkUsageLimit(organizationId: string): Promise<UsageResult> {
  const supabase = await createServiceRoleClient()

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan_id, current_period_start, current_period_end, status')
    .eq('organization_id', organizationId)
    .in('status', ['active', 'trialing'])
    .limit(1)
    .maybeSingle()

  if (!sub) {
    return { allowed: false, used: 0, limit: 0, planName: null }
  }

  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('max_conversations, name')
    .eq('id', sub.plan_id)
    .single()

  if (!plan) {
    return { allowed: false, used: 0, limit: 0, planName: null }
  }

  const periodStart = sub.current_period_start
  const periodEnd = sub.current_period_end

  let query = supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)

  if (periodStart) {
    query = query.gte('created_at', periodStart)
  }
  if (periodEnd) {
    query = query.lt('created_at', periodEnd)
  }

  const { count } = await query

  const used = count ?? 0
  const limit = plan.max_conversations

  return {
    allowed: used < limit,
    used,
    limit,
    planName: plan.name,
  }
}
