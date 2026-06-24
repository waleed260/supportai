'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { Puzzle, Database, Sheet, BarChart3 } from 'lucide-react'

const PROVIDERS = [
  { id: 'hubspot' as const, name: 'HubSpot', icon: Puzzle, description: 'Sync leads and contacts to HubSpot CRM' },
  { id: 'salesforce' as const, name: 'Salesforce', icon: BarChart3, description: 'Push leads to Salesforce' },
  { id: 'zoho' as const, name: 'Zoho CRM', icon: Database, description: 'Sync leads to Zoho CRM' },
  { id: 'google_sheets' as const, name: 'Google Sheets', icon: Sheet, description: 'Log leads to a Google Sheet' },
]

type Integration = {
  id: string
  provider: string
  is_enabled: boolean
  credentials: Record<string, any>
  settings: Record<string, any>
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchIntegrations = async () => {
      const res = await fetch('/api/integrations')
      if (res.ok) setIntegrations(await res.json())
      setLoading(false)
    }
    fetchIntegrations()
  }, [])

  const getIntegration = (provider: string) => integrations.find(i => i.provider === provider)

  const toggleIntegration = async (provider: string, enabled: boolean) => {
    const res = await fetch('/api/integrations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, is_enabled: enabled }),
    })
    if (!res.ok) {
      const err = await res.json()
      toast.error(err.error || 'Failed to update')
    } else {
      setIntegrations(prev => {
        const exists = prev.find(i => i.provider === provider)
        if (exists) return prev.map(i => i.provider === provider ? { ...i, is_enabled: enabled } : i)
        return [...prev, { id: '', provider, is_enabled: enabled, credentials: {}, settings: {} }]
      })
      toast.success(`${provider} ${enabled ? 'enabled' : 'disabled'}`)
    }
  }

  if (loading) return (
    <div className="p-6 flex items-center justify-center min-h-[40vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-sm border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Loading integrations...</p>
      </div>
    </div>
  )

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Integrations</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {PROVIDERS.map(p => {
          const integration = getIntegration(p.id)
          const Icon = p.icon
          return (
            <Card key={p.id} className={`h-full ${selected === p.id ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6 text-muted-foreground" />
    <div className="p-6">
                      <CardTitle className="text-lg">{p.name}</CardTitle>
                      <CardDescription>{p.description}</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={integration?.is_enabled || false}
                    onCheckedChange={(v) => toggleIntegration(p.id, v)}
                  />
                </div>
              </CardHeader>
              {integration?.is_enabled && (
                <CardContent>
                  <Badge variant="outline" className="text-xs">Connected</Badge>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
