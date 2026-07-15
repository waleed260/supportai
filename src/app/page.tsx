'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState } from 'react'
import {
  MessageSquare, Bot, BookOpen, BarChart3, Globe, Users,
  ChevronRight, Sparkles, Shield, Zap, ArrowUpRight,
  CheckCircle2, Star, Quote,
} from 'lucide-react'

const stats = [
  { label: 'Active Users', value: '10K+' },
  { label: 'Conversations', value: '1M+' },
  { label: 'Response Time', value: '<2s' },
  { label: 'Resolution Rate', value: '94%' },
]

const features = [
  {
    title: 'Multi-Channel AI',
    description: 'Deploy across WhatsApp, Instagram, Facebook, and your website from one unified platform.',
    icon: Globe,
    gradient: 'from-blue-500 to-cyan-500',
    size: 'lg' as const,
  },
  {
    title: 'Claude-Powered',
    description: 'State-of-the-art AI agents powered by Claude, with RAG from your knowledge base.',
    icon: Bot,
    gradient: 'from-purple-500 to-pink-500',
    size: 'sm' as const,
  },
  {
    title: 'Lead Capture',
    description: 'Automatically qualify and capture leads during conversations.',
    icon: Users,
    gradient: 'from-emerald-500 to-teal-500',
    size: 'sm' as const,
  },
  {
    title: 'Smart Analytics',
    description: 'Track sentiment, performance metrics, and customer satisfaction in real-time.',
    icon: BarChart3,
    gradient: 'from-orange-500 to-rose-500',
    size: 'sm' as const,
  },
  {
    title: 'Knowledge Base',
    description: 'Upload docs, FAQs, and guides. Your AI agent uses them to give accurate answers.',
    icon: BookOpen,
    gradient: 'from-indigo-500 to-blue-500',
    size: 'sm' as const,
  },
  {
    title: 'Smart Escalation',
    description: 'Seamlessly hand off complex issues to your human team with full context.',
    icon: Shield,
    gradient: 'from-amber-500 to-red-500',
    size: 'sm' as const,
  },
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'CEO, TechFlow',
    content: 'SupportAI transformed our customer support. Response times dropped from hours to seconds. Our team can finally focus on what matters.',
    rating: 5,
  },
  {
    name: 'Marcus Rivera',
    role: 'Customer Success Lead, GrowthPad',
    content: 'The lead capture feature alone paid for itself within the first month. We\'re converting 3x more website visitors.',
    rating: 5,
  },
  {
    name: 'Emily Watson',
    role: 'Support Manager, CloudScale',
    content: 'Multi-channel support that actually works across all platforms. Our customers love the instant responses on WhatsApp.',
    rating: 5,
  },
]

const faqs = [
  { q: 'How does the AI agent work?', a: 'Our AI agents use Claude AI combined with RAG (Retrieval Augmented Generation) from your knowledge base to provide accurate, context-aware responses across all channels.' },
  { q: 'Which channels are supported?', a: 'We support Web Chat, WhatsApp Business, Instagram, Facebook Messenger, Telegram, and Email — all from a single dashboard.' },
  { q: 'Can I customize the AI personality?', a: 'Yes! You can customize personality, tone of voice, brand guidelines, and add custom instructions. Preview changes live before deploying.' },
  { q: 'How does lead capture work?', a: 'The AI proactively asks qualifying questions and captures lead information during conversations. Data is automatically synced to your CRM.' },
]

function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: rating }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  )
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">SupportAI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button></Link>
            <Link href="/register"><Button className="shadow-sm">
              Get Started
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button></Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-mesh pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 size-[400px] bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <AnimatedSection className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-muted/50 text-sm text-muted-foreground mb-6 animate-fade-in">
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              <span>AI-Powered Customer Support Platform</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              AI Customer Support
              <br />
              <span className="text-gradient">That Actually Works</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Deploy intelligent AI agents across WhatsApp, Instagram, Facebook, and your website.
              Automate support, capture leads, and delight your customers — all from one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="text-base px-8 h-12 shadow-lg shadow-blue-500/25">
                  Start Free Trial
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-base px-8 h-12">
                  Watch Demo
                </Button>
              </Link>
            </div>
          </AnimatedSection>

          {/* Stats */}
          <AnimatedSection className="mt-20" delay={200}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features Section - Bento Grid */}
      <section id="features" className="py-20 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete AI support platform with powerful features to scale your customer experience.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature, i) => {
              const Icon = feature.icon
              const isLarge = feature.size === 'lg'
              return (
                <AnimatedSection
                  key={feature.title}
                  delay={i * 100}
                  className={isLarge ? 'md:col-span-2' : ''}
                >
                  <div className={`group relative p-6 sm:p-8 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300 card-hover h-full ${isLarge ? 'md:col-span-2' : ''}`}>
                    {/* Gradient background on hover */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                    <div className="relative">
                      <div className={`size-10 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-muted/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Loved by Teams</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our customers say about SupportAI.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <AnimatedSection key={t.name} delay={i * 150}>
                <div className="p-6 rounded-2xl border bg-card card-hover h-full">
                  <Quote className="h-6 w-6 text-primary/30 mb-3" />
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <StarRating rating={t.rating} />
                  <div className="mt-4 pt-4 border-t">
                    <div className="font-medium text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">Everything you need to know about SupportAI.</p>
          </AnimatedSection>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <details className="group rounded-xl border bg-card overflow-hidden">
                  <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium hover:bg-muted/50 transition-colors">
                    {faq.q}
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-90" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Support?
            </h2>
            <p className="text-lg text-blue-100/80 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses using SupportAI to automate support and capture more leads.
              Start your free trial today — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 shadow-xl text-base px-8 h-12">
                  Start Free Trial
                  <Zap className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-base px-8 h-12">
                  Schedule Demo
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-bold">SupportAI</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                AI-powered customer support and sales platform for modern businesses.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SupportAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
