'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MessageSquare, CheckCircle2, Clock, AlertTriangle, TrendingUp } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts'

const COLORS = ['#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280']

const CHANNEL_LABELS: Record<string, string> = {
  web_chat: 'Web Chat',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  facebook: 'Facebook',
  telegram: 'Telegram',
  email: 'Email',
}

const SENTIMENT_LABELS: Record<string, string> = {
  positive: 'Positive',
  neutral: 'Neutral',
  negative: 'Negative',
  frustrated: 'Frustrated',
  high_risk: 'High Risk',
}

type AnalyticsData = {
  days: number
  kpis: {
    total: number
    resolved: number
    escalated: number
    resolutionRate: number
    escalationRate: number
    avgResponseText: string | null
  }
  conversationTrends: { date: string; count: number }[]
  channelDistribution: { name: string; count: number }[]
  sentimentBreakdown: { name: string; count: number }[]
  weeklyResolutionRate: { week: string; rate: number }[]
}

const ranges = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
]

export default function SuperAdminAnalytics() {
  const [days, setDays] = useState('30')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/platform-analytics?days=${days}`)
        if (res.ok) {
          const json = await res.json()
          if (!cancelled) setData(json)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [days])

  const kpi = data?.kpis ?? { total: 0, resolved: 0, escalated: 0, resolutionRate: 0, escalationRate: 0, avgResponseText: null }

  const kpiCards = [
    {
      title: 'Total Conversations',
      value: kpi.total,
      icon: MessageSquare,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Resolution Rate',
      value: `${kpi.resolutionRate}%`,
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Avg Response Time',
      value: kpi.avgResponseText ?? '—',
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Escalation Rate',
      value: `${kpi.escalationRate}%`,
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
    },
  ]

  const channelData = (data?.channelDistribution ?? []).map(c => ({
    name: CHANNEL_LABELS[c.name] ?? c.name,
    value: c.count,
  }))

  const sentimentData = (data?.sentimentBreakdown ?? []).map(s => ({
    name: SENTIMENT_LABELS[s.name] ?? s.name,
    value: s.count,
  }))

  const trends = data?.conversationTrends ?? []
  const weekly = data?.weeklyResolutionRate ?? []

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Platform Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">Overall platform metrics and trends</p>
        </div>
        <Select value={days} onValueChange={v => { if (v) setDays(v) }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ranges.map(r => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {kpiCards.map(c => (
          <Card key={c.title} className="card-hover border shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '—' : c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 mb-6 lg:grid-cols-2">
        <Card className="border shadow-xs">
          <CardHeader><CardTitle>Conversation Trends</CardTitle></CardHeader>
          <CardContent>
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Conversations" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[240px] text-muted-foreground">
                {loading ? 'Loading…' : 'No data for this period'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader><CardTitle>Channel Distribution</CardTitle></CardHeader>
          <CardContent>
            {channelData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={channelData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" nameKey="name">
                    {channelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[240px] text-muted-foreground">
                {loading ? 'Loading…' : 'No data for this period'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border shadow-xs">
          <CardHeader><CardTitle>Sentiment Breakdown</CardTitle></CardHeader>
          <CardContent>
            {sentimentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" nameKey="name">
                    {sentimentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[240px] text-muted-foreground">
                {loading ? 'Loading…' : 'No data for this period'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Weekly Resolution Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weekly.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={weekly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Resolution rate']} />
                  <Line type="monotone" dataKey="rate" name="Resolution rate" stroke="#7c3aed" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[240px] text-muted-foreground">
                {loading ? 'Loading…' : 'No data for this period'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
