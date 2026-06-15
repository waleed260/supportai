'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import type { SubscriptionPlan } from '@/types'

export default function SuperAdminSubscriptions() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('subscription_plans').select('*')
      if (data) setPlans(data)
    }
    fetch()
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Subscription Plans</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map(plan => (
          <Card key={plan.id} className="relative">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <div className="text-3xl font-bold">${plan.price_monthly / 100}<span className="text-base font-normal text-muted-foreground">/mo</span></div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">{plan.description}</div>
              <div className="space-y-1 text-sm">
                <div>• {plan.max_conversations.toLocaleString()} conversations/mo</div>
                <div>• {plan.max_seats} team seats</div>
                <div>• {plan.max_knowledge_docs} knowledge documents</div>
                <div>• Channels: {plan.channels.join(', ')}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
