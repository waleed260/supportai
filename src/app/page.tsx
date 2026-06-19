import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: 29,
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
    price: 99,
    description: 'Multi-channel support with lead capture',
    features: [
      '2,000 conversations/mo',
      '3 team seats',
      'Web Chat + WhatsApp + Instagram + Facebook',
      'Knowledge base (20 docs)',
      'Lead capture',
      'Sentiment analysis',
    ],
    missing: ['Advanced analytics'],
    popular: true,
  },
  {
    name: 'Pro',
    price: 299,
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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-xl font-bold text-blue-600">SupportAI</div>
          <div className="flex items-center gap-4">
            <Link href="/login"><Button variant="ghost">Sign In</Button></Link>
            <Link href="/register"><Button>Get Started</Button></Link>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 pt-24 pb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          AI Customer Support
          <span className="text-blue-600"> That Actually Works</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Deploy intelligent AI agents across WhatsApp, Instagram, Facebook, and your website.
          Automate support, capture leads, and delight customers.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register"><Button size="lg" className="text-lg px-8">Start Free Trial</Button></Link>
          <Link href="/login"><Button size="lg" variant="outline" className="text-lg px-8">View Demo</Button></Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-20 grid md:grid-cols-3 gap-8">
        {[
          { title: 'Multi-Channel', desc: 'WhatsApp, Instagram, Facebook, Web Chat — unified inbox' },
          { title: 'AI-Powered', desc: 'Claude-powered agents with RAG from your knowledge base' },
          { title: 'Smart Analytics', desc: 'Sentiment tracking, lead scoring, and performance metrics' },
        ].map(f => (
          <div key={f.title} className="p-6 bg-white rounded-xl border shadow-sm hover:shadow-md transition">
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Choose the plan that fits your business. Start with a free trial — no credit card required.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map(plan => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 flex flex-col ${
                  plan.popular
                    ? 'border-blue-500 shadow-lg ring-1 ring-blue-500'
                    : 'border-gray-200 shadow-sm'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600">
                    Most Popular
                  </Badge>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    or ${plan.price * 10}/year (save ~17%)
                  </p>
                </div>
                <div className="space-y-3 text-sm flex-1 mb-8">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                  {plan.missing.map(f => (
                    <div key={f} className="flex items-start gap-2 text-muted-foreground/50">
                      <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span className="line-through">{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/register" className="mt-auto">
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                  >
                    {plan.popular ? 'Start Free Trial' : 'Get Started'}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex justify-center gap-6 mb-4">
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          <Link href="/terms" className="hover:underline">Terms of Service</Link>
          <Link href="/security" className="hover:underline">Security</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} SupportAI. All rights reserved.</p>
      </footer>
    </div>
  )
}
