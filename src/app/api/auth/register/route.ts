import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generateSlug } from '@/lib/utils'
import { registerSchema, sanitizeText, sanitizeInput } from '@/lib/validation'
import { limiters } from '@/lib/rate-limit'
import { log } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

    const { success: allowed } = await limiters.auth(`auth:register:${ip}`)
    if (!allowed) {
      return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 400 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 400 })
    }

    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      log.warn('register_validation_failure', { route: '/api/auth/register', ip, errors: parsed.error.issues })
      return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 400 })
    }

    const { email, password, name: rawName, companyName: rawCompany, companySize } = parsed.data
    const emailClean = sanitizeInput(email, 255).toLowerCase()
    const name = sanitizeInput(rawName, 255)
    const companyName = sanitizeInput(rawCompany, 255)

    const supabase = await createServiceRoleClient()

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: emailClean,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    })

    if (authError) {
      log.warn('register_auth_error', { route: '/api/auth/register', email: emailClean, error: authError.message })
      return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }

    const userId = authData.user.id

    const { error: userError } = await supabase.from('users').upsert({
      id: userId,
      email: emailClean,
      full_name: name,
    }, { onConflict: 'email', ignoreDuplicates: false })
    if (userError) {
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
    }

    let slug = generateSlug(companyName)
    let { data: org, error: orgError } = await supabase.from('organizations').insert({
      name: sanitizeText(companyName, 255),
      slug,
      company_size: companySize || null,
      status: 'pending',
      is_active: false,
    }).select().single()

    if (orgError?.code === '23505') {
      slug = `${slug}-${Date.now().toString(36)}`
      const result = await supabase.from('organizations').insert({
        name: sanitizeText(companyName, 255),
        slug,
        company_size: companySize || null,
        status: 'pending',
        is_active: false,
      }).select().single()
      org = result.data
      orgError = result.error
    }

    if (orgError) {
      return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
    }

    const { error: membershipError } = await supabase.from('memberships').insert({
      user_id: userId,
      organization_id: org.id,
      role: 'client_admin',
    })
    if (membershipError) {
      return NextResponse.json({ error: 'Failed to create membership' }, { status: 500 })
    }

    const { error: agentError } = await supabase.from('ai_agents').insert({
      organization_id: org.id,
      name: `${companyName} Assistant`,
    })
    if (agentError) {
      return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 })
    }

    const { error: widgetError } = await supabase.from('widget_settings').insert({
      organization_id: org.id,
    })
    if (widgetError) {
      return NextResponse.json({ error: 'Failed to create widget settings' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user: authData.user,
      message: 'Registration successful. Your account is pending approval by our team.',
    })
  } catch (error) {
    Sentry.captureException(error, {
      tags: { route: '/api/auth/register' },
    })
    log.error('Registration error', { route: '/api/auth/register', error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
