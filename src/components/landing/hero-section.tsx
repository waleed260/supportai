import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, MessageSquare, BarChart3, Bot } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-gradient-to-br from-[#fff7ed] via-background to-amber-50 dark:from-background dark:via-background dark:to-[#1a1f2e]" aria-hidden="true" />

      <div className="absolute inset-0 opacity-50 dark:opacity-70" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/30 dark:bg-primary/20 blur-3xl animate-gradient-shift" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-amber-400/20 dark:bg-amber-500/20 blur-3xl animate-gradient-shift-slow" />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full bg-orange-400/20 dark:bg-orange-500/15 blur-3xl animate-gradient-shift-fast" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full bg-primary/20 dark:bg-primary/15 blur-3xl animate-glow-pulse" />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(255,255,255,0.95)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(18,24,32,0.95)_100%)]" aria-hidden="true" />

      <div className="relative max-w-6xl mx-auto px-4 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xs border border-primary/20 bg-background/50 backdrop-blur-sm text-muted-foreground mb-8 animate-fade-in-up text-sm">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
          AI-Powered Customer Support Platform
        </div>

        <h1 className="font-bold tracking-tight mb-6 animate-fade-in-up delay-100" style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(42px, 6vw, 72px)', lineHeight: 1.1 }}>
          <span className="text-foreground">
            AI Customer Support
          </span>
          <br />
          <span className="text-foreground">
            That{' '}
            <span className="text-primary relative">
              <span className="relative z-10 font-satisfy" style={{ fontFamily: 'var(--font-satisfy)', fontWeight: 400 }}>
                Actually Works
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-primary/20 dark:bg-primary/30 -rotate-1 rounded-xs" aria-hidden="true" />
            </span>
          </span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
          Deploy intelligent AI agents across WhatsApp, Instagram, Facebook, and your website.
          Automate support, capture leads, and delight customers — all from one dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300">
          <Link href="/register">
            <Button size="lg" className="text-base px-10 h-12 gap-2 rounded-xs shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200">
              Start Free Trial <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="text-base px-10 h-12 gap-2 rounded-xs">
              View Demo
            </Button>
          </Link>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-8 animate-fade-in-up delay-500">
          {[
            { value: '10K+', label: 'Conversations', icon: MessageSquare },
            { value: '500+', label: 'Companies', icon: BarChart3 },
            { value: '99.9%', label: 'Uptime', icon: Bot },
          ].map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xs bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-xl font-bold text-primary tabular-nums">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-20 max-w-4xl mx-auto animate-scale-in delay-700 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" aria-hidden="true" />
          <div className="rounded-xs border border-border/50 overflow-hidden shadow-2xl shadow-primary/10 dark:shadow-primary/5">
            <div className="h-8 bg-muted border-b border-border flex items-center px-4 gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-success" />
              <div className="ml-4 h-4 w-32 rounded-xs bg-border/50" />
            </div>
            <div className="bg-[#f8f6f3] dark:bg-[#0f1419] p-6 grid grid-cols-4 gap-4">
              <div className="col-span-1 space-y-3">
                <div className="h-3 w-16 rounded-xs bg-primary/20" />
                <div className="h-8 rounded-xs bg-border/50" />
                <div className="h-8 rounded-xs bg-border/50" />
                <div className="h-8 rounded-xs bg-primary/10" />
                <div className="h-8 rounded-xs bg-border/50" />
                <div className="h-8 rounded-xs bg-border/50" />
              </div>
              <div className="col-span-3 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-success" />
                  <div className="h-3 w-24 rounded-xs bg-border/50" />
                  <div className="h-3 w-16 rounded-xs bg-border/30 ml-auto" />
                  <div className="h-5 w-14 rounded-xs bg-primary shadow-sm shadow-primary/20" />
                </div>
                <div className="border-t border-border/50 pt-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-xs bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">SC</div>
                    <div className="flex-1">
                      <div className="h-2 w-40 rounded-xs bg-border/50" />
                      <div className="h-2 w-56 rounded-xs bg-border/30 mt-1" />
                    </div>
                    <div className="h-4 w-12 rounded-xs bg-success/20 text-[8px] font-medium text-success flex items-center justify-center">AI</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-xs bg-amber-500/20 flex items-center justify-center text-[8px] font-bold text-amber-600">MR</div>
                    <div className="flex-1">
                      <div className="h-2 w-48 rounded-xs bg-border/50" />
                      <div className="h-2 w-36 rounded-xs bg-border/30 mt-1" />
                    </div>
                    <div className="h-4 w-12 rounded-xs bg-success/20 text-[8px] font-medium text-success flex items-center justify-center">AI</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-xs bg-emerald-500/20 flex items-center justify-center text-[8px] font-bold text-emerald-600">EW</div>
                    <div className="flex-1">
                      <div className="h-2 w-36 rounded-xs bg-border/50" />
                      <div className="h-2 w-44 rounded-xs bg-border/30 mt-1" />
                    </div>
                    <div className="h-4 w-16 rounded-xs bg-amber-500/20 text-[8px] font-medium text-amber-600 flex items-center justify-center">Human</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-xs bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">JP</div>
                    <div className="flex-1">
                      <div className="h-2 w-52 rounded-xs bg-border/50" />
                      <div className="h-2 w-40 rounded-xs bg-border/30 mt-1" />
                    </div>
                    <div className="h-4 w-12 rounded-xs bg-success/20 text-[8px] font-medium text-success flex items-center justify-center">AI</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
