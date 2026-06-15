import { createServiceRoleClient } from '@/lib/supabase/server'
import { WidgetEmbed } from '@/components/chat/widget-embed'

export default async function WidgetPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  const supabase = await createServiceRoleClient()

  const { data: widget } = await supabase.from('widget_settings')
    .select('*').eq('organization_id', orgId).single()

  const config = widget ? {
    title: widget.title,
    welcome_message: widget.welcome_message,
    primary_color: widget.primary_color,
    position: widget.position,
    show_branding: widget.show_branding,
  } : undefined

  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`body { margin: 0; padding: 0; overflow: hidden; background: transparent; }`}</style>
      </head>
      <body>
        <WidgetEmbed organizationId={orgId} config={config} />
        <script dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('load', function() {
              var height = document.documentElement.scrollHeight
              parent.postMessage({ type: 'supportai-resize', height: height }, '*')
            })
          `
        }} />
      </body>
    </html>
  )
}
