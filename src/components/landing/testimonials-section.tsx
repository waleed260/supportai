'use client'

import { Sparkles, Star } from 'lucide-react'
import { useInView } from '@/hooks/use-in-view'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'CEO, Bloom Retail',
    quote: 'SupportAI transformed our customer support. We went from 12-hour response times to instant answers. Our customers noticed immediately.',
    initials: 'SC',
    gradient: 'from-primary to-amber-600',
  },
  {
    name: 'Marcus Rivera',
    role: 'CTO, TechFlow',
    quote: 'The AI agents handle 80% of our inquiries autonomously. Our support team focuses on complex issues while the bot handles the rest.',
    initials: 'MR',
    gradient: 'from-amber-500 to-primary',
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
    gradient: 'from-primary to-orange-600',
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
    gradient: 'from-amber-500 to-primary',
  },
]

export function TestimonialsSection() {
  const { ref, inView } = useInView(0.1)

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#fff7ed]/20 to-transparent dark:via-background" aria-hidden="true" />
      <div ref={ref} className="relative max-w-7xl mx-auto px-4">
        <div className={`text-center mb-16 transition-all duration-400 ${inView ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xs border border-primary/20 bg-background/50 backdrop-blur-sm text-muted-foreground mb-4 text-sm">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            Testimonials
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-syne)' }}>
            Loved by{' '}
            <span className="text-primary">support teams</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            See what our customers say about transforming their customer support experience.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`${inView ? `animate-fade-in-up delay-${(i + 1) * 100}` : 'opacity-0'}`}
            >
              <figure className="relative rounded-xs border border-border bg-card/60 backdrop-blur-sm p-5 md:aspect-square flex flex-col transition-all duration-400 group hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30">
                <div className="flex gap-0.5 mb-3 shrink-0">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-3 w-3 fill-primary/30 text-primary/30" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="text-muted-foreground leading-relaxed text-sm flex-1 overflow-hidden">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-3 pt-3.5 mt-3.5 border-t border-border/40 shrink-0">
                  <div className={`w-9 h-9 rounded-xs bg-gradient-to-br ${t.gradient} flex items-center justify-center text-primary-foreground text-xs font-semibold group-hover:scale-110 group-hover:rotate-[-3deg] transition-all duration-300 shrink-0`} aria-hidden="true">
                    {t.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">{t.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
