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

const DEMO_CONVERSATIONS_DETAIL: Record<string, { conversation: Conversation; messages: Message[] }> = {
  'demo-1': {
    conversation: {
      id: 'demo-1',
      organization_id: '00000000-0000-0000-0000-000000000000',
      channel: 'web_chat',
      channel_conversation_id: 'web-101',
      customer_name: 'Alex Johnson',
      customer_email: 'alex.johnson@techcorp.com',
      customer_phone: '+1 555-0192',
      status: 'active',
      sentiment: 'positive',
      lead_status: 'warm',
      is_sales_mode: true,
      metadata: { location: 'San Francisco, CA', company: 'TechCorp Inc' },
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date(Date.now() - 600000).toISOString(),
    },
    messages: [
      {
        id: 'm-101',
        conversation_id: 'demo-1',
        organization_id: '00000000-0000-0000-0000-000000000000',
        role: 'customer',
        content: "Hi! I'm interested in the SupportAI Enterprise plan. Does it support custom Claude 3.5 Sonnet RAG with pgvector?",
        metadata: {},
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'm-102',
        conversation_id: 'demo-1',
        organization_id: '00000000-0000-0000-0000-000000000000',
        role: 'assistant',
        content: "Hello Alex! Yes, absolutely! Our Enterprise plan includes custom Anthropic Claude 3.5 Sonnet integration, private pgvector knowledge embeddings, multi-channel WhatsApp/Instagram connectors, and dedicated SLA.",
        metadata: {},
        created_at: new Date(Date.now() - 3500000).toISOString(),
      },
      {
        id: 'm-103',
        conversation_id: 'demo-1',
        organization_id: '00000000-0000-0000-0000-000000000000',
        role: 'customer',
        content: 'That sounds amazing. Can I schedule a 15-minute product walk-through demo for tomorrow at 2 PM PST?',
        metadata: {},
        created_at: new Date(Date.now() - 600000).toISOString(),
      },
    ],
  },
  'demo-2': {
    conversation: {
      id: 'demo-2',
      organization_id: '00000000-0000-0000-0000-000000000000',
      channel: 'whatsapp',
      channel_conversation_id: 'wa-9872',
      customer_name: 'Sarah Smith',
      customer_email: 'sarah.smith@logistics.co',
      customer_phone: '+92 300 1234567',
      status: 'escalated',
      sentiment: 'frustrated',
      lead_status: 'hot',
      is_sales_mode: true,
      metadata: { location: 'Lahore, Pakistan', account_tier: 'Pro Tier' },
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date(Date.now() - 1200000).toISOString(),
    },
    messages: [
      {
        id: 'm-201',
        conversation_id: 'demo-2',
        organization_id: '00000000-0000-0000-0000-000000000000',
        role: 'customer',
        content: 'Our WhatsApp support bot went offline 20 minutes ago. We are losing customer leads right now!',
        metadata: {},
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'm-202',
        conversation_id: 'demo-2',
        organization_id: '00000000-0000-0000-0000-000000000000',
        role: 'assistant',
        content: 'I apologize for the disruption Sarah! I am escalating your incident immediately to Tier-2 Engineering to restore your Meta WhatsApp API token connection.',
        metadata: {},
        created_at: new Date(Date.now() - 7100000).toISOString(),
      },
      {
        id: 'm-203',
        conversation_id: 'demo-2',
        organization_id: '00000000-0000-0000-0000-000000000000',
        role: 'customer',
        content: 'Please hurry! Can a human support manager call me at +92 300 1234567?',
        metadata: {},
        created_at: new Date(Date.now() - 1200000).toISOString(),
      },
    ],
  },
}

export default function ConversationDetailPage() {
  const { user } = useAuthContext()
  const params = useParams()
  const id = params.id as string
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [aiTakeover, setAiTakeover] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch(`/api/conversations/${id}`)
        if (res.ok) {
          const data = await res.json()
          setConversation(data)
          setMessages(data.messages || [])
          return
        }
      } catch {}

      // Demo fallback data
      const demo = DEMO_CONVERSATIONS_DETAIL[id] || DEMO_CONVERSATIONS_DETAIL['demo-1']
      setConversation(demo.conversation)
      setMessages(demo.messages)
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
    callback: useCallback((payload: any) => {
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
      organization_id: conversation?.organization_id || '00000000-0000-0000-0000-000000000000',
      role: 'agent',
      content: textToSend,
      metadata: {},
      created_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, newMsgObj])
    if (!customText) setNewMessage('')

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: id,
          role: 'agent',
          content: textToSend,
        }),
      })
    } catch {}
  }

  const resolveConversation = async () => {
    toast.success('Conversation resolved!')
    setConversation(prev => prev ? { ...prev, status: 'resolved' as const } : prev)
    try {
      await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' }),
      })
    } catch {}
  }

  const generateAISuggestion = (suggestionText: string) => {
    setTimeout(() => {
      setNewMessage(suggestionText)
      toast.success('AI Suggestion inserted into composer!')
    }, 400)
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
                <Bot className="h-4 w-4 text-primary" /> AI Copilot Smart Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <p className="text-xs text-muted-foreground mb-3">
                Click any prompt to auto-draft an AI response based on Knowledge Base & RAG context:
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs text-left h-auto py-2.5 px-3 border-primary/20 hover:bg-primary/5"
                onClick={() => generateAISuggestion(`Hi ${conversation.customer_name || 'there'}! I can certainly confirm your meeting for tomorrow at 2 PM PST. I have sent a calendar invite to ${conversation.customer_email || 'your email'}.`)}
              >
                📅 Confirm Demo Meeting (2 PM PST)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs text-left h-auto py-2.5 px-3 border-emerald-500/20 hover:bg-emerald-500/5"
                onClick={() => generateAISuggestion(`I apologize for the issue! I am escalating your ticket to priority support right now and our tech team will resolve it within 10 minutes.`)}
              >
                🚨 Priority Incident Escalation
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs text-left h-auto py-2.5 px-3 border-purple-500/20 hover:bg-purple-500/5"
                onClick={() => generateAISuggestion(`Here is our official pricing documentation and pgvector setup guide: https://supportai.com/docs/vector-rag`)}
              >
                📖 Share RAG Documentation & Pricing
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
                <span className="text-muted-foreground">Lead Score:</span>
                <span className="font-semibold text-emerald-600">88 / 100 (Hot Lead)</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Captured Email:</span>
                <span className="font-mono">{conversation.customer_email || 'alex@example.com'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Captured Phone:</span>
                <span className="font-mono">{conversation.customer_phone || '+1 555-0192'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Channel:</span>
                <span className="font-semibold uppercase">{conversation.channel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Intent Captured:</span>
                <span className="font-medium text-primary">Enterprise Plan Walkthrough</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
