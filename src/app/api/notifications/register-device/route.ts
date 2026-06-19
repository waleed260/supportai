import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { log } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServiceRoleClient()
    const token = authHeader.slice(7)
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { expo_push_token, platform, organization_id } = body
    if (!expo_push_token || !platform || !organization_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { error: upsertError } = await supabase.from('device_tokens').upsert({
      user_id: user.id,
      organization_id,
      expo_push_token,
      platform,
      is_active: true,
    }, { onConflict: 'user_id,expo_push_token', ignoreDuplicates: false })

    if (upsertError) {
      log.error('Failed to register device token', { error: upsertError })
      return NextResponse.json({ error: 'Failed to register device' }, { status: 500 })
    }

    await supabase.from('notification_preferences').upsert({
      user_id: user.id,
      organization_id,
    }, { onConflict: 'user_id,organization_id', ignoreDuplicates: true })

    return NextResponse.json({ success: true })
  } catch (error) {
    log.error('Device registration error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
