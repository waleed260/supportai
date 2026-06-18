'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthContext } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Users, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react'

type UsageInfo = {
  allowed: boolean
  used: number
  limit: number
  planName: string | null
}

export default function AdminOverview() {
  const { membership } = useAuthContext()
  const [stats, setStats] = useState({ convos: 0, active: 0, escalated: 0, leads: 0 })
  const [usage, setUsage] = useState<UsageInfo | null>(null)

  useEffect(() => {
    if (!membership) return
    const load = async () => {
      const supabase = createClient()
      const orgId = membership.organization_id

      const [convos, active, escalated, leads, usageRes] = await Promise.all([
        supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
        supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'active'),
        supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'escalated'),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
        fetch('/api/billing/usage'),
      ])
      setStats({
        convos: convos.count || 0,
        active: active.count || 0,
        escalated: escalated.count || 0,
        leads: leads.count || 0,
      })
      if (usageRes.ok) {
        const usageData = await usageRes.json()
        setUsage(usageData)
      }
    }
    load()
  }, [membership])

  const usagePercent = usage && usage.limit > 0 ? Math.round((usage.used / usage.limit) * 100) : 0
  const isNearLimit = usage && usagePercent >= 80
  const isAtLimit = usage && !usage.allowed

  const cards = [
    { title: 'Total Conversations', value: stats.convos, icon: MessageSquare, color: 'text-blue-600' },
    { title: 'Active Now', value: stats.active, icon: TrendingUp, color: 'text-green-600' },
    { title: 'Escalated', value: stats.escalated, icon: AlertTriangle, color: 'text-red-600' },
    { title: 'Leads Captured', value: stats.leads, icon: Users, color: 'text-purple-600' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>

      {usage && (
        <Card className={`mb-6 ${isAtLimit ? 'border-red-500 bg-red-50' : isNearLimit ? 'border-amber-500 bg-amber-50' : ''}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className={`h-5 w-5 ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-blue-600'}`} />
                <span className="font-medium">
                  {usage.planName || 'No Plan'} — {usage.used.toLocaleString()} / {usage.limit.toLocaleString()} conversations
                </span>
              </div>
              <span className={`text-sm font-semibold ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-green-600'}`}>
                {usagePercent}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all ${
                  isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
            {isAtLimit && (
              <p className="mt-2 text-sm text-red-600">
                You have reached your plan limit. Some conversations may not be answered. Please upgrade your plan.
              </p>
            )}
            {isNearLimit && !isAtLimit && (
              <p className="mt-2 text-sm text-amber-600">
                You are approaching your plan limit. Consider upgrading to continue uninterrupted service.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map(c => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
