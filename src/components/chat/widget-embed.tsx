'use client'

import { lazy, Suspense } from 'react'

const ChatWidget = lazy(() => import('./chat-widget').then(m => ({ default: m.ChatWidget })))

interface WidgetEmbedProps {
  organizationId: string
  config?: {
    title?: string
    welcome_message?: string
    primary_color?: string
    position?: string
    show_branding?: boolean
  }
}

export function WidgetEmbed({ organizationId, config }: WidgetEmbedProps) {
  return (
    <Suspense fallback={null}>
      <ChatWidget organizationId={organizationId} config={config} />
    </Suspense>
  )
}
