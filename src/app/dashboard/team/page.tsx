'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthContext } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react'

export default function TeamOverview() {
  const { membership } = useAuthContext()
  const [stats, setStats] = useState({ active: 0, escalated: 0, resolved: 0 })

  useEffect(() => {
    if (!membership) return
    const fetch = async () => {
      const supabase = createClient()
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
  }, [membership])

  const cards = [
    { title: 'Active Conversations', value: stats.active, icon: MessageSquare, color: 'text-blue-600' },
    { title: 'Escalated', value: stats.escalated, icon: AlertTriangle, color: 'text-red-600' },
    { title: 'Resolved Today', value: stats.resolved, icon: CheckCircle, color: 'text-green-600' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-3">
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
