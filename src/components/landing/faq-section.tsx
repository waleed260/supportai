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
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/20 to-transparent dark:via-indigo-950/10" />
      <div ref={ref} className="relative max-w-3xl mx-auto px-4">
        <div className={`text-center mb-16 transition-all duration-700 ${inView ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-white/50 dark:bg-slate-800/50 text-sm text-muted-foreground mb-4">
            <Sparkles className="h-4 w-4 text-blue-500" />
            FAQ
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently asked{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              questions
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Everything you need to know about SupportAI.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={i}
                className={`rounded-2xl border transition-all duration-300 ${
                  inView ? `animate-fade-in-up delay-${(i + 1) * 100}` : 'opacity-0'
                } ${
                  isOpen
                    ? 'border-blue-200/50 dark:border-blue-500/30 bg-white dark:bg-slate-800 shadow-md'
                    : 'border-gray-200/60 dark:border-slate-700/40 bg-white/50 dark:bg-slate-800/30 hover:bg-white/80 dark:hover:bg-slate-800/50'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-sm md:text-base">{faq.q}</span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ml-4 transition-all duration-300 ${
                    isOpen
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rotate-90'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {isOpen ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
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
