'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useAuthContext } from '@/contexts/auth-context'
import { useRealtimeSubscription } from '@/hooks/use-realtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatDate, getSentimentColor } from '@/lib/utils'
import { toast } from 'sonner'
import { ArrowLeft, Send, User, Bot } from 'lucide-react'
import Link from 'next/link'
import type { Conversation, Message } from '@/types'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export default function ConversationDetailPage() {
  const { user } = useAuthContext()
  const params = useParams()
  const id = params.id as string
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [aiTakeover, setAiTakeover] = useState(false)
  const [suggesting, setSuggesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = async () => {
      setError(null)
      try {
        const res = await fetch(`/api/conversations/${id}`)
        if (res.ok) {
          const data = await res.json()
          setConversation(data)
          setMessages(data.messages || [])
          return
        }
        const json = await res.json().catch(() => null)
        setError(json?.error || 'Failed to load conversation')
      } catch {
        setError('Failed to load conversation')
      }
    }
    init()
  }, [id, user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useRealtimeSubscription({
    table: 'messages',
    filter: `conversation_id=eq.${id}`,
    event: 'INSERT',
    callback: useCallback((payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      setMessages(prev => [...prev, payload.new as Message])
    }, []),
    deps: [id],
  })

  const sendReply = async (customText?: string) => {
    const textToSend = (customText || newMessage).trim()
    if (!textToSend) return

    const newMsgObj: Message = {
      id: `msg-${Date.now()}`,
      conversation_id: id,
      organization_id: conversation?.organization_id || '',
      role: 'agent',
      content: textToSend,
      metadata: {},
      created_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, newMsgObj])
    if (!customText) setNewMessage('')

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: id,
          role: 'agent',
          content: textToSend,
        }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        toast.error(json?.error || 'Failed to send message')
      }
    } catch {
      toast.error('Failed to send message')
    }
  }

  const resolveConversation = async () => {
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' }),
      })
      if (res.ok) {
        toast.success('Conversation resolved!')
        setConversation(prev => prev ? { ...prev, status: 'resolved' as const } : prev)
      } else {
        toast.error('Failed to resolve conversation')
      }
    } catch {
      toast.error('Failed to resolve conversation')
    }
  }

  const generateAISuggestion = async () => {
    setSuggesting(true)
    try {
      const res = await fetch(`/api/conversations/${id}/suggest`, { method: 'POST' })
      const json = await res.json()
      if (res.ok && json.suggestion) {
        setNewMessage(json.suggestion)
        toast.success('AI suggestion inserted into composer!')
      } else {
        toast.error(json?.error || 'Failed to generate suggestion')
      }
    } catch {
      toast.error('Failed to generate suggestion')
    } finally {
      setSuggesting(false)
    }
  }

  if (error) {
    return <div className="flex items-center justify-center h-64 text-destructive">{error}</div>
  }

  if (!conversation) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading conversation...</div>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-card border shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin/conversations">
            <Button variant="ghost" size="icon" className="rounded-lg"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{conversation.customer_name || 'Anonymous Customer'}</h2>
              <Badge variant="outline" className="capitalize">{conversation.channel}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {conversation.customer_email || 'No email provided'} • {conversation.customer_phone || 'No phone provided'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium">
            <span>AI Autonomous Agent:</span>
            <Badge variant={aiTakeover ? "destructive" : "secondary"}>
              {aiTakeover ? "Human Intercepted" : "Active & Responding"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={() => setAiTakeover(!aiTakeover)}
            >
              {aiTakeover ? "Resume AI" : "Intercept"}
            </Button>
          </div>
          {conversation.status !== 'resolved' && (
            <Button variant="default" size="sm" onClick={resolveConversation}>
              Mark Resolved
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Chat Workspace */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border shadow-sm overflow-hidden flex flex-col h-[560px]">
            <CardHeader className="py-3 px-4 bg-muted/30 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Message History
              </CardTitle>
              <Badge variant="outline" className={getSentimentColor(conversation.sentiment)}>
                Sentiment: {conversation.sentiment || 'Neutral'}
              </Badge>
            </CardHeader>

            <CardContent className="p-4 space-y-4 flex-1 overflow-y-auto bg-gray-50/50 dark:bg-background">
              {messages.length === 0 && (
                <p className="text-center text-muted-foreground py-12">No messages in this thread yet.</p>
              )}
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'customer' ? '' : 'flex-row-reverse'}`}>
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                    msg.role === 'customer' ? 'bg-blue-600 text-white' :
                    msg.role === 'agent' ? 'bg-emerald-600 text-white' :
                    'bg-purple-600 text-white'
                  }`}>
                    {msg.role === 'customer' ? <User className="h-4 w-4" /> :
                     msg.role === 'agent' ? <User className="h-4 w-4" /> :
                     <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`max-w-[75%] ${msg.role === 'customer' ? '' : 'text-right'}`}>
                    <div className="text-[10px] text-muted-foreground mb-1 capitalize font-medium">
                      {msg.role === 'customer' ? conversation.customer_name : msg.role === 'agent' ? 'Support Agent' : 'Claude AI Agent'}
                    </div>
                    <div className={`rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                      msg.role === 'customer' ? 'bg-card text-card-foreground border' :
                      msg.role === 'agent' ? 'bg-emerald-600 text-white' :
                      'bg-primary text-primary-foreground'
                    }`}>
                      {msg.content}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                      <span>{formatDate(msg.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </CardContent>

            {/* Composer */}
            <div className="p-3 border-t bg-card space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type human reply or select AI suggestion..."
                  onKeyDown={e => e.key === 'Enter' && sendReply()}
                  className="flex-1"
                />
                <Button onClick={() => sendReply()} disabled={!newMessage.trim()} className="gap-1.5">
                  <Send className="h-4 w-4" /> Send
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Copilot & CRM Insights Sidebar */}
        <div className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-muted/20">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" /> AI Copilot
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <p className="text-xs text-muted-foreground mb-3">
                Generate an AI draft reply to the customer&apos;s latest message using your knowledge base and agent config:
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs text-left h-auto py-2.5 px-3 border-primary/20 hover:bg-primary/5"
                onClick={generateAISuggestion}
                disabled={suggesting}
              >
                {suggesting ? 'Generating...' : '✨ Generate AI Draft Reply'}
              </Button>
            </CardContent>
          </Card>

          {/* Customer CRM Metadata */}
          <Card className="border shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-muted/20">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Lead CRM Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Lead Status:</span>
                <span className="font-medium">{conversation.lead_status || 'Not set'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Captured Email:</span>
                <span className="font-mono">{conversation.customer_email || '—'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Captured Phone:</span>
                <span className="font-mono">{conversation.customer_phone || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Channel:</span>
                <span className="font-semibold uppercase">{conversation.channel}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
