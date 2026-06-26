import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { authCallbackSchema, sanitizeInput } from '@/lib/validation'
import { limiters, checkAccountLockout, recordFailedAttempt, resetAccountLockout } from '@/lib/rate-limit'
import { log } from '@/lib/logger'

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  const { success: allowed } = await limiters.auth(`auth:signin:${ip}`)
  if (!allowed) {
    return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 })
  }

  const parsed = authCallbackSchema.safeParse(body)
  if (!parsed.success) {
    log.warn('auth_validation_failure', { route: '/api/auth/callback', ip, errors: parsed.error.issues })
    return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 })
  }

  const { email, password } = parsed.data
  const sanitizedEmail = sanitizeInput(email, 255).toLowerCase()

  const { locked } = checkAccountLockout(`account:${sanitizedEmail}`)
  if (locked) {
    log.warn('auth_account_locked', { route: '/api/auth/callback', email: sanitizedEmail, ip })
    return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 })
  }

  const adminClient = createServiceRoleClient()

  const { data, error } = await (await adminClient).auth.signInWithPassword({
    email: sanitizedEmail,
    password,
  })

  if (error) {
    recordFailedAttempt(`account:${sanitizedEmail}`)
    log.warn('auth_login_failed', { route: '/api/auth/callback', email: sanitizedEmail, ip })
    return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 })
  }

  resetAccountLockout(`account:${sanitizedEmail}`)

  const response = NextResponse.json({ user: data.user })
  return response
}
