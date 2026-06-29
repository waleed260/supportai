import { LandingNav } from '@/components/landing/landing-nav'
import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesBento } from '@/components/landing/features-bento'
import { StatsSection } from '@/components/landing/stats-section'

import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { FAQSection } from '@/components/landing/faq-section'
import { CTASection } from '@/components/landing/cta-section'
import PricingSection5 from '@/components/ui/pricing'
import { LandingFooter } from '@/components/landing/landing-footer'
import { VideoBackground } from '@/components/ui/video-background'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <VideoBackground />
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
