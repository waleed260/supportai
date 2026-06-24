'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuthContext } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { MessageSquare, Globe, Camera, MessageCircle, Copy, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChannelConnectDialog } from '@/components/channels/channel-connect-dialog'
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const [connections, setConnections] = useState<ChannelConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [connectChannel, setConnectChannel] = useState<ConversationChannel | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    const oauthSuccess = searchParams.get('oauth_success')
    const oauthError = searchParams.get('oauth_error')
    if (oauthSuccess) {
      toast.success(`${oauthSuccess} connected via Facebook!`)
      router.replace('/dashboard/admin/channels')
    }
    if (oauthError) {
      toast.error(decodeURIComponent(oauthError))
      router.replace('/dashboard/admin/channels')
    }
  }, [searchParams, router])

  const loadConnections = useCallback(async () => {
    if (!membership) return
    try {
      const data = await apiFetch('/api/channels')
      setConnections(data)
    } catch {
      toast.error('Failed to load channels')
    } finally {
      setLoading(false)
    }
  }, [membership])

  useEffect(() => { loadConnections() }, [loadConnections])

  const handleConnect = (channel: ConversationChannel) => {
    if (channel === 'web_chat') {
      connectWebChat()
    } else {
      setConnectChannel(channel)
    }
  }

  const connectWebChat = async () => {
    if (!membership) return
    const existing = connections.find(c => c.channel === 'web_chat')
    if (existing) {
      toast.info('Web Chat is already connected')
      return
    }
    try {
      await apiFetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: 'web_chat', name: 'Web Chat Widget' }),
      })
      toast.success('Web Chat connected!')
      await loadConnections()
    } catch {
      toast.error('Failed to connect Web Chat')
    }
  }

  const disconnect = async (channel: ConversationChannel) => {
    if (!confirm(`Disconnect ${channelConfig.find(c => c.channel === channel)?.label}?`)) return
    try {
      await fetch(`/api/channels?channel=${channel}`, { method: 'DELETE' })
      toast.success('Channel disconnected')
      await loadConnections()
    } catch {
      toast.error('Failed to disconnect')
    }
  }

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const widgetEmbedUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/widget/${membership?.organization_id}`
    : ''

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-sm border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading channels...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Channel Integrations</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {channelConfig.map(ch => {
          const conn = connections.find(c => c.channel === ch.channel)
          const Icon = ch.icon
          const isWebChat = ch.channel === 'web_chat'
          return (
            <Card key={ch.channel} className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="h-8 w-8 text-muted-foreground" />
    <div className="p-6">
                    <CardTitle className="text-base">{ch.label}</CardTitle>
                    <p className="text-xs text-muted-foreground">{ch.phase}</p>
                  </div>
                </div>
                <Badge variant={conn?.is_connected ? 'default' : 'secondary'}>
                  {conn?.is_connected ? 'Connected' : 'Not Connected'}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {conn?.is_connected && conn.webhook_url && !isWebChat && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Webhook URL</Label>
                    <div className="flex gap-1.5">
                      <Input
                        value={conn.webhook_url}
                        readOnly
                        className="font-mono text-xs h-8"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => handleCopy(conn.webhook_url!, conn.id)}
                      >
                        {copiedId === conn.id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                )}
                {isWebChat && conn?.is_connected && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Widget Embed URL</Label>
                    <div className="flex gap-1.5">
                      <Input value={widgetEmbedUrl} readOnly className="font-mono text-xs h-8" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => handleCopy(widgetEmbedUrl, `${conn.id}-widget`)}
                      >
                        {copiedId === `${conn.id}-widget` ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  {conn?.is_connected ? (
                    <>
                      <Button variant="outline" className="flex-1" onClick={() => handleConnect(ch.channel)}>
                        Configure
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => disconnect(ch.channel)}>
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button className="w-full" onClick={() => handleConnect(ch.channel)}>
                      Connect
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <ChannelConnectDialog
        channel={connectChannel!}
        open={connectChannel !== null}
        onOpenChange={(o) => { if (!o) setConnectChannel(null) }}
        onConnected={loadConnections}
        orgId={membership?.organization_id}
        userId={membership?.user_id}
      />
    </div>
  )
}
