'use client'

import { Quote, Sparkles } from 'lucide-react'
import { useInView } from '@/hooks/use-in-view'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'CEO, Bloom Retail',
    quote: 'SupportAI transformed our customer support. We went from 12-hour response times to instant answers. Our customers noticed immediately.',
    initials: 'SC',
    gradient: 'from-[#f57c00] to-amber-600',
  },
  {
    name: 'Marcus Rivera',
    role: 'CTO, TechFlow',
    quote: 'The AI agents handle 80% of our inquiries autonomously. Our support team focuses on complex issues while the bot handles the rest.',
    initials: 'MR',
    gradient: 'from-[#121824] to-slate-700 dark:from-amber-500 dark:to-[#f57c00]',
  },
  {
    name: 'Emma Watson',
    role: 'Operations Lead, Nexus',
    quote: 'Multi-channel support was a nightmare before SupportAI. Now everything is in one place, and the analytics are incredible.',
    initials: 'EW',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    name: 'James Park',
    role: 'VP Support, CloudScale',
    quote: 'We reduced support costs by 60% while improving CSAT scores by 35%. The ROI was immediate and tangible.',
    initials: 'JP',
    gradient: 'from-[#f57c00] to-orange-600',
  },
  {
    name: 'Lisa Thompson',
    role: 'Head of CX, Finova',
    quote: 'The lead capture feature alone paid for our subscription in the first week. It is like having a sales team working 24/7.',
    initials: 'LT',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    name: 'David Kim',
    role: 'Founder, LaunchPad',
    quote: 'Setup took 10 minutes. The AI was already answering customer questions accurately by lunchtime. Unbelievable.',
    initials: 'DK',
    gradient: 'from-amber-500 to-[#f57c00]',
  },
]

export function TestimonialsSection() {
  const { ref, inView } = useInView(0.1)

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-50/20 to-transparent dark:via-[#121824]" />
      <div ref={ref} className="relative max-w-7xl mx-auto px-4">
        <div className={`text-center mb-16 transition-all duration-700 ${inView ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#f57c00]/20 bg-white/50 dark:bg-white/5 text-sm text-muted-foreground mb-4">
            <Sparkles className="h-4 w-4 text-[#f57c00]" />
            Testimonials
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-syne)' }}>
            Loved by{' '}
            <span className="text-[#f57c00]">support teams</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            See what our customers say about transforming their customer support experience.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`${inView ? `animate-fade-in-up delay-${(i + 1) * 100}` : 'opacity-0'}`}
            >
              <div className="relative rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-sm p-8 h-full hover:shadow-lg hover:border-[#f57c00]/30 transition-all duration-300 group">
                <Quote className="h-8 w-8 text-[#f57c00]/20 dark:text-[#f57c00]/30 mb-4" />
                <p className="text-muted-foreground leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-sm font-semibold group-hover:scale-110 transition-transform duration-300`}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
