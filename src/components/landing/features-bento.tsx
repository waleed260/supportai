'use client'

import { MessageSquare, Bot, BarChart3, Globe, Users, Shield, Sparkles } from 'lucide-react'
import { useInView } from '@/hooks/use-in-view'

const features = [
  {
    title: 'Multi-Channel Inbox',
    desc: 'Unify WhatsApp, Instagram, Facebook, and web chat into one intelligent inbox. Never miss a message.',
    icon: MessageSquare,
    className: 'md:col-span-2 md:row-span-1',
    gradient: 'from-[#f57c00]/10 to-amber-500/5 dark:from-[#f57c00]/15 dark:to-amber-500/10',
    delay: 'delay-100',
  },
  {
    title: 'AI-Powered Agents',
    desc: 'Claude-powered agents with RAG from your knowledge base. Smart, context-aware responses every time.',
    icon: Bot,
    className: 'md:col-span-1 md:row-span-2',
    gradient: 'from-amber-500/10 to-orange-500/5 dark:from-amber-500/15 dark:to-orange-500/10',
    delay: 'delay-200',
  },
  {
    title: 'Smart Analytics',
    desc: 'Sentiment tracking, lead scoring, and performance metrics. Know exactly how your support team is doing.',
    icon: BarChart3,
    className: 'md:col-span-1 md:row-span-1',
    gradient: 'from-emerald-500/10 to-teal-500/5 dark:from-emerald-500/15 dark:to-teal-500/10',
    delay: 'delay-300',
  },
  {
    title: 'Omnichannel Reach',
    desc: 'Meet customers where they are. Seamless integration with all major messaging platforms.',
    icon: Globe,
    className: 'md:col-span-1 md:row-span-1',
    gradient: 'from-sky-500/10 to-blue-500/5 dark:from-sky-500/15 dark:to-blue-500/10',
    delay: 'delay-400',
  },
  {
    title: 'Team Collaboration',
    desc: 'Assign conversations, share notes, and work together. Built for teams of any size.',
    icon: Users,
    className: 'md:col-span-1 md:row-span-1',
    gradient: 'from-rose-500/10 to-pink-500/5 dark:from-rose-500/15 dark:to-pink-500/10',
    delay: 'delay-500',
  },
  {
    title: 'Enterprise Security',
    desc: 'SOC 2 compliant, end-to-end encrypted, and GDPR ready. Your data stays yours.',
    icon: Shield,
    className: 'md:col-span-2 md:row-span-1',
    gradient: 'from-[#f57c00]/10 to-amber-500/5 dark:from-[#f57c00]/15 dark:to-amber-500/10',
    delay: 'delay-700',
  },
]

export function FeaturesBento() {
  const { ref, inView } = useInView(0.05)

  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-50/30 to-transparent dark:via-[#121824]" />
      <div ref={ref} className="relative max-w-7xl mx-auto px-4">
        <div className={`text-center mb-16 transition-all duration-700 ${inView ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#f57c00]/20 bg-white/50 dark:bg-white/5 text-sm text-muted-foreground mb-4">
            <Sparkles className="h-4 w-4 text-[#f57c00]" />
            Platform Features
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-syne)' }}>
            Everything you need to{' '}
            <span className="text-[#f57c00]">scale support</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From AI-powered responses to real-time analytics — our platform gives you the tools to deliver exceptional customer service.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 auto-rows-[200px]">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${f.gradient} p-6 hover:shadow-lg hover:border-[#f57c00]/30 dark:border-white/10 dark:hover:border-[#f57c00]/30 transition-all duration-300 group ${f.className} ${inView ? `animate-fade-in-up ${f.delay}` : 'opacity-0'}`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 rounded-bl-full" />
                <div className="relative h-full flex flex-col">
                  <div className="mb-3 w-10 h-10 rounded-xl bg-[#f57c00] flex items-center justify-center shadow-lg shadow-[#f57c00]/20 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{f.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
