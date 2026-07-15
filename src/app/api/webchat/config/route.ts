import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { webchatConfigSchema } from '@/lib/validation'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const organizationId = searchParams.get('organization_id')

  const parsed = webchatConfigSchema.safeParse({ organization_id: organizationId })
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const supabase = await createServiceRoleClient()

  const { data: widget } = await supabase.from('widget_settings')
    .select('*').eq('organization_id', parsed.data.organization_id).single()

  if (!widget) {
    return NextResponse.json({ error: 'Widget not configured' }, { status: 404 })
  }

  return NextResponse.json({
    title: widget.title,
    welcome_message: widget.welcome_message,
    primary_color: widget.primary_color,
    position: widget.position,
    show_branding: widget.show_branding,
  })
}
