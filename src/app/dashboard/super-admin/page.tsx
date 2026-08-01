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
    {
      title: 'Total Organizations',
      value: stats.orgs,
      icon: Building2,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/50',
    },
    {
      title: 'Total Users',
      value: stats.users,
      icon: Users,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950/50',
    },
    {
      title: 'Active Subscriptions',
      value: stats.subs,
      icon: CreditCard,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/50',
    },
    {
      title: 'Conversations',
      value: stats.convos,
      icon: Activity,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950/50',
    },
  ]

  const quickLinks = [
    { href: '/dashboard/super-admin/clients', label: 'Client Organizations' },
    { href: '/dashboard/super-admin/subscriptions', label: 'Billing Subscriptions' },
    { href: '/dashboard/super-admin/analytics', label: 'Platform Analytics' },
    { href: '/dashboard/super-admin/logs', label: 'Logs Explorer' },
    { href: '/dashboard/admin/conversations', label: 'Agent Conversations' },
    { href: '/dashboard/admin/agent', label: 'AI Agent Fine-tuning' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Super Admin Platform Overview</h2>
          <p className="text-sm text-muted-foreground mt-1">High-level metrics, active clients, and log diagnostics across all organizations</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map(c => (
          <Card key={c.title} className="card-hover border shadow-xs">
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

      <Card className="border shadow-xs">
        <CardHeader>
          <CardTitle className="text-base">Super Admin Navigation & Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {quickLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
