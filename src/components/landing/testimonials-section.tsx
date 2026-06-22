import { Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'CEO, Bloom Retail',
    quote: 'SupportAI transformed our customer support. We went from 12-hour response times to instant answers. Our customers noticed immediately.',
    initials: 'SC',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    name: 'Marcus Rivera',
    role: 'CTO, TechFlow',
    quote: 'The AI agents handle 80% of our inquiries autonomously. Our support team focuses on complex issues while the bot handles the rest.',
    initials: 'MR',
    gradient: 'from-indigo-500 to-purple-600',
  },
  {
    name: 'Emma Watson',
    role: 'Operations Lead, Nexus',
    quote: 'Multi-channel support was a nightmare before SupportAI. Now everything is in one place, and the analytics are incredible.',
    initials: 'EW',
    gradient: 'from-emerald-500 to-teal-600',
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/20 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-white/50 text-sm text-muted-foreground mb-4">
            Testimonials
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Loved by{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              support teams
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            See what our customers say about transforming their customer support experience.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map(t => (
            <div
              key={t.name}
              className="relative rounded-2xl border bg-white/60 backdrop-blur-sm p-8 hover:shadow-lg hover:border-blue-200/50 transition-all duration-300"
            >
              <Quote className="h-8 w-8 text-blue-200 mb-4" />
              <p className="text-muted-foreground leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-sm font-semibold`}>
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
