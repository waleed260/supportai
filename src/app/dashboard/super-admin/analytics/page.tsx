'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, Users, MessageSquare } from 'lucide-react'

export default function SuperAdminAnalytics() {
  const [stats, setStats] = useState({ orgs: 0, convos: 0, users: 0, revenue: 0 })

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const [orgs, users, convos] = await Promise.all([
        supabase.from('organizations').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('conversations').select('*', { count: 'exact', head: true }),
      ])
      setStats({
        orgs: orgs.count || 0,
        users: users.count || 0,
        convos: convos.count || 0,
        revenue: 0,
      })
    }
    fetch()
  }, [])

  const cards = [
    { title: 'Platform Revenue', value: `$${stats.revenue}`, icon: TrendingUp, color: 'text-green-600' },
    { title: 'Active Organizations', value: stats.orgs, icon: Users, color: 'text-blue-600' },
    { title: 'Total Users', value: stats.users, icon: Users, color: 'text-purple-600' },
    { title: 'Total Conversations', value: stats.convos, icon: MessageSquare, color: 'text-orange-600' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Platform Analytics</h2>
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
