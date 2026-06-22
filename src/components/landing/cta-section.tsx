import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Rocket } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
      </div>
      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <Rocket className="h-12 w-12 text-white/30 mx-auto mb-6" />
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Ready to transform your customer support?
        </h2>
        <p className="text-lg text-blue-100/80 max-w-2xl mx-auto mb-10">
          Join 500+ companies already using SupportAI to automate support, capture leads, and delight customers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="text-base px-8 h-12 gap-2 bg-white text-blue-700 hover:bg-blue-50 shadow-xl shadow-black/20">
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="text-base px-8 h-12 gap-2 border-white/30 text-white hover:bg-white/10">
              Talk to Sales
            </Button>
          </Link>
        </div>
        <p className="text-blue-200/60 text-sm mt-6">No credit card required. 14-day free trial.</p>
      </div>
    </section>
  )
}
