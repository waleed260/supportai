import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase/server'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-03-31' as any })
}

/**
 * POST /api/subscriptions/customer-portal
 * Creates a Stripe Billing Portal session so clients can self-serve
 * plan changes, cancel, and update payment methods.
 * Spec: "Customer portal: stripe.billingPortal.sessions.create() for self-serve plan changes"
 */
export async function POST() {
  try {
    const stripe = getStripe()
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', session.user.id)
      .limit(1)
      .single()
    if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 403 })

    // Get the Stripe customer ID from existing subscription
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('organization_id', membership.organization_id)
      .limit(1)
      .maybeSingle()

    if (!sub?.stripe_customer_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/billing`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Customer portal error:', error)
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}
