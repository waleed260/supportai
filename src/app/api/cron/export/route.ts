import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { exportAllTables } from '@/lib/backup'
import { log } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`

  if (!expected || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await exportAllTables()
    log.info('Nightly backup export completed', {
      route: '/api/cron/export',
      tablesExported: result.exports.filter(e => !e.error).length,
      tablesWithErrors: result.exports.filter(e => e.error).length,
      storagePath: result.storagePath,
    })
    return NextResponse.json(result)
  } catch (error) {
    Sentry.captureException(error, { tags: { route: '/api/cron/export' } })
    log.error('Nightly backup export failed', { route: '/api/cron/export', error })
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
