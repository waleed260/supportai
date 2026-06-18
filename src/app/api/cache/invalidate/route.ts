import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { cacheDel } from '@/lib/cache'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase.from('memberships')
    .select('organization_id').eq('user_id', session.user.id).limit(1).single()
  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 403 })

  const { pattern } = await request.json()
  if (typeof pattern !== 'string') {
    return NextResponse.json({ error: 'pattern is required' }, { status: 400 })
  }

  const cacheKey = `${pattern}:${membership.organization_id}`
  await cacheDel(cacheKey)

  return NextResponse.json({ ok: true })
}
