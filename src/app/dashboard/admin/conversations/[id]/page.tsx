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
import { ArrowLeft, Send, User, Bot, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import type { Conversation, Message } from '@/types'

export default function ConversationDetailPage() {
  const { user } = useAuthContext()
  const params = useParams()
  const id = params.id as string
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    const init = async () => {
      const res = await fetch(`/api/conversations/${id}`)
      if (res.ok) {
        const data = await res.json()
        setConversation(data)
        setMessages(data.messages || [])
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
    callback: useCallback((payload: any) => {
      setMessages(prev => [...prev, payload.new as Message])
    }, []),
    deps: [id],
  })

  const sendReply = async () => {
    if (!newMessage.trim() || !user) return

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: id,
        role: 'agent',
        content: newMessage.trim(),
      }),
    })

    if (!res.ok) {
      toast.error('Failed to send')
    } else {
      setNewMessage('')
      const sent = await res.json()
      setMessages(prev => [...prev, sent])
    }
  }

  const resolveConversation = async () => {
    const res = await fetch(`/api/conversations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved' }),
    })
    if (res.ok) {
      toast.success('Conversation resolved')
      setConversation(prev => prev ? { ...prev, status: 'resolved' as const } : prev)
    }
  }

  if (!conversation) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading conversation...</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/admin/conversations">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{conversation.customer_name || 'Anonymous'}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{conversation.channel}</Badge>
            <Badge className={conversation.status === 'escalated' ? 'bg-red-100 text-red-800' : ''}>
              {conversation.status}
            </Badge>
            <span className={getSentimentColor(conversation.sentiment)}>{conversation.sentiment}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {conversation.status !== 'resolved' && (
            <Button variant="outline" size="sm" onClick={resolveConversation}>
              Resolve
            </Button>
          )}
        </div>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {messages.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No messages yet</p>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'customer' ? '' : 'flex-row-reverse'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                ${msg.role === 'customer' ? 'bg-blue-100 text-blue-700' :
                  msg.role === 'agent' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'}`}>
                {msg.role === 'customer' ? <User className="h-4 w-4" /> :
                 msg.role === 'agent' ? <User className="h-4 w-4" /> :
                 <Bot className="h-4 w-4" />}
              </div>
              <div className={`max-w-[70%] ${msg.role === 'customer' ? '' : 'text-right'}`}>
                <div className={`rounded-lg px-4 py-2 text-sm ${
                  msg.role === 'customer' ? 'bg-blue-50 text-blue-900' :
                  msg.role === 'agent' ? 'bg-green-50 text-green-900' :
                  'bg-gray-50 text-gray-900'
                }`}>
                  {msg.content}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{formatDate(msg.created_at)}</span>
                  {msg.sentiment && (
                    <span className={getSentimentColor(msg.sentiment)}>{msg.sentiment}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type your reply..."
          onKeyDown={e => e.key === 'Enter' && sendReply()}
          className="flex-1"
        />
        <Button onClick={sendReply} disabled={!newMessage.trim()}>
          <Send className="h-4 w-4 mr-2" />Send
        </Button>
      </div>
    </div>
  )
}
