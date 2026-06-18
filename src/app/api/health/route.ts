import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import * as Sentry from '@sentry/nextjs'

export async function GET() {
  const checks: Record<string, unknown> = {}

  try {
    const supabase = await createServiceRoleClient()
    const { error } = await supabase.from('organizations').select('id', { count: 'exact', head: true }).limit(1)
    checks.database = !error
    if (error) checks.database_error = error.message
  } catch (err) {
    checks.database = false
    checks.database_error = err instanceof Error ? err.message : String(err)
    Sentry.captureException(err, { tags: { route: '/api/health' } })
  }

  const ok = checks.database === true
  const status = ok ? 200 : 503

  return NextResponse.json(
    { status: ok ? 'ok' : 'degraded', checks },
    { status },
  )
}
