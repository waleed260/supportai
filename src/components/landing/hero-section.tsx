import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-gradient-to-br from-[#fff7ed] via-background to-amber-50 dark:from-background dark:via-background dark:to-[#1a1f2e]" aria-hidden="true" />

      <div className="absolute inset-0 opacity-40 dark:opacity-60" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/30 dark:bg-primary/20 blur-3xl animate-gradient-shift" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-amber-400/20 dark:bg-amber-500/20 blur-3xl animate-gradient-shift-slow" />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full bg-orange-400/20 dark:bg-orange-500/15 blur-3xl animate-gradient-shift-fast" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full bg-primary/20 dark:bg-primary/15 blur-3xl animate-gradient-shift" style={{ animationDelay: '-5s' }} />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(255,255,255,0.9)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(18,24,32,0.9)_100%)]" aria-hidden="true" />

      <div className="relative max-w-6xl mx-auto px-4 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xs border border-primary/20 bg-background/50 backdrop-blur-sm text-muted-foreground mb-8 animate-fade-in-up text-sm">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
          AI-Powered Customer Support Platform
        </div>

        <h1 className="text-3xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-[1.15] mb-6 animate-fade-in-up delay-100" style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(36px, 6vw, 64px)' }}>
          <span className="text-foreground">
            AI Customer Support
          </span>
          <br />
          <span className="text-foreground">
            That{' '}
            <span className="text-primary font-satisfy" style={{ fontFamily: 'var(--font-satisfy)', fontWeight: 400 }}>
              Actually Works
            </span>
          </span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
          Deploy intelligent AI agents across WhatsApp, Instagram, Facebook, and your website.
          Automate support, capture leads, and delight customers — all from one dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300">
          <Link href="/register">
            <Button size="lg" className="text-base px-10 h-12 gap-2 rounded-xs shadow-lg shadow-primary/25">
              Start Free Trial <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="text-base px-10 h-12 gap-2 rounded-xs">
              View Demo
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in-up delay-500">
          {[
            { value: '10K+', label: 'Conversations' },
            { value: '500+', label: 'Companies' },
            { value: '99.9%', label: 'Uptime' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
