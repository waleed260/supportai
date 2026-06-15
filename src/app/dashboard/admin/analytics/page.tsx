'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, MessageSquare, AlertTriangle, Users, Target, TrendingDown, Activity } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#22c55e', '#6b7280', '#f97316', '#ef4444', '#dc2626']

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState({
    total: 0, active: 0, resolved: 0, escalated: 0,
    positive: 0, neutral: 0, negative: 0, frustrated: 0,
    leads: 0,
  })
  const [dailyData, setDailyData] = useState<{ date: string; count: number }[]>([])
  const [orgId, setOrgId] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: membership } = await supabase.from('memberships')
        .select('organization_id').eq('user_id', session.user.id).limit(1).single()
      if (!membership) return
      const oid = membership.organization_id
      setOrgId(oid)

      const { data: convos } = await supabase.from('conversations').select('status, sentiment, created_at').eq('organization_id', oid)
      if (convos) {
        setMetrics({
          total: convos.length,
          active: convos.filter(c => c.status === 'active').length,
          resolved: convos.filter(c => c.status === 'resolved').length,
          escalated: convos.filter(c => c.status === 'escalated').length,
          positive: convos.filter(c => c.sentiment === 'positive').length,
          neutral: convos.filter(c => c.sentiment === 'neutral').length,
          negative: convos.filter(c => c.sentiment === 'negative').length,
          frustrated: convos.filter(c => c.sentiment === 'frustrated' || c.sentiment === 'high_risk').length,
          leads: 0,
        })

        const byDay: Record<string, number> = {}
        convos.forEach(c => {
          const d = new Date(c.created_at).toISOString().slice(0, 10)
          byDay[d] = (byDay[d] || 0) + 1
        })
        setDailyData(Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count })))
      }

      const { count } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('organization_id', oid)
      setMetrics(prev => ({ ...prev, leads: count || 0 }))
    }
    fetch()
  }, [])

  const kpiCards = [
    { title: 'Total Conversations', value: metrics.total, icon: MessageSquare, color: 'text-blue-600', change: '+12%' },
    { title: 'Active', value: metrics.active, icon: Activity, color: 'text-green-600', change: null as string | null },
    { title: 'Resolved', value: metrics.resolved, icon: Target, color: 'text-emerald-600', change: metrics.total > 0 ? Math.round((metrics.resolved / metrics.total) * 100) + '%' : '0%' },
    { title: 'Escalated', value: metrics.escalated, icon: AlertTriangle, color: 'text-red-600', change: null },
    { title: 'Leads Captured', value: metrics.leads, icon: Users, color: 'text-purple-600', change: null },
    { title: 'Resolution Rate', value: metrics.total > 0 ? Math.round((metrics.resolved / metrics.total) * 100) : 0, icon: TrendingUp, color: 'text-teal-600', suffix: '%' },
  ]

  const sentimentData = [
    { name: 'Positive', value: metrics.positive },
    { name: 'Neutral', value: metrics.neutral },
    { name: 'Negative', value: metrics.negative },
    { name: 'Frustrated', value: metrics.frustrated },
  ].filter(s => s.value > 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4" />
          Real-time overview
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
        {kpiCards.map(c => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{c.title}</CardTitle>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value}{c.suffix || ''}</div>
              {c.change && <p className="text-xs text-green-600 mt-1">{c.change} rate</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Conversations Over Time</CardTitle></CardHeader>
          <CardContent>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">No data yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Sentiment Distribution</CardTitle></CardHeader>
          <CardContent>
            {sentimentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value">
                    {sentimentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">No data yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Status Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Active', value: metrics.active, color: 'bg-green-500' },
                { label: 'Resolved', value: metrics.resolved, color: 'bg-blue-500' },
                { label: 'Escalated', value: metrics.escalated, color: 'bg-red-500' },
              ].map(s => {
                const max = Math.max(metrics.active, metrics.resolved, metrics.escalated, 1)
                return (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{s.label}</span>
                      <span className="font-medium">{s.value}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${s.color} rounded-full transition-all`}
                        style={{ width: `${(s.value / max) * 100}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Channel Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              <BarChart3 className="h-8 w-8 mr-2" />
              Channel analytics available once multi-channel data flows in
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
