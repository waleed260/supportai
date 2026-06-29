import { LandingNav } from '@/components/landing/landing-nav'
import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesBento } from '@/components/landing/features-bento'
import { StatsSection } from '@/components/landing/stats-section'

import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { FAQSection } from '@/components/landing/faq-section'
import { CTASection } from '@/components/landing/cta-section'
import PricingSection5 from '@/components/ui/pricing'
import { LandingFooter } from '@/components/landing/landing-footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient overlay for visual depth */}
      <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e14]/40 via-background to-[#1a1f2e]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,14,20,0.5)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(166,77,0,0.06),transparent_60%)]" />
      </div>
      <div className="relative z-10">
        <LandingNav />
      <HeroSection />
      <FeaturesBento />
      <StatsSection />
      <PricingSection5 />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
        <LandingFooter />
      </div>
    </div>
  )
}
