'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageSquare, X, Send, Bot, User, UserRound } from 'lucide-react'

interface ChatWidgetProps {
  organizationId: string
  config?: {
    title?: string
    welcome_message?: string
    primary_color?: string
    position?: string
    show_branding?: boolean
  }
}

interface ChatMessage {
  role: 'customer' | 'assistant'
  content: string
}

export function ChatWidget({ organizationId, config }: ChatWidgetProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const conversationIdRef = useRef<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const primaryColor = config?.primary_color || '#2563eb'
  const title = config?.title || 'Chat with us'
  const welcomeMessage = config?.welcome_message || 'Hi! How can we help you today?'

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', content: welcomeMessage }])
    }
  }, [open, messages.length, welcomeMessage])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'customer', content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch('/api/webchat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: organizationId,
          message: userMessage,
          customer_name: customerName || undefined,
          conversation_id: conversationIdRef.current || undefined,
        }),
      })

      const data = await res.json()
      if (data.conversation_id) {
        conversationIdRef.current = data.conversation_id
      }
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <Card className="w-80 sm:w-96 shadow-xl border-0">
          <CardHeader className="p-3 flex flex-row items-center justify-between" style={{ backgroundColor: primaryColor }}>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-white" />
              <span className="font-semibold text-white text-sm">{title}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          {!customerName ? (
            <div className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <UserRound className="h-10 w-10 mx-auto text-gray-400" />
                <p className="text-sm text-gray-600">Hi there! What's your name?</p>
              </div>
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && input.trim() && setCustomerName(input.trim())}
                  placeholder="Enter your name..."
                  className="flex-1"
                />
                <Button size="icon" onClick={() => input.trim() && setCustomerName(input.trim())}
                  style={{ backgroundColor: primaryColor }}>
                  <Send className="h-4 w-4 text-white" />
                </Button>
              </div>
              {config?.show_branding !== false && (
                <div className="text-center text-[10px] text-gray-400">
                  Powered by SupportAI
                </div>
              )}
            </div>
          ) : (
            <>
              <ScrollArea className="h-80 p-3" ref={scrollRef as any}>
                <div className="space-y-3">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-2 ${msg.role === 'customer' ? 'justify-end' : ''}`}>
                      {msg.role === 'assistant' && (
                        <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                          <Bot className="h-3 w-3" />
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === 'customer'
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`} style={msg.role === 'customer' ? { backgroundColor: primaryColor } : {}}>
                        {msg.content}
                      </div>
                      {msg.role === 'customer' && (
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <User className="h-3 w-3 text-blue-600" />
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-2">
                      <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <Bot className="h-3 w-3" />
                      </div>
                      <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-muted-foreground">
                        <span className="animate-pulse">Thinking</span>...
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <CardFooter className="p-3 pt-0">
                <div className="flex w-full gap-2">
                  <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1"
                    disabled={loading}
                  />
                  <Button size="icon" onClick={sendMessage} disabled={loading || !input.trim()}
                    style={{ backgroundColor: primaryColor }}>
                    <Send className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </CardFooter>
              {config?.show_branding !== false && (
                <div className="text-center text-[10px] text-gray-400 pb-1">
                  Powered by SupportAI
                </div>
              )}
            </>
          )}
        </Card>
      )}

      <Button
        className="rounded-full h-12 w-12 shadow-lg hover:shadow-xl"
        style={{ backgroundColor: primaryColor }}
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5 text-white" /> : <MessageSquare className="h-5 w-5 text-white" />}
      </Button>
    </div>
  )
}
