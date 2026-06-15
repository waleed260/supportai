import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-03-31' as any })

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: membership } = await supabase.from('memberships')
      .select('organization_id').eq('user_id', session.user.id).limit(1).single()
    if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 403 })

    const body = await request.json()
    const { price_id, interval } = body

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: price_id, quantity: 1 }],
      customer_email: session.user.email,
      metadata: { organization_id: membership.organization_id },
      subscription_data: {
        metadata: { organization_id: membership.organization_id },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/billing?canceled=true`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
