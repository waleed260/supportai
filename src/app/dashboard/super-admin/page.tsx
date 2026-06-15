'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, CreditCard, Activity } from 'lucide-react'

export default function SuperAdminOverview() {
  const [stats, setStats] = useState({ orgs: 0, users: 0, subs: 0, convos: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient()
      const [orgs, users, subs] = await Promise.all([
        supabase.from('organizations').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true }),
      ])
      setStats({
        orgs: orgs.count || 0,
        users: users.count || 0,
        subs: subs.count || 0,
        convos: 0,
      })
    }
    fetchStats()
  }, [])

  const cards = [
    { title: 'Total Organizations', value: stats.orgs, icon: Building2, color: 'text-blue-600' },
    { title: 'Total Users', value: stats.users, icon: Users, color: 'text-green-600' },
    { title: 'Active Subscriptions', value: stats.subs, icon: CreditCard, color: 'text-purple-600' },
    { title: 'Conversations', value: stats.convos, icon: Activity, color: 'text-orange-600' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Platform Overview</h2>
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
