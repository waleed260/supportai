'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, CreditCard, TrendingUp, Clock, ArrowUpRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type PlatformStats = {
  counts: { total: number; active: number; pending: number; paused: number; suspended: number }
  mrr: number
  mrrSeries: { month: string; revenue: number }[]
  recentClients: {
    id: string
    name: string
    slug: string | null
    website: string | null
    company_size: string | null
    industry: string | null
    logo_url: string | null
    status: string
    approved_at: string | null
    created_at: string
    plan_name: string | null
    mrr: number
    is_subscribed: boolean
  }[]
}

export default function SuperAdminOverview() {
  const [data, setData] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/platform-stats')
        if (res.ok) setData(await res.json())
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const counts = data?.counts ?? { total: 0, active: 0, pending: 0, paused: 0, suspended: 0 }
  const mrr = data?.mrr ?? 0
  const mrrSeries = data?.mrrSeries ?? []
  const recentClients = data?.recentClients ?? []

  const statCards = [
    {
      title: 'Total Clients',
      value: counts.total,
      change: 'All registered',
      icon: Building2,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/50',
    },
    {
      title: 'Active',
      value: counts.active,
      change: 'Live & approved',
      icon: Users,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950/50',
    },
    {
      title: 'Pending',
      value: counts.pending,
      change: 'Awaiting approval',
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/50',
    },
    {
      title: 'MRR',
      value: `$${(mrr / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      change: 'Monthly recurring revenue',
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/50',
    },
  ]

  const initials = (name: string) =>
    name
      .split(' ')
      .map(p => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Platform Overview</h2>
          <p className="text-sm text-muted-foreground mt-1">SupportAI super admin panel</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map(c => (
          <Card key={c.title} className="card-hover border shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
              <div className={`${c.bg} p-2 rounded-lg`}>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '—' : c.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{c.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Monthly Revenue (MRR)</CardTitle>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              Last 12 months
            </div>
          </CardHeader>
          <CardContent>
            {mrrSeries.some(s => s.revenue > 0) ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={mrrSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${Math.round(v / 100)}`} />
                  <Tooltip
                    formatter={(value) => [`$${Math.round(Number(value) / 100).toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[260px] text-muted-foreground">
                No revenue data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Clients</CardTitle>
            <Link
              href="/dashboard/super-admin/clients"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all <ArrowUpRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentClients.length > 0 ? (
              <div className="space-y-4">
                {recentClients.map(client => (
                  <div key={client.id} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                      {client.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={client.logo_url} alt={client.name} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        initials(client.name)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{client.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {client.plan_name ?? 'No plan'} · {client.industry || '—'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {client.is_subscribed ? `$${(client.mrr / 100).toLocaleString()}` : '—'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(client.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[260px] text-muted-foreground gap-2">
                <Users className="h-8 w-8" />
                <span>No active clients yet</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
