'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuthContext } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Globe, Camera, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { ChannelConnection, ConversationChannel } from '@/types'

const channelConfig: { channel: ConversationChannel; label: string; icon: typeof MessageSquare; phase: string }[] = [
  { channel: 'web_chat', label: 'Web Chat Widget', icon: Globe, phase: 'Phase 1' },
  { channel: 'whatsapp', label: 'WhatsApp Business', icon: MessageCircle, phase: 'Phase 1' },
  { channel: 'instagram', label: 'Instagram', icon: Camera, phase: 'Phase 2' },
  { channel: 'facebook', label: 'Facebook Messenger', icon: MessageSquare, phase: 'Phase 2' },
]

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(path, options)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || data.error?.[0]?.message || 'Request failed')
  return data
}

export default function ChannelsPage() {
  const { membership } = useAuthContext()
  const [connections, setConnections] = useState<ChannelConnection[]>([])

  const loadConnections = useCallback(async () => {
    if (!membership) return
    try {
      const data = await apiFetch('/api/channels')
      setConnections(data)
    } catch (e: unknown) {
      toast.error('Failed to load channels')
    }
  }, [membership])

  useEffect(() => { loadConnections() }, [loadConnections])

  const toggleConnection = async (channel: ConversationChannel) => {
    if (!membership) return
    const existing = connections.find(c => c.channel === channel)
    if (existing) {
      toast.info(`${channel} integration details would go here`)
    } else {
      try {
        await apiFetch('/api/channels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel,
            name: channelConfig.find(c => c.channel === channel)?.label,
          }),
        })
        toast.success(`${channel} connected!`)
        await loadConnections()
      } catch {
        toast.error('Failed to connect')
      }
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Channel Integrations</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {channelConfig.map(ch => {
          const conn = connections.find(c => c.channel === ch.channel)
          const Icon = ch.icon
          return (
            <Card key={ch.channel}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-base">{ch.label}</CardTitle>
                    <p className="text-xs text-muted-foreground">{ch.phase}</p>
                  </div>
                </div>
                <Badge variant={conn?.is_connected ? 'default' : 'secondary'}>
                  {conn?.is_connected ? 'Connected' : 'Not Connected'}
                </Badge>
              </CardHeader>
              <CardContent>
                <Button
                  variant={conn?.is_connected ? 'outline' : 'default'}
                  className="w-full"
                  onClick={() => toggleConnection(ch.channel)}
                >
                  {conn?.is_connected ? 'Configure' : 'Connect'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
