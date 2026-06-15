import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { email, password } = await request.json()
  const adminClient = createServiceRoleClient()

  const { data, error } = await (await adminClient).auth.signInWithPassword({ email, password })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }

  const response = NextResponse.json({ user: data.user })
  return response
}
