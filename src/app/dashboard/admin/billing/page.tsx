'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CreditCard, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { Subscription, SubscriptionPlan } from '@/types'

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: membership } = await supabase.from('memberships')
        .select('organization_id').eq('user_id', session.user.id).limit(1).single()
      if (!membership) return
      const orgId = membership.organization_id

      const [subResult, plansResult] = await Promise.all([
        supabase.from('subscriptions').select('*, plan:subscription_plans(*)')
          .eq('organization_id', orgId).single(),
        supabase.from('subscription_plans').select('*').eq('is_active', true),
      ])
      if (subResult.data) setSubscription(subResult.data)
      if (plansResult.data) setPlans(plansResult.data)
    }
    fetch()
  }, [])

  const statusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      past_due: 'destructive',
      canceled: 'secondary',
      trialing: 'outline',
    }
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Billing & Subscription</h2>

      {subscription && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Plan</CardTitle>
              {statusBadge(subscription.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-xl font-bold">{subscription.plan?.name || 'Unknown'}</div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(subscription.plan?.price_monthly || 0)}/month
                  {subscription.billing_interval === 'year' && ' (billed yearly)'}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Period:</span> {subscription.current_period_start ? formatDate(subscription.current_period_start) : '-'} - {subscription.current_period_end ? formatDate(subscription.current_period_end) : '-'}</div>
              <div><span className="text-muted-foreground">Cancel at period end:</span> {subscription.cancel_at_period_end ? 'Yes' : 'No'}</div>
            </div>
          </CardContent>
        </Card>
      )}

      <h3 className="text-lg font-semibold mb-4">Available Plans</h3>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map(plan => {
          const isCurrent = subscription?.plan_id === plan.id
          return (
            <Card key={plan.id} className={isCurrent ? 'ring-2 ring-blue-500' : ''}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="text-3xl font-bold">{formatCurrency(plan.price_monthly)}<span className="text-base font-normal text-muted-foreground">/mo</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">{plan.description}</div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {plan.max_conversations.toLocaleString()} conversations/mo
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {plan.max_seats} team seats
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {plan.channels.length} channels
                  </div>
                  {plan.features.lead_capture && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Lead capture
                    </div>
                  )}
                  {plan.features.sentiment_analysis && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Sentiment analysis
                    </div>
                  )}
                  {plan.features.advanced_analytics && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Advanced analytics
                    </div>
                  )}
                </div>
                <Button className="w-full" variant={isCurrent ? 'outline' : 'default'} disabled={isCurrent}>
                  {isCurrent ? 'Current Plan' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
