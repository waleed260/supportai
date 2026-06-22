'use client'

import { MessageSquare, Bot, BarChart3, Globe, Users, Shield, Sparkles, ArrowUpRight } from 'lucide-react'
import { useInView } from '@/hooks/use-in-view'

const features = [
  {
    title: 'Multi-Channel Inbox',
    desc: 'Unify WhatsApp, Instagram, Facebook, and web chat into one intelligent inbox. Never miss a message.',
    icon: MessageSquare,
    className: 'md:col-span-2 md:row-span-1',
    accent: 'from-primary/10 to-amber-500/5 dark:from-primary/20 dark:to-amber-500/10',
    border: 'hover:border-primary/40',
    iconBg: 'bg-primary shadow-primary/25',
    delay: 'delay-100',
  },
  {
    title: 'AI-Powered Agents',
    desc: 'Claude-powered agents with RAG from your knowledge base. Smart, context-aware responses every time.',
    icon: Bot,
    className: 'md:col-span-1 md:row-span-2',
    accent: 'from-amber-500/10 to-orange-500/5 dark:from-amber-500/20 dark:to-orange-500/10',
    border: 'hover:border-amber-500/40',
    iconBg: 'bg-amber-500 shadow-amber-500/25',
    delay: 'delay-200',
  },
  {
    title: 'Smart Analytics',
    desc: 'Sentiment tracking, lead scoring, and performance metrics. Know exactly how your support team is doing.',
    icon: BarChart3,
    className: 'md:col-span-1 md:row-span-1',
    accent: 'from-emerald-500/10 to-teal-500/5 dark:from-emerald-500/20 dark:to-teal-500/10',
    border: 'hover:border-emerald-500/40',
    iconBg: 'bg-emerald-500 shadow-emerald-500/25',
    delay: 'delay-300',
  },
  {
    title: 'Omnichannel Reach',
    desc: 'Meet customers where they are. Seamless integration with all major messaging platforms.',
    icon: Globe,
    className: 'md:col-span-1 md:row-span-1',
    accent: 'from-sky-500/10 to-blue-500/5 dark:from-sky-500/20 dark:to-blue-500/10',
    border: 'hover:border-sky-500/40',
    iconBg: 'bg-sky-500 shadow-sky-500/25',
    delay: 'delay-400',
  },
  {
    title: 'Team Collaboration',
    desc: 'Assign conversations, share notes, and work together. Built for teams of any size.',
    icon: Users,
    className: 'md:col-span-1 md:row-span-1',
    accent: 'from-rose-500/10 to-pink-500/5 dark:from-rose-500/20 dark:to-pink-500/10',
    border: 'hover:border-rose-500/40',
    iconBg: 'bg-rose-500 shadow-rose-500/25',
    delay: 'delay-500',
  },
  {
    title: 'Enterprise Security',
    desc: 'SOC 2 compliant, end-to-end encrypted, and GDPR ready. Your data stays yours.',
    icon: Shield,
    className: 'md:col-span-2 md:row-span-1',
    accent: 'from-primary/10 to-amber-500/5 dark:from-primary/20 dark:to-amber-500/10',
    border: 'hover:border-primary/40',
    iconBg: 'bg-primary shadow-primary/25',
    delay: 'delay-700',
  },
]

export function FeaturesBento() {
  const { ref, inView } = useInView(0.05)

  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#fff7ed]/30 to-transparent dark:via-background" aria-hidden="true" />
      <div ref={ref} className="relative max-w-7xl mx-auto px-4">
        <div className={`text-center mb-16 transition-all duration-400 ${inView ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xs border border-primary/20 bg-background/50 backdrop-blur-sm text-muted-foreground mb-4 text-sm">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            Platform Features
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-syne)' }}>
            Everything you need to{' '}
            <span className="text-primary">scale support</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From AI-powered responses to real-time analytics — our platform gives you the tools to deliver exceptional customer service.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className={`relative overflow-hidden rounded-xs border bg-gradient-to-br ${f.accent} ${f.border} p-6 transition-all duration-400 group cursor-default ${f.className} ${inView ? `animate-fade-in-up ${f.delay}` : 'opacity-0'}`}
              >
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-white/30 to-transparent dark:from-white/5 rounded-bl-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-400" aria-hidden="true" />
                <div className="absolute top-0 right-0 w-16 h-16 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400 translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0">
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/40" aria-hidden="true" />
                </div>
                <div className="relative h-full flex flex-col">
                  <div className={`mb-4 w-11 h-11 rounded-xs ${f.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-[-3deg] transition-all duration-300`}>
                    <Icon className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{f.title}</h3>
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
