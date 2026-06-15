'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Users, TrendingUp, AlertTriangle } from 'lucide-react'

export default function AdminOverview() {
  const [stats, setStats] = useState({ convos: 0, active: 0, escalated: 0, leads: 0 })

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: membership } = await supabase.from('memberships')
        .select('organization_id').eq('user_id', session.user.id).limit(1).single()
      if (!membership) return
      const orgId = membership.organization_id

      const [convos, active, escalated, leads] = await Promise.all([
        supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
        supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'active'),
        supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'escalated'),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
      ])
      setStats({
        convos: convos.count || 0,
        active: active.count || 0,
        escalated: escalated.count || 0,
        leads: leads.count || 0,
      })
    }
    fetch()
  }, [])

  const cards = [
    { title: 'Total Conversations', value: stats.convos, icon: MessageSquare, color: 'text-blue-600' },
    { title: 'Active Now', value: stats.active, icon: TrendingUp, color: 'text-green-600' },
    { title: 'Escalated', value: stats.escalated, icon: AlertTriangle, color: 'text-red-600' },
    { title: 'Leads Captured', value: stats.leads, icon: Users, color: 'text-purple-600' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
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
