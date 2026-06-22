'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles } from 'lucide-react'
import { useState } from 'react'

const plans = [
  {
    name: 'Starter',
    monthlyPrice: 29,
    yearlyPrice: 290,
    description: 'Basic AI customer support for small businesses',
    features: [
      '500 conversations/mo',
      '1 team seat',
      'Web Chat + WhatsApp',
      'Knowledge base (5 docs)',
    ],
    missing: ['Lead capture', 'Sentiment analysis', 'Advanced analytics'],
    popular: false,
  },
  {
    name: 'Growth',
    monthlyPrice: 99,
    yearlyPrice: 990,
    description: 'Multi-channel support with lead capture',
    features: [
      '2,000 conversations/mo',
      '3 team seats',
      'Web Chat + WhatsApp + Instagram + Facebook',
      'Knowledge base (20 docs)',
      'Lead capture',
      'Sentiment analysis',
    ],
    missing: ['Advanced analytics & priority support'],
    popular: true,
  },
  {
    name: 'Pro',
    monthlyPrice: 299,
    yearlyPrice: 2990,
    description: 'Enterprise AI with full feature access',
    features: [
      '10,000 conversations/mo',
      '50 team seats',
      'All channels + Email & Telegram',
      'Knowledge base (100 docs)',
      'Lead capture & sentiment analysis',
      'Advanced analytics & priority support',
    ],
    missing: [],
    popular: false,
  },
]

export function PricingSection() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/30 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-white/50 text-sm text-muted-foreground mb-4">
            <Sparkles className="h-4 w-4 text-blue-500" />
            Simple Pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Transparent pricing{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              for every team
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Start with a free trial — no credit card required. Upgrade when you grow.
          </p>

          <div className="inline-flex items-center gap-3 p-1 rounded-full border bg-white/60 shadow-sm">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                !annual ? 'bg-blue-600 text-white shadow-md' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                annual ? 'bg-blue-600 text-white shadow-md' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual <span className="text-xs opacity-80">Save ~17%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const price = annual ? plan.yearlyPrice / 12 : plan.monthlyPrice
            return (
              <div
                key={plan.name}
                className={`relative rounded-3xl border p-8 flex flex-col transition-all duration-300 ${
                  plan.popular
                    ? 'border-blue-500/50 shadow-xl shadow-blue-500/10 scale-105 md:scale-105 bg-white'
                    : 'border-gray-200/80 shadow-sm bg-white/80 hover:shadow-lg hover:border-blue-200/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 shadow-lg shadow-blue-500/25">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${Math.round(price)}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  {annual && (
                    <p className="text-xs text-blue-600 font-medium mt-1">${plan.yearlyPrice}/year billed annually</p>
                  )}
                </div>

                <div className="space-y-3 text-sm flex-1 mb-8">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-start gap-3">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span>{f}</span>
                    </div>
                  ))}
                  {plan.missing.map(f => (
                    <div key={f} className="flex items-start gap-3 text-muted-foreground/50">
                      <div className="mt-0.5 w-5 h-5 rounded-full border border-muted-foreground/20 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="line-through">{f}</span>
                    </div>
                  ))}
                </div>

                <Link href="/register" className="mt-auto">
                  <Button
                    className={`w-full h-12 text-base ${plan.popular ? 'shadow-lg shadow-blue-500/25' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.popular ? 'Start Free Trial' : 'Get Started'}
                  </Button>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
