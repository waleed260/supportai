import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Bot, Sparkles } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950" />

      <div className="absolute inset-0 opacity-40 dark:opacity-60">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-blue-400/30 dark:bg-blue-500/20 blur-3xl animate-gradient-shift" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-indigo-400/20 dark:bg-indigo-500/20 blur-3xl animate-gradient-shift-slow" />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full bg-purple-400/20 dark:bg-purple-500/15 blur-3xl animate-gradient-shift-fast" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full bg-pink-300/20 dark:bg-pink-500/15 blur-3xl animate-gradient-shift" style={{ animationDelay: '-5s' }} />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(255,255,255,0.8)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)]" />

      <div className="relative max-w-6xl mx-auto px-4 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-sm text-muted-foreground mb-8 animate-fade-in-up">
          <Sparkles className="h-4 w-4 text-blue-500" />
          AI-Powered Customer Support Platform
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] mb-6 animate-fade-in-up delay-100">
          <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            AI Customer Support
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
            That Actually Works
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
          Deploy intelligent AI agents across WhatsApp, Instagram, Facebook, and your website.
          Automate support, capture leads, and delight customers — all from one dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300">
          <Link href="/register">
            <Button size="lg" className="text-base px-8 h-12 gap-2 shadow-lg shadow-blue-500/25 dark:shadow-blue-500/20">
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="text-base px-8 h-12 gap-2 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
              <Bot className="h-4 w-4" /> View Demo
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
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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
