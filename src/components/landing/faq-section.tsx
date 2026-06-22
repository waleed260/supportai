'use client'

import { Plus, X, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useInView } from '@/hooks/use-in-view'

const faqs = [
  {
    q: 'How does the AI agent work?',
    a: 'Our AI agents are powered by Claude (Anthropic) with RAG (Retrieval Augmented Generation) from your knowledge base. They understand context, learn from your existing conversations, and provide accurate, on-brand responses automatically.',
  },
  {
    q: 'Can I integrate with my existing tools?',
    a: 'Yes! SupportAI integrates with WhatsApp, Instagram, Facebook Messenger, and your website. We also support HubSpot, Salesforce, Zoho, and Google Sheets for CRM sync. More integrations are added regularly.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Absolutely. Start with a 14-day free trial on any plan — no credit card required. You get full access to all features during the trial period. Cancel anytime with one click.',
  },
  {
    q: 'How is pricing calculated?',
    a: 'Pricing is based on your plan tier and the number of conversations per month. All plans include unlimited team members within the seat limit. Annual billing saves you approximately 17% compared to monthly.',
  },
  {
    q: 'Is my data secure?',
    a: 'Security is our top priority. SupportAI is SOC 2 compliant, uses end-to-end encryption, and is GDPR ready. Your data is stored securely on Supabase infrastructure and never used to train AI models.',
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const { ref, inView } = useInView(0.1)

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#fff7ed]/20 to-transparent dark:via-background" aria-hidden="true" />
      <div ref={ref} className="relative max-w-3xl mx-auto px-4">
        <div className={`text-center mb-16 transition-all duration-400 ${inView ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xs border border-primary/20 bg-background/50 text-muted-foreground mb-4 text-sm">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            FAQ
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-syne)' }}>
            Frequently asked{' '}
            <span className="text-primary">questions</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Everything you need to know about SupportAI.
          </p>
        </div>

        <div className="space-y-3" role="list">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={i}
                className={`rounded-xs border transition-all duration-400 ${
                  inView ? `animate-fade-in-up delay-${(i + 1) * 100}` : 'opacity-0'
                } ${
                  isOpen
                    ? 'border-primary/30 bg-card shadow-md'
                    : 'border-border bg-card/50 hover:bg-card/80'
                }`}
                role="listitem"
              >
                <h3>
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xs"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                  >
                    <span className="font-medium text-sm md:text-base text-foreground">{faq.q}</span>
                    <div className={`w-6 h-6 rounded-xs flex items-center justify-center shrink-0 ml-4 transition-all duration-200 ${
                      isOpen ? 'bg-primary text-primary-foreground rotate-90' : 'bg-muted text-muted-foreground'
                    }`} aria-hidden="true">
                      {isOpen ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    </div>
                  </button>
                </h3>
                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  className={`overflow-hidden transition-all duration-400 ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
