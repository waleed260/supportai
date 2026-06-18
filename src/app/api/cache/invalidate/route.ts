import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { cacheDel } from '@/lib/cache'
import { cacheInvalidateSchema } from '@/lib/validation'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase.from('memberships')
    .select('organization_id').eq('user_id', session.user.id).limit(1).single()
  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 403 })

  const body = await request.json()
  const parsed = cacheInvalidateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const cacheKey = `${parsed.data.pattern}:${membership.organization_id}`
  await cacheDel(cacheKey)

  return NextResponse.json({ ok: true })
}
