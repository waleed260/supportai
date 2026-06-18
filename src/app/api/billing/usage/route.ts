import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { checkUsageLimit } from '@/lib/billing/usage'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase.from('memberships')
    .select('organization_id').eq('user_id', user.id).limit(1).single()
  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 404 })

  const usage = await checkUsageLimit(membership.organization_id)

  return NextResponse.json(usage)
}
