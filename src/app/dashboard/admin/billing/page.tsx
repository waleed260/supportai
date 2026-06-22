'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { motion, AnimatePresence } from 'motion/react'
import { CreditCard, CheckCircle, ExternalLink, XCircle, Sparkles, Zap, Shield, Rocket, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import type { Subscription, SubscriptionPlan } from '@/types'

const planIcons = [Rocket, Zap, Shield]
const planAccents = ['from-primary/20 to-amber-500/10', 'from-violet-500/20 to-purple-500/10', 'from-emerald-500/20 to-teal-500/10']
const planGradients = ['from-primary to-amber-500', 'from-violet-500 to-purple-500', 'from-emerald-500 to-teal-500']

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month')

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

  const handleUpgrade = async (plan: SubscriptionPlan, interval: string) => {
    const priceId = interval === 'year' ? plan.stripe_price_id_yearly : plan.stripe_price_id_monthly
    if (!priceId) {
      toast.error('Stripe price not configured for this plan. Contact support.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price_id: priceId, interval }),
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

  const getPrice = (plan: SubscriptionPlan) =>
    billingInterval === 'year' ? plan.price_yearly : plan.price_monthly

  const getSavings = (plan: SubscriptionPlan) => {
    const monthlyTotal = plan.price_monthly * 12
    return Math.round((1 - plan.price_yearly / monthlyTotal) * 100)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing & Subscription</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your plan and payment details</p>
        </div>
        {subscription?.stripe_customer_id && (
          <Button variant="outline" onClick={handleManageBilling} disabled={portalLoading} className="gap-2">
            <ExternalLink className="h-4 w-4" />
            {portalLoading ? 'Opening...' : 'Manage Billing'}
          </Button>
        )}
      </div>

      {subscription && (
        <Card className="mb-8 border-border/60 bg-gradient-to-r from-primary/[0.03] to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Current Plan</CardTitle>
                  <p className="text-xs text-muted-foreground">Your active subscription</p>
                </div>
              </div>
              {statusBadge(subscription.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-xl font-bold text-foreground">{subscription.plan?.name || 'Unknown'}</div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(getPrice(subscription.plan!))}/{billingInterval === 'year' ? 'yr' : 'mo'}
                  {subscription.billing_interval === 'year' && ' (billed yearly)'}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                Period: {subscription.current_period_start ? formatDate(subscription.current_period_start) : '-'}
                {' — '}
                {subscription.current_period_end ? formatDate(subscription.current_period_end) : '-'}
              </div>
              <div>
                Cancel at period end: {subscription.cancel_at_period_end ? 'Yes' : 'No'}
              </div>
            </div>
            {subscription.status === 'past_due' && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-xl p-4">
                <XCircle className="h-4 w-4 shrink-0" />
                Payment failed. Please update your payment method to keep your service active.
                <Button size="sm" variant="destructive" onClick={handleManageBilling} disabled={portalLoading} className="ml-auto shrink-0">
                  Update Payment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Available Plans</h2>
        <div className="relative z-10 flex rounded-xl bg-muted border border-border p-1">
          <button
            onClick={() => setBillingInterval('month')}
            className={`relative z-10 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              billingInterval === 'month' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {billingInterval === 'month' && (
              <motion.span
                layoutId="billing-switch"
                className="absolute inset-0 rounded-lg bg-primary shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative">Monthly</span>
          </button>
          <button
            onClick={() => setBillingInterval('year')}
            className={`relative z-10 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              billingInterval === 'year' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {billingInterval === 'year' && (
              <motion.span
                layoutId="billing-switch"
                className="absolute inset-0 rounded-lg bg-primary shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              Yearly
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">Save 17%</span>
            </span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan, index) => {
          const Icon = planIcons[index] || Sparkles
          const isCurrent = subscription?.plan_id === plan.id
          const popular = index === 1

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Card className={`relative overflow-hidden border-border/60 h-full flex flex-col ${
                popular ? 'ring-2 ring-primary shadow-lg shadow-primary/10' : ''
              } ${isCurrent ? 'ring-2 ring-blue-500' : ''}`}
              >
                {popular && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-violet-500" />
                )}
                {popular && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-primary text-primary-foreground text-[10px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Popular
                    </span>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${planAccents[index]} flex items-center justify-center mb-3`}>
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-4">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={billingInterval}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-baseline gap-1"
                      >
                        <span className="text-3xl font-bold text-foreground">
                          {formatCurrency(getPrice(plan))}
                        </span>
                        <span className="text-sm text-muted-foreground">/{billingInterval === 'year' ? 'yr' : 'mo'}</span>
                      </motion.div>
                    </AnimatePresence>
                    {billingInterval === 'year' && (
                      <p className="text-xs text-primary mt-1">
                        Save {getSavings(plan)}% vs monthly
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-muted-foreground">{plan.max_conversations.toLocaleString()} conversations/mo</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-muted-foreground">{plan.max_seats} team seat{plan.max_seats !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-muted-foreground">{plan.channels.length} channel{plan.channels.length !== 1 ? 's' : ''}</span>
                    </div>
                    {plan.features.lead_capture && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-muted-foreground">Lead capture</span>
                      </div>
                    )}
                    {plan.features.sentiment_analysis && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-muted-foreground">Sentiment analysis</span>
                      </div>
                    )}
                    {plan.features.agent_memory && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-muted-foreground">Agent memory</span>
                      </div>
                    )}
                    {plan.features.advanced_analytics && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-muted-foreground">Advanced analytics</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 space-y-2">
                    <Button
                      className={`w-full gap-2 ${popular && !isCurrent ? '' : ''}`}
                      variant={isCurrent ? 'outline' : popular ? 'default' : 'outline'}
                      disabled={isCurrent || loading}
                      onClick={() => !isCurrent && handleUpgrade(plan, billingInterval)}
                    >
                      {isCurrent ? (
                        <>Current Plan</>
                      ) : loading ? (
                        'Redirecting...'
                      ) : (
                        <span className="flex items-center gap-2">
                          {index === 0 ? 'Start Free Trial' : 'Subscribe'} <ChevronRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-muted-foreground gap-1"
                      onClick={() => handleUpgrade(plan, 'year')}
                      disabled={isCurrent || loading}
                    >
                      Or pay yearly <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
