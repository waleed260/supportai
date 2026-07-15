'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react'

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

function TypingIndicator() {
  return (
    <div className="flex gap-2 animate-fade-in">
      <div className="size-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
        <Bot className="h-3 w-3 text-muted-foreground" />
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-2.5">
        <div className="flex gap-1">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  )
}

export function ChatWidget({ organizationId, config }: ChatWidgetProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [customerName] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const primaryColor = config?.primary_color || '#2563eb'
  const title = config?.title || 'Chat with us'
  const welcomeMessage = config?.welcome_message || 'Hi! How can we help you today?'

  useEffect(() => {
    if (open && messages.length === 0) {
      const timer = setTimeout(() => {
        setMessages([{ role: 'assistant', content: welcomeMessage }])
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [open, messages.length, welcomeMessage])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages, loading])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

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
          customer_name: customerName,
        }),
      })

      const data = await res.json()
      // Simulate a small delay for natural feel
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }])
        setLoading(false)
      }, 500)
    } catch {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
        }])
        setLoading(false)
      }, 500)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {/* Chat Card */}
      {open && (
        <Card className="w-80 sm:w-96 shadow-2xl border-0 overflow-hidden animate-scale-in origin-bottom-right">
          {/* Header */}
          <CardHeader className="p-0">
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-white text-sm leading-tight">{title}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="size-1.5 rounded-full bg-green-300 animate-pulse-soft" />
                    <span className="text-[11px] text-white/70">Online</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-white/80 hover:text-white hover:bg-white/15 transition-all"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Messages */}
          <ScrollArea className="h-80 p-4" ref={scrollRef as any}>
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 items-end ${msg.role === 'customer' ? 'justify-end' : ''} animate-fade-in`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {msg.role === 'assistant' && (
                    <div className="size-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                      <Bot className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'customer'
                        ? 'text-white rounded-tr-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-foreground rounded-tl-sm'
                    }`}
                    style={msg.role === 'customer' ? { backgroundColor: primaryColor } : {}}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'customer' && (
                    <div className="size-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                      <User className="h-3 w-3 text-blue-600 dark:text-blue-300" />
                    </div>
                  )}
                </div>
              ))}
              {loading && <TypingIndicator />}
            </div>
          </ScrollArea>

          {/* Input */}
          <CardFooter className="p-3 pt-0">
            <div className="flex w-full gap-2">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="h-9 pr-3 bg-muted/30 border-0 focus-visible:ring-1 rounded-xl text-sm"
                  disabled={loading}
                />
              </div>
              <Button
                size="icon"
                className="size-9 shrink-0 rounded-xl shadow-sm"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                style={{ backgroundColor: primaryColor }}
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
          </CardFooter>

          {/* Branding */}
          {config?.show_branding !== false && (
            <div className="text-center pb-2">
              <div className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/60">
                <Sparkles className="h-2.5 w-2.5" />
                Powered by SupportAI
              </div>
            </div>
          )}
        </Card>
      )}

      {/* FAB Button */}
      <Button
        className={`rounded-full size-12 shadow-lg hover:shadow-xl transition-all duration-300 ${
          open ? 'rotate-0' : 'hover:scale-105'
        }`}
        style={{ backgroundColor: primaryColor }}
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <X className="h-5 w-5 text-white transition-transform duration-200" />
        ) : (
          <MessageSquare className="h-5 w-5 text-white transition-transform duration-200" />
        )}
      </Button>
    </div>
  )
}
