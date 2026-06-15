'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, MessageSquare, AlertTriangle, Users, Target } from 'lucide-react'

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState({
    total: 0, active: 0, resolved: 0, escalated: 0,
    positive: 0, neutral: 0, negative: 0, frustrated: 0,
  })

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: membership } = await supabase.from('memberships')
        .select('organization_id').eq('user_id', session.user.id).limit(1).single()
      if (!membership) return
      const orgId = membership.organization_id

      const { data: convos } = await supabase.from('conversations').select('status, sentiment').eq('organization_id', orgId)
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
        })
      }
    }
    fetch()
  }, [])

  const kpiCards = [
    { title: 'Total Conversations', value: metrics.total, icon: MessageSquare, color: 'text-blue-600' },
    { title: 'Active', value: metrics.active, icon: TrendingUp, color: 'text-green-600' },
    { title: 'Resolved', value: metrics.resolved, icon: Target, color: 'text-emerald-600' },
    { title: 'Escalated', value: metrics.escalated, icon: AlertTriangle, color: 'text-red-600' },
  ]

  const sentimentData = [
    { label: 'Positive', value: metrics.positive, color: 'bg-green-500' },
    { label: 'Neutral', value: metrics.neutral, color: 'bg-gray-400' },
    { label: 'Negative', value: metrics.negative, color: 'bg-orange-500' },
    { label: 'Frustrated', value: metrics.frustrated, color: 'bg-red-500' },
  ]
  const maxSentiment = Math.max(...sentimentData.map(s => s.value), 1)

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Analytics</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {kpiCards.map(c => (
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Sentiment Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sentimentData.map(s => (
                <div key={s.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{s.label}</span>
                    <span className="font-medium">{s.value}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${s.color} rounded-full transition-all`}
                      style={{ width: `${(s.value / maxSentiment) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Resolution Rate</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center h-40">
            <div className="text-center">
              <div className="text-5xl font-bold text-green-600">
                {metrics.total > 0 ? Math.round((metrics.resolved / metrics.total) * 100) : 0}%
              </div>
              <p className="text-muted-foreground mt-2">of conversations resolved</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
