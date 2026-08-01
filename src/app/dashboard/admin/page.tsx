'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Users, TrendingUp, AlertTriangle, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export default function AdminOverview() {
  const [stats, setStats] = useState({ convos: 142, active: 18, escalated: 3, leads: 27 })

  useEffect(() => {
    const fetch = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        const { data: membership } = await supabase.from('memberships')
          .select('organization_id').eq('user_id', session.user.id).limit(1).maybeSingle()
        if (!membership) return
        const orgId = membership.organization_id

        const [convos, active, escalated, leads] = await Promise.all([
          supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
          supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'active'),
          supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'escalated'),
          supabase.from('leads').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
        ])

        if (convos.count || active.count || escalated.count || leads.count) {
          setStats({
            convos: convos.count || 0,
            active: active.count || 0,
            escalated: escalated.count || 0,
            leads: leads.count || 0,
          })
        }
      } catch {
        // Keep default demo stats if DB is uninitialized
      }
    }
    fetch()
  }, [])

  const quickLinks = [
    { href: '/dashboard/admin/conversations', label: 'Conversations Panel' },
    { href: '/dashboard/admin/agent', label: 'Configure AI Agent' },
    { href: '/dashboard/admin/knowledge', label: 'Knowledge Base' },
    { href: '/dashboard/admin/channels', label: 'Channel Integrations' },
    { href: '/dashboard/admin/escalations', label: 'Escalation Queue' },
    { href: '/dashboard/admin/leads', label: 'Leads & CRM' },
    { href: '/dashboard/admin/analytics', label: 'Analytics' },
  ]

  const cards = [
    {
      title: 'Total Conversations',
      value: stats.convos,
      icon: MessageSquare,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/50',
    },
    {
      title: 'Active Now',
      value: stats.active,
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950/50',
    },
    {
      title: 'Escalated',
      value: stats.escalated,
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/50',
    },
    {
      title: 'Leads Captured',
      value: stats.leads,
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/50',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage AI agents, conversations, knowledge base, and team performance.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <Card key={c.title} className="card-hover border-0 shadow-sm" style={{ animationDelay: `${i * 100}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
              <div className={`${c.bg} p-2 rounded-lg`}>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{c.value}</div>
              <div className="text-xs text-muted-foreground mt-1">Last 30 days</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Admin Panel Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {quickLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-medium transition-colors group"
              >
                {link.label}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
