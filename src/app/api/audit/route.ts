import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'
import { log } from '@/lib/logger'
import { z } from 'zod'

const auditPostSchema = z.object({
  action: z.string().min(1).max(100),
  resourceType: z.string().max(100).optional(),
  resourceId: z.string().max(255).optional(),
  details: z.record(z.string(), z.unknown()).optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .limit(1)
      .single()
    if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 403 })

    const body = await request.json()
    const parsed = auditPostSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    await logAudit({
      userId: session.user.id,
      organizationId: membership.organization_id,
      action: parsed.data.action,
      resourceType: parsed.data.resourceType,
      resourceId: parsed.data.resourceId,
      details: parsed.data.details,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    Sentry.captureException(error, { tags: { route: '/api/audit' } })
    log.error('audit route error', { route: '/api/audit', error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
