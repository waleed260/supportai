'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
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

export default function ChannelsPage() {
  const [connections, setConnections] = useState<ChannelConnection[]>([])
  const [orgId, setOrgId] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: membership } = await supabase.from('memberships')
        .select('organization_id').eq('user_id', session.user.id).limit(1).single()
      if (!membership) return
      setOrgId(membership.organization_id)

      const { data } = await supabase.from('channel_connections')
        .select('*').eq('organization_id', membership.organization_id)
      if (data) setConnections(data)
    }
    init()
  }, [])

  const toggleConnection = async (channel: ConversationChannel) => {
    if (!orgId) return
    const supabase = createClient()
    const existing = connections.find(c => c.channel === channel)
    if (existing) {
      toast.info(`${channel} integration details would go here`)
    } else {
      const { error } = await supabase.from('channel_connections').insert({
        organization_id: orgId,
        channel,
        name: channelConfig.find(c => c.channel === channel)?.label,
        is_connected: true,
      })
      if (error) toast.error('Failed to connect')
      else {
        toast.success(`${channel} connected!`)
        const { data } = await supabase.from('channel_connections')
          .select('*').eq('organization_id', orgId)
        if (data) setConnections(data)
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
