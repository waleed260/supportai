import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generateSlug } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const { email, password, name, companyName, companySize } = await request.json()
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
    // Spec: new clients start as 'pending' until approved by super_admin
    let { data: org, error: orgError } = await supabase.from('organizations').insert({
      name: companyName,
      slug,
      company_size: companySize,
      status: 'pending',
      is_active: false,
    }).select().single()

    if (orgError?.code === '23505') {
      slug = `${slug}-${Date.now().toString(36)}`
      const result = await supabase.from('organizations').insert({
        name: companyName,
        slug,
        company_size: companySize,
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
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
