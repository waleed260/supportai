'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useInView } from '@/hooks/use-in-view'

export function CTASection() {
  const { ref, inView } = useInView(0.2)

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-foreground dark:bg-black" aria-hidden="true" />
      <div className="absolute inset-0 opacity-30" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-primary/40 blur-3xl animate-gradient-shift" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-amber-500/30 blur-3xl animate-gradient-shift-slow" />
      </div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmNTdjMDAiIGZpbGwtb3BhY2l0eT0iMC4wNiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]" aria-hidden="true" />
      <div ref={ref} className="relative max-w-4xl mx-auto px-4 text-center">
        <div className={`transition-all duration-400 ${inView ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xs border border-primary/30 bg-primary/10 backdrop-blur-sm text-primary-foreground/80 mb-8 text-sm">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            Get Started Today
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4" style={{ fontFamily: 'var(--font-syne)' }}>
            Ready to transform your{' '}
            <span className="text-primary">customer support</span>?
          </h2>
          <p className="text-lg text-primary-foreground/60 max-w-2xl mx-auto mb-10">
            Join 500+ companies already using SupportAI to automate support, capture leads, and delight customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-base px-10 h-12 gap-2 rounded-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-200">
                Start Free Trial <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="text-base px-10 h-12 gap-2 rounded-xs border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50">
                Talk to Sales
              </Button>
            </Link>
          </div>
          <p className="text-primary-foreground/40 text-sm mt-6">No credit card required. 14-day free trial.</p>
        </div>
      </div>
    </section>
  )
}
