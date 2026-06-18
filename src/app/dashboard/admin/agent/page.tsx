'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthContext } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import type { AIAgent } from '@/types'

export default function AgentConfigPage() {
  const { membership } = useAuthContext()
  const [agent, setAgent] = useState<AIAgent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!membership) return
    const fetch = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('ai_agents')
        .select('*').eq('organization_id', membership.organization_id).single()
      if (data) setAgent(data)
      setLoading(false)
    }
    fetch()
  }, [membership])

  const invalidateAgentCache = useCallback(async () => {
    try {
      await fetch('/api/cache/invalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern: 'agent_config' }),
      })
    } catch {}
  }, [])

  const update = async (key: string, value: unknown) => {
    if (!agent) return
    const supabase = createClient()
    const { error } = await supabase.from('ai_agents').update({ [key]: value }).eq('id', agent.id)
    if (error) toast.error('Failed to update')
    else {
      setAgent(prev => prev ? { ...prev, [key]: value } : prev)
      invalidateAgentCache()
    }
  }

  if (loading) return <div>Loading...</div>
  if (!agent) return <div>No agent found</div>

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold">AI Agent Configuration</h2>

      <Card>
        <CardHeader><CardTitle>Agent Identity</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Agent Name</Label>
            <Input value={agent.name} onChange={e => update('name', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Personality</Label>
              <Select value={agent.personality} onValueChange={v => update('personality', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tone of Voice</Label>
              <Select value={agent.tone_of_voice} onValueChange={v => update('tone_of_voice', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
            <Label>Brand Guidelines</Label>
            <Textarea
              value={agent.brand_guidelines || ''}
              onChange={e => update('brand_guidelines', e.target.value)}
              placeholder="e.g., We use inclusive language, avoid technical jargon..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Custom Instructions</Label>
            <Textarea
              value={agent.custom_instructions || ''}
              onChange={e => update('custom_instructions', e.target.value)}
              placeholder="e.g., Always offer a discount code before ending the conversation..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>AI Model Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Model</Label>
              <Select value={agent.model} onValueChange={v => update('model', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (Recommended)</SelectItem>
                  <SelectItem value="anthropic/claude-3-haiku">Claude 3 Haiku (Fast)</SelectItem>
                  <SelectItem value="openai/gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="google/gemini-pro">Gemini Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Temperature ({agent.temperature})</Label>
              <Input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={agent.temperature}
                onChange={e => update('temperature', parseFloat(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Features</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Lead Capture Mode</Label>
              <p className="text-sm text-muted-foreground">Automatically capture lead information from conversations</p>
            </div>
            <Switch checked={agent.lead_capture_enabled} onCheckedChange={v => update('lead_capture_enabled', v)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Sales Mode</Label>
              <p className="text-sm text-muted-foreground">Enable proactive sales conversations</p>
            </div>
            <Switch checked={agent.sales_mode_enabled} onCheckedChange={v => update('sales_mode_enabled', v)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Sentiment Analysis</Label>
              <p className="text-sm text-muted-foreground">Analyze customer sentiment in real-time</p>
            </div>
            <Switch checked={agent.sentiment_analysis_enabled} onCheckedChange={v => update('sentiment_analysis_enabled', v)} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
