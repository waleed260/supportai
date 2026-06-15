import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase.from('memberships')
    .select('organization_id').eq('user_id', user.id).limit(1).single()
  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 404 })

  const adminClient = await createServiceRoleClient()
  const orgId = membership.organization_id

  const [subResult, plansResult] = await Promise.all([
    adminClient.from('subscriptions').select('*, plan:subscription_plans(*)')
      .eq('organization_id', orgId).single(),
    adminClient.from('subscription_plans').select('*').eq('is_active', true),
  ])

  return NextResponse.json({
    subscription: subResult.data || null,
    plans: plansResult.data || [],
  })
}
