'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState } from 'react'
import {
  Bot, BookOpen, Users,
  ChevronRight, Sparkles, Shield, Zap, ArrowUpRight, Star,
  Layers, LineChart,
} from 'lucide-react'

const stats = [
  { value: '10K+', label: 'Active Users' },
  { value: '1M+', label: 'Conversations' },
  { value: '<2s', label: 'Response Time' },
  { value: '99%', label: 'Uptime' },
]

const features = [
  {
    title: 'Multi-Channel Inbox',
    desc: 'WhatsApp, Instagram, Facebook, Web Chat — all conversations in one unified dashboard.',
    icon: Layers,
  },
  {
    title: 'AI-Powered Responses',
    desc: 'Claude-powered agents with RAG from your knowledge base. Accurate, context-aware replies.',
    icon: Bot,
  },
  {
    title: 'Lead Capture Engine',
    desc: 'Automatically qualify and capture leads during conversations. Syncs with your CRM.',
    icon: Users,
  },
  {
    title: 'Real-Time Analytics',
    desc: 'Track sentiment, response times, resolution rates, and team performance live.',
    icon: LineChart,
  },
  {
    title: 'Smart Escalation',
    desc: 'Seamlessly hand off complex issues to your team with full conversation context.',
    icon: Shield,
  },
  {
    title: 'Knowledge Base',
    desc: 'Upload docs, FAQs, and product guides. Your AI searches them to answer accurately.',
    icon: BookOpen,
  },
]

const testimonials = [
  {
    name: 'Sarah Chen', role: 'CEO, TechFlow',
    content: 'SupportAI transformed our support operations. Response times dropped from hours to seconds. Our team can finally focus on strategic work.',
  },
  {
    name: 'Marcus Rivera', role: 'Customer Success, GrowthPad',
    content: 'The lead capture feature alone paid for itself in the first month. We\'re converting 3x more website visitors into qualified leads.',
  },
  {
    name: 'Emily Watson', role: 'Support Manager, CloudScale',
    content: 'Multi-channel support that actually works. Our customers love getting instant, accurate responses on WhatsApp and Messenger.',
  },
]

const faqItems = [
  { q: 'How does the AI agent work?', a: 'Our AI agents use Claude combined with RAG (Retrieval Augmented Generation) from your knowledge base to provide accurate, context-aware responses.' },
  { q: 'Which channels are supported?', a: 'Web Chat, WhatsApp Business, Instagram, Facebook Messenger, Telegram, and Email — all from a single dashboard.' },
  { q: 'Can I customize the AI personality?', a: 'Yes — customize personality, tone, brand guidelines, and add custom instructions. Preview changes live before deploying.' },
  { q: 'How does lead capture work?', a: 'The AI proactively asks qualifying questions during conversations and captures lead information. Data syncs automatically to your CRM.' },
]

function FadeIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
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
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white dark:text-slate-900" />
            </div>
            <span className="text-base font-semibold tracking-tight">SupportAI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-500 dark:text-slate-400">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-slate-900 dark:hover:text-white transition-colors">Testimonials</a>
            <a href="#faq" className="hover:text-slate-900 dark:hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:inline-flex"><Button variant="ghost" className="text-sm h-9 px-4">Sign in</Button></Link>
            <Link href="/register"><Button className="text-sm h-9 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-sm">
              Get started <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-950" />
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-slate-100 dark:bg-slate-800/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[300px] h-[300px] bg-slate-100 dark:bg-slate-800/20 rounded-full blur-[80px]" />

        <div className="max-w-6xl mx-auto px-5 relative">
          <FadeIn className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400 mb-6">
              <Sparkles className="h-3 w-3" />
              AI-Powered Customer Support
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] mb-5" style={{ fontFamily: 'var(--font-syne)' }}>
              AI customer support
              <br />
              <span className="text-slate-400 dark:text-slate-500">that actually works</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed mb-8">
              Deploy intelligent AI agents across WhatsApp, Instagram, Facebook, and your website.
              Automate support, capture leads, and delight customers — all from one platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register">
                <Button className="h-11 px-6 text-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-lg shadow-slate-900/10 dark:shadow-white/10">
                  Start free trial <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="h-11 px-6 text-sm border-slate-200 dark:border-slate-700">
                  Watch demo
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-6 mt-10 text-xs text-slate-400 dark:text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="size-5 rounded-full bg-slate-200 dark:bg-slate-700 border border-white dark:border-slate-950" />
                  ))}
                </div>
                <span>2.4K+ teams</span>
              </div>
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>4.9/5 from 500+ reviews</span>
              </div>
            </div>
          </FadeIn>

          {/* Stats */}
          <FadeIn delay={200} className="mt-16 md:mt-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-200 dark:bg-slate-800">
              {stats.map(s => (
                <div key={s.label} className="bg-white dark:bg-slate-900 py-5 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{s.value}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-5">
          <FadeIn className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3" style={{ fontFamily: 'var(--font-syne)' }}>Everything you need</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              A complete AI support platform. No piecemeal tools, no complex setup.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <FadeIn key={f.title} delay={i * 80}>
                  <div className="group p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 h-full">
                    <div className="size-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                      <Icon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                    </div>
                    <h3 className="text-sm font-semibold mb-1.5">{f.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 md:py-28 bg-slate-50/50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-5">
          <FadeIn className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3" style={{ fontFamily: 'var(--font-syne)' }}>Trusted by teams</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              See what our customers say about SupportAI.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 120}>
                <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full flex flex-col">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-5">
          <FadeIn className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3" style={{ fontFamily: 'var(--font-syne)' }}>Frequently asked questions</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Everything you need to know about SupportAI.</p>
          </FadeIn>

          <div className="space-y-2">
            {faqItems.map((item, i) => (
              <FadeIn key={i} delay={i * 80}>
                <details className="group rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                  <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    {item.q}
                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 group-open:rotate-90" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                    {item.a}
                  </div>
                </details>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-slate-900 dark:bg-slate-950 border-t border-slate-800">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <FadeIn>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-4" style={{ fontFamily: 'var(--font-syne)' }}>
              Ready to transform your support?
            </h2>
            <p className="text-sm text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
              Join thousands of businesses using SupportAI. Start free — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register">
                <Button className="h-11 px-6 text-sm bg-white text-slate-900 hover:bg-slate-100 shadow-lg">
                  Start free trial <Zap className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="h-11 px-6 text-sm border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                  Talk to sales
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="size-7 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-white dark:text-slate-900" />
                </div>
                <span className="text-sm font-semibold">SupportAI</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                AI-powered customer support and sales platform for modern businesses.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">Product</h4>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <li><a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#testimonials" className="hover:text-slate-900 dark:hover:text-white transition-colors">Testimonials</a></li>
                <li><a href="#faq" className="hover:text-slate-900 dark:hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">Company</h4>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} SupportAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
