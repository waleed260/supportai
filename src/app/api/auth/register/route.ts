import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generateSlug } from '@/lib/utils'
import { registerSchema, sanitizeText } from '@/lib/validation'
import { limiters } from '@/lib/rate-limit'
import { log } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

    const { success: allowed, remaining, reset } = await limiters.auth(`auth:register:${ip}`)
    if (!allowed) {
      return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded. Please slow down.' }), {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)) },
      })
    }

    const body = await request.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    const { email, password, name, companyName, companySize } = parsed.data
    const supabase = await createServiceRoleClient()

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }

    const userId = authData.user.id

    const { error: userError } = await supabase.from('users').upsert({
      id: userId,
      email,
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
