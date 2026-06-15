import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-xl font-bold text-blue-600">SupportAI</div>
          <div className="flex items-center gap-4">
            <Link href="/login"><Button variant="ghost">Sign In</Button></Link>
            <Link href="/register"><Button>Get Started</Button></Link>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 pt-24 pb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          AI Customer Support
          <span className="text-blue-600"> That Actually Works</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Deploy intelligent AI agents across WhatsApp, Instagram, Facebook, and your website.
          Automate support, capture leads, and delight customers.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register"><Button size="lg" className="text-lg px-8">Start Free Trial</Button></Link>
          <Link href="/login"><Button size="lg" variant="outline" className="text-lg px-8">View Demo</Button></Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-20 grid md:grid-cols-3 gap-8">
        {[
          { title: 'Multi-Channel', desc: 'WhatsApp, Instagram, Facebook, Web Chat — unified inbox' },
          { title: 'AI-Powered', desc: 'Claude-powered agents with RAG from your knowledge base' },
          { title: 'Smart Analytics', desc: 'Sentiment tracking, lead scoring, and performance metrics' },
        ].map(f => (
          <div key={f.title} className="p-6 bg-white rounded-xl border shadow-sm hover:shadow-md transition">
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} SupportAI. All rights reserved.
      </footer>
    </div>
  )
}
