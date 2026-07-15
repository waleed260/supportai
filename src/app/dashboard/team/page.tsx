'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react'

export default function TeamOverview() {
  const [stats, setStats] = useState({ active: 0, escalated: 0, resolved: 0 })

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: membership } = await supabase.from('memberships')
        .select('organization_id').eq('user_id', session.user.id).limit(1).single()
      if (!membership) return
      const orgId = membership.organization_id

      const [active, escalated, resolved] = await Promise.all([
        supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'active'),
        supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'escalated'),
        supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'resolved'),
      ])
      setStats({
        active: active.count || 0,
        escalated: escalated.count || 0,
        resolved: resolved.count || 0,
      })
    }
    fetch()
  }, [])

  const cards = [
    {
      title: 'Active Conversations',
      value: stats.active,
      icon: MessageSquare,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/50',
    },
    {
      title: 'Escalated',
      value: stats.escalated,
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/50',
    },
    {
      title: 'Resolved Today',
      value: stats.resolved,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950/50',
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">My Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">Overview of your team&apos;s conversations</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(c => (
          <Card key={c.title} className="card-hover border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
              <div className={`${c.bg} p-2 rounded-lg`}>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
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
