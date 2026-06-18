import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = await createServiceRoleClient()
    const data = event.data.object as unknown as Record<string, unknown>

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = data as { metadata?: Record<string, string>; subscription?: string; customer?: string }
        const organizationId = session.metadata?.organization_id

        if (organizationId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription)
          await supabase.from('subscriptions').upsert({
            organization_id: organizationId,
            stripe_subscription_id: session.subscription,
            stripe_customer_id: session.customer,
            status: subscription.status,
            current_period_start: new Date((subscription as unknown as { current_period_start: number }).current_period_start * 1000).toISOString(),
            current_period_end: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
          })
        }
        break
      }

      // Spec requirement: handle customer.subscription.created
      case 'customer.subscription.created': {
        const sub = data as { id: string; status: string; metadata?: Record<string, string>; customer?: string; current_period_start: number; current_period_end: number; cancel_at_period_end: boolean }
        const organizationId = sub.metadata?.organization_id
        if (organizationId) {
          await supabase.from('subscriptions').upsert({
            organization_id: organizationId,
            stripe_subscription_id: sub.id,
            stripe_customer_id: sub.customer,
            status: sub.status,
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            cancel_at_period_end: sub.cancel_at_period_end,
          }, { onConflict: 'stripe_subscription_id' })
        }
        break
      }

      case 'invoice.paid':
      case 'invoice.payment_succeeded': {
        const invoice = data as { subscription?: string }
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
          await supabase.from('subscriptions')
            .update({ status: subscription.status })
            .eq('stripe_subscription_id', invoice.subscription)
        }
        break
      }

      // Spec requirement: invoice.payment_failed → mark as past_due
      case 'invoice.payment_failed': {
        const invoice = data as { subscription?: string; customer_email?: string }
        if (invoice.subscription) {
          await supabase.from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', invoice.subscription)
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = data as { id: string; status: string; current_period_start: number; current_period_end: number; cancel_at_period_end: boolean }
        await supabase.from('subscriptions').update({
          status: sub.status,
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
        }).eq('stripe_subscription_id', sub.id)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
