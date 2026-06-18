'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CreditCard, CheckCircle, ExternalLink, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { Subscription, SubscriptionPlan } from '@/types'

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    const loadBilling = async () => {
      const res = await fetch('/api/billing')
      if (res.ok) {
        const data = await res.json()
        setSubscription(data.subscription)
        setPlans(data.plans)
      }
    }
    loadBilling()
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

  /** Redirect to Stripe Checkout for a new plan */
  const handleUpgrade = async (plan: SubscriptionPlan) => {
    if (!plan.stripe_price_id_monthly) {
      toast.error('Stripe price not configured for this plan. Contact support.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price_id: plan.stripe_price_id_monthly, interval: 'month' }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || 'Failed to start checkout')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  /** Open Stripe Customer Portal for self-serve plan changes */
  const handleManageBilling = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/subscriptions/customer-portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || 'Failed to open billing portal')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Billing &amp; Subscription</h2>
        {subscription?.stripe_customer_id && (
          <Button
            variant="outline"
            onClick={handleManageBilling}
            disabled={portalLoading}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {portalLoading ? 'Opening…' : 'Manage Billing'}
          </Button>
        )}
      </div>

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
              <div>
                <span className="text-muted-foreground">Period: </span>
                {subscription.current_period_start ? formatDate(subscription.current_period_start) : '-'}
                {' — '}
                {subscription.current_period_end ? formatDate(subscription.current_period_end) : '-'}
              </div>
              <div>
                <span className="text-muted-foreground">Cancel at period end: </span>
                {subscription.cancel_at_period_end ? 'Yes' : 'No'}
              </div>
            </div>
            {subscription.status === 'past_due' && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md p-3">
                <XCircle className="h-4 w-4 shrink-0" />
                Payment failed. Please update your payment method to keep your service active.
                <Button size="sm" variant="destructive" onClick={handleManageBilling} disabled={portalLoading} className="ml-auto">
                  Update Payment
                </Button>
              </div>
            )}
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
                <div className="text-3xl font-bold">
                  {formatCurrency(plan.price_monthly)}
                  <span className="text-base font-normal text-muted-foreground">/mo</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  or {formatCurrency(plan.price_yearly)}/yr (save {Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)}%)
                </div>
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
                    {plan.max_seats} team seat{plan.max_seats !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {plan.channels.length} channel{plan.channels.length !== 1 ? 's' : ''}
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
                  {plan.features.agent_memory && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Agent memory
                    </div>
                  )}
                  {plan.features.advanced_analytics && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Advanced analytics
                    </div>
                  )}
                </div>
                <Button
                  className="w-full"
                  variant={isCurrent ? 'outline' : 'default'}
                  disabled={isCurrent || loading}
                  onClick={() => !isCurrent && handleUpgrade(plan)}
                >
                  {isCurrent ? 'Current Plan' : loading ? 'Redirecting…' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
