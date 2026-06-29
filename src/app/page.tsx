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
      <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.03] via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/[0.03] rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
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
