'use client'

import { useEffect, useState, useCallback, useRef, memo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthContext } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import type { AIAgent } from '@/types'
import {
  Bot, Sparkles, Brain, Sliders, Shield, ChevronRight,
  Loader2, MessageSquare, User, Settings2, Clock,
  Activity, TrendingUp, RotateCcw, Play,
} from 'lucide-react'

const sections = [
  { id: 'identity', label: 'Identity', icon: User, accent: 'from-primary/10 to-amber-500/5', gradient: 'bg-gradient-to-r from-primary to-amber-500' },
  { id: 'model', label: 'AI Model', icon: Brain, accent: 'from-violet-500/10 to-purple-500/5', gradient: 'bg-gradient-to-r from-violet-500 to-purple-500' },
  { id: 'features', label: 'Features', icon: Sparkles, accent: 'from-emerald-500/10 to-teal-500/5', gradient: 'bg-gradient-to-r from-emerald-500 to-teal-500' },
  { id: 'advanced', label: 'Advanced', icon: Sliders, accent: 'from-sky-500/10 to-blue-500/5', gradient: 'bg-gradient-to-r from-sky-500 to-blue-500' },
]

const metrics = [
  { icon: Bot, label: 'Handled by AI', value: '2,847', change: '+12%', positive: true },
  { icon: Clock, label: 'Avg Response', value: '1.2s', change: '-8%', positive: true },
  { icon: Activity, label: 'Active Chats', value: '18', change: '+3', positive: false },
  { icon: TrendingUp, label: 'Escalation Rate', value: '5.3%', change: '-2.1%', positive: true },
]

function AgentSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-10 w-10 rounded-sm bg-muted" />
        <div className="space-y-2">
          <div className="h-5 w-32 rounded-sm bg-muted" />
          <div className="h-3 w-48 rounded-sm bg-muted/60" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-sm border border-border p-4 space-y-2">
            <div className="h-3 w-16 rounded-sm bg-muted/60" />
            <div className="h-6 w-12 rounded-sm bg-muted" />
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {[1].map(i => (
            <div key={i} className="rounded-sm border border-border p-6 space-y-4">
              <div className="h-4 w-24 rounded-sm bg-muted" />
              {[1, 2, 3].map(j => (
                <div key={j} className="space-y-2">
                  <div className="h-3 w-16 rounded-sm bg-muted/60" />
                  <div className="h-10 rounded-sm bg-muted" />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="rounded-sm border border-border p-6 space-y-4 h-fit">
          <div className="h-4 w-20 rounded-sm bg-muted" />
          <div className="h-40 rounded-sm bg-muted" />
        </div>
      </div>
    </div>
  )
}

const ChatPreview = memo(function ChatPreview({ agent }: { agent: AIAgent | null }) {
  return (
    <div className="rounded-sm border border-border bg-card/50 backdrop-blur-sm overflow-hidden sticky top-6">
      <div className="h-10 bg-foreground dark:bg-black flex items-center px-4 gap-2">
        <div className="w-6 h-6 rounded-sm bg-primary flex items-center justify-center">
          <Bot className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="text-sm font-medium text-background dark:text-foreground flex-1 truncate">{agent?.name || 'AI Agent'}</span>
        <div className="w-2 h-2 rounded-full bg-success animate-pulse shrink-0" />
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-sm bg-muted flex items-center justify-center shrink-0 mt-0.5">
            <User className="h-3 w-3 text-muted-foreground" />
          </div>
          <div className="rounded-sm bg-muted p-2.5 text-xs text-muted-foreground">
            I need help with my order #12345
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-sm bg-primary flex items-center justify-center shrink-0 mt-0.5">
            <Bot className="h-3 w-3 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <div className="rounded-sm bg-primary/10 border border-primary/20 p-2.5 text-xs">
              <p className="font-medium text-primary mb-1 truncate">{agent?.name || 'SupportAI'} — {agent?.personality || 'Professional'}</p>
              <p className="text-muted-foreground">
                I&apos;d be happy to help with order #12345! Let me look that up right away.
              </p>
            </div>
          </div>
        </div>
        <div className="h-8 rounded-sm border border-border bg-background flex items-center px-3 gap-2">
          <div className="h-2 w-2 rounded-full bg-border" />
          <span className="text-xs text-muted-foreground/60">Type a message...</span>
        </div>
      </div>
      <div className="border-t border-border divide-y divide-border text-xs">
        <div className="px-4 py-2 flex items-center gap-2">
          <Brain className="h-3 w-3 text-muted-foreground/40" />
          <span className="text-muted-foreground">{agent?.model?.split('/').pop() || 'claude-3.5-sonnet'}</span>
          <span className="ml-auto text-muted-foreground/40">t={agent?.temperature || 0.7}</span>
        </div>
        <div className="px-4 py-2 flex items-center gap-3">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${agent?.lead_capture_enabled ? 'bg-success' : 'bg-muted-foreground/30'}`} />
          <span className="text-muted-foreground">Leads {agent?.lead_capture_enabled ? 'on' : 'off'}</span>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${agent?.sentiment_analysis_enabled ? 'bg-success' : 'bg-muted-foreground/30'}`} />
          <span className="text-muted-foreground">Sentiment {agent?.sentiment_analysis_enabled ? 'on' : 'off'}</span>
        </div>
      </div>
    </div>
  )
})

export default function AgentConfigPage() {
  const { membership } = useAuthContext()
  const [agent, setAgent] = useState<AIAgent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState('identity')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const supabaseRef = useRef(createClient())
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    if (!membership) return
    const fetch = async () => {
      const { data } = await supabaseRef.current.from('ai_agents')
        .select('*').eq('organization_id', membership.organization_id).single()
      if (data) {
        setAgent(data)
        setLastSaved(new Date(data.updated_at || Date.now()))
      }
      setLoading(false)
    }
    fetch()
  }, [membership])

  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(clearTimeout)
    }
  }, [])

  const invalidateAgentCache = useCallback(async () => {
    try {
      await fetch('/api/cache/invalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern: 'agent_config' }),
      })
    } catch {}
  }, [])

  const logAudit = useCallback(async (key: string, value: unknown) => {
    try {
      await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'config_change',
          resourceType: 'ai_agent',
          resourceId: agent?.id,
          details: { key, value, previous: agent?.[key as keyof typeof agent] },
        }),
      })
    } catch {}
  }, [agent])

  const update = async (key: string, value: unknown) => {
    if (!agent) return
    const agentId = agent.id

    if (debounceTimers.current[key]) {
      clearTimeout(debounceTimers.current[key])
    }

    setAgent(prev => prev ? { ...prev, [key]: value } : prev)

    debounceTimers.current[key] = setTimeout(async () => {
      setSaving(key)
      const { error } = await supabaseRef.current.from('ai_agents').update({ [key]: value }).eq('id', agentId)
      if (error) {
        toast.error('Failed to update')
      } else {
        setLastSaved(new Date())
        invalidateAgentCache()
        logAudit(key, value)
      }
      setSaving(null)
    }, 500)
  }

  const handleSectionChange = (id: string) => {
    setActiveSection(id)
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="p-6">
        <AgentSkeleton />
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-sm bg-muted flex items-center justify-center mx-auto mb-4">
            <Bot className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">No AI Agent Found</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Your organization hasn&apos;t set up an AI agent yet. Contact your administrator to get started.
          </p>
          <Button disabled className="gap-2 rounded-sm">
            <Bot className="h-4 w-4" /> Create Agent
          </Button>
        </div>
      </div>
    )
  }

  const IdentitySection = (
    <div className="space-y-5" key="identity">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Agent Name</Label>
        <Input
          value={agent.name}
          onChange={e => update('name', e.target.value)}
          className="h-11"
          placeholder="SupportAI Assistant"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Personality</Label>
          <Select value={agent.personality} onValueChange={v => update('personality', v)}>
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tone of Voice</Label>
          <Select value={agent.tone_of_voice} onValueChange={v => update('tone_of_voice', v)}>
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="warm">Warm</SelectItem>
              <SelectItem value="playful">Playful</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Brand Guidelines</Label>
        <Textarea
          value={agent.brand_guidelines || ''}
          onChange={e => update('brand_guidelines', e.target.value)}
          placeholder="e.g., We use inclusive language, avoid technical jargon..."
          rows={3}
          className="resize-none"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Custom Instructions</Label>
        <Textarea
          value={agent.custom_instructions || ''}
          onChange={e => update('custom_instructions', e.target.value)}
          placeholder="e.g., Always offer a discount code before ending the conversation..."
          rows={4}
          className="resize-none"
        />
      </div>
    </div>
  )

  const ModelSection = (
    <div className="space-y-5" key="model">
      <div className="space-y-2">
        <Label className="text-sm font-medium">AI Model</Label>
        <Select value={agent.model} onValueChange={v => update('model', v)}>
          <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (Recommended)</SelectItem>
            <SelectItem value="anthropic/claude-3-haiku">Claude 3 Haiku (Fast)</SelectItem>
            <SelectItem value="openai/gpt-4o">GPT-4o</SelectItem>
            <SelectItem value="google/gemini-pro">Gemini Pro</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">Claude 3.5 Sonnet offers the best balance of speed and accuracy for customer support.</p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Temperature</Label>
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">{agent.temperature}</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={agent.temperature}
          onChange={e => update('temperature', parseFloat(e.target.value))}
          className="w-full h-2 rounded-sm appearance-none cursor-pointer bg-muted accent-primary
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background
            [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-sm
            [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Precise</span>
          <span>Creative</span>
        </div>
      </div>
    </div>
  )

  const FeaturesSection = (
    <div className="space-y-5" key="features">
      {[
        { key: 'lead_capture_enabled', label: 'Lead Capture Mode', desc: 'Automatically capture lead information from conversations', color: 'text-emerald-500', dot: 'bg-emerald-500' },
        { key: 'sales_mode_enabled', label: 'Sales Mode', desc: 'Enable proactive sales conversations', color: 'text-amber-500', dot: 'bg-amber-500' },
        { key: 'sentiment_analysis_enabled', label: 'Sentiment Analysis', desc: 'Analyze customer sentiment in real-time', color: 'text-violet-500', dot: 'bg-violet-500' },
      ].map(({ key, label, desc, color, dot }) => {
        const isOn = agent[key as keyof typeof agent] as boolean
        return (
          <div
            key={key}
            onClick={() => update(key, !isOn)}
            className="flex items-center justify-between p-4 rounded-sm border border-border bg-card/40 hover:bg-card/60 hover:border-primary/20 transition-all cursor-pointer group"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${dot} ${isOn ? 'opacity-100 shadow-sm shadow-current' : 'opacity-30'}`} />
                <Label className="text-sm font-medium cursor-pointer">{label}</Label>
              </div>
              <p className="text-xs text-muted-foreground pl-[18px]">{desc}</p>
            </div>
            <Switch checked={isOn} onCheckedChange={v => update(key, v)} onClick={e => e.stopPropagation()} />
          </div>
        )
      })}
    </div>
  )

  const AdvancedSection = (
    <div className="space-y-5" key="advanced">
      <div className="rounded-sm border border-border bg-card/40 p-5 hover:bg-card/60 transition-colors">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-sm bg-sky-500/10 flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4 text-sky-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-foreground mb-1">Confidence Threshold</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Below this confidence, the conversation escalates to a human agent.
            </p>
            <Select defaultValue="0.7">
              <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0.9">High (0.9)</SelectItem>
                <SelectItem value="0.7">Balanced (0.7)</SelectItem>
                <SelectItem value="0.5">Low (0.5)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-border bg-card/40 p-5 hover:bg-card/60 transition-colors">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-sm bg-sky-500/10 flex items-center justify-center shrink-0">
            <MessageSquare className="h-4 w-4 text-sky-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-foreground mb-1">Max Conversation Turns</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Limit AI responses per conversation before requiring human review.
            </p>
            <Select defaultValue="20">
              <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 turns</SelectItem>
                <SelectItem value="20">20 turns</SelectItem>
                <SelectItem value="50">50 turns</SelectItem>
                <SelectItem value="unlimited">Unlimited</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-border bg-card/40 p-5 hover:bg-card/60 transition-colors">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-sm bg-sky-500/10 flex items-center justify-center shrink-0">
            <Settings2 className="h-4 w-4 text-sky-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-foreground mb-1">Response Language</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Default language. The AI can detect &amp; respond in the customer&apos;s language.
            </p>
            <Select defaultValue="auto">
              <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-detect</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )

  const sectionContent: Record<string, React.ReactNode> = {
    identity: IdentitySection,
    model: ModelSection,
    features: FeaturesSection,
    advanced: AdvancedSection,
  }

  const currentSection = sections.find(s => s.id === activeSection)

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-syne)' }}>
                AI Agent
              </h1>
              <p className="text-xs text-muted-foreground">Configure your AI agent&apos;s behavior and capabilities</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-sm">
              {saving ? (
                <><Loader2 className="h-3 w-3 animate-spin text-primary" /> Saving...</>
              ) : lastSaved ? (
                <><span className="w-1.5 h-1.5 rounded-full bg-success" /> Saved</>
              ) : null}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-border bg-card/50">
              <div className={`w-1.5 h-1.5 rounded-full ${agent.name ? 'bg-success animate-pulse' : 'bg-muted'}`} />
              <span className="text-xs text-muted-foreground">{agent.name ? 'Active' : 'Inactive'}</span>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 rounded-sm text-xs" disabled>
              <Play className="h-3.5 w-3.5" /> Test
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map(m => {
            const Icon = m.icon
            return (
              <div key={m.label} className="rounded-sm border border-border bg-card/40 p-4 hover:bg-card/60 transition-colors h-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                  <Icon className="h-3.5 w-3.5 text-muted-foreground/40" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-foreground tabular-nums">{m.value}</span>
                  <span className={`text-xs font-medium ${m.positive ? 'text-success' : 'text-destructive'}`}>{m.change}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <nav className="space-y-1 sticky top-6">
              {sections.map(s => {
                const Icon = s.icon
                const isActive = activeSection === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSectionChange(s.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm font-medium transition-all text-left relative
                      ${isActive
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                  >
                    {isActive && (
                      <span className={`absolute inset-0 rounded-sm opacity-10 ${s.gradient}`} />
                    )}
                    {isActive && (
                      <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full ${s.gradient}`} />
                    )}
                    <Icon className="h-4 w-4 shrink-0 relative" />
                    <span className="relative">{s.label}</span>
                    <ChevronRight className={`h-3.5 w-3.5 ml-auto relative transition-transform ${isActive ? 'text-primary translate-x-0.5' : 'text-muted-foreground/30'}`} />
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-sm border border-border bg-card/50 backdrop-blur-sm">
              <div className={`h-1 rounded-t-sm ${currentSection?.gradient}`} />
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    {currentSection && <currentSection.icon className="h-4 w-4 text-primary" />}
                    <h2 className="text-base font-semibold text-foreground">{currentSection?.label}</h2>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground h-7 rounded-sm" onClick={() => toast.info('Settings reset to defaults')}>
                    <RotateCcw className="h-3 w-3" /> Reset
                  </Button>
                </div>
                <div ref={contentRef} className="animate-fade-in" key={activeSection}>
                  {sectionContent[activeSection]}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <ChatPreview agent={agent} />
          </div>
        </div>
      </div>
    </div>
  )
}
