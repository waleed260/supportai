'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { TimelineContent } from "@/components/ui/timeline-animation"
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal"
import { cn } from "@/lib/utils"
import NumberFlow from "@number-flow/react"
import { Bot, CheckCheck, MessageSquare, Users, Database, Globe, Shield } from "lucide-react"
import { motion } from "motion/react"
import { useRef, useState } from "react"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    description: "Great for small businesses and startups looking to get started with AI support",
    monthlyPrice: 29,
    yearlyPrice: 290,
    buttonText: "Get started",
    buttonVariant: "outline" as const,
    features: [
      { text: "500 conversations/mo", icon: <MessageSquare size={20} /> },
      { text: "1 team seat", icon: <Users size={20} /> },
      { text: "Web Chat + WhatsApp", icon: <Globe size={20} /> },
    ],
    includes: [
      "Free includes:",
      "AI-powered responses",
      "Knowledge base (5 docs)",
      "Basic analytics dashboard",
      "Email support",
      "Standard response templates",
    ],
    popular: false,
  },
  {
    name: "Growth",
    description: "Best value for growing businesses that need multi-channel AI support",
    monthlyPrice: 99,
    yearlyPrice: 990,
    buttonText: "Start Free Trial",
    buttonVariant: "default" as const,
    popular: true,
    features: [
      { text: "2,000 conversations/mo", icon: <MessageSquare size={20} /> },
      { text: "3 team seats", icon: <Users size={20} /> },
      { text: "All channels + Instagram + Facebook", icon: <Globe size={20} /> },
    ],
    includes: [
      "Everything in Starter, plus:",
      "Lead capture & scoring",
      "Sentiment analysis",
      "Knowledge base (20 docs)",
      "Advanced analytics",
      "Priority email support",
    ],
  },
  {
    name: "Enterprise",
    description: "Advanced plan with unlimited access and premium features for large teams",
    monthlyPrice: 299,
    yearlyPrice: 2990,
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
    features: [
      { text: "10,000 conversations/mo", icon: <MessageSquare size={20} /> },
      { text: "50 team seats", icon: <Users size={20} /> },
      { text: "All channels + Email & Telegram", icon: <Globe size={20} /> },
    ],
    includes: [
      "Everything in Growth, plus:",
      "Unlimited knowledge base",
      "Custom AI training",
      "SOC 2 compliance",
      "Dedicated account manager",
      "99.99% uptime SLA",
    ],
    popular: false,
  },
]

function PricingSwitch({
  onSwitch,
  className,
}: {
  onSwitch: (value: string) => void
  className?: string
}) {
  const [selected, setSelected] = useState("0")

  return (
    <div className={cn("flex justify-center", className)}>
      <div className="relative z-10 mx-auto flex w-fit rounded-xl bg-muted/50 border border-border p-1">
        <button
          onClick={() => { setSelected("0"); onSwitch("0") }}
          className={cn(
            "relative z-10 w-fit cursor-pointer h-12 rounded-xl sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors sm:text-base text-sm",
            selected === "0" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {selected === "0" && (
            <motion.span
              layoutId="pricing-switch"
              className="absolute inset-0 h-full w-full rounded-xl border-2 shadow-sm shadow-primary/30 border-primary bg-primary"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">Monthly Billing</span>
        </button>

        <button
          onClick={() => { setSelected("1"); onSwitch("1") }}
          className={cn(
            "relative z-10 w-fit cursor-pointer h-12 flex-shrink-0 rounded-xl sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors sm:text-base text-sm",
            selected === "1" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {selected === "1" && (
            <motion.span
              layoutId="pricing-switch"
              className="absolute inset-0 h-full w-full rounded-xl border-2 shadow-sm shadow-primary/30 border-primary bg-primary"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">
            Yearly Billing
            <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
              Save ~17%
            </span>
          </span>
        </button>
      </div>
    </div>
  )
}

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)
  const pricingRef = useRef<HTMLDivElement>(null)

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.4,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  }

  return (
    <section id="pricing" className="pt-20 pb-24 relative min-h-screen max-w-7xl mx-auto px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#fff7ed]/30 to-transparent dark:via-background pointer-events-none" aria-hidden="true" />

      <article className="text-left mb-6 space-y-4 max-w-2xl relative">
        <h2 className="md:text-5xl text-4xl capitalize font-medium text-foreground mb-4">
          <VerticalCutReveal
            splitBy="words"
            staggerDuration={0.15}
            staggerFrom="first"
            reverse
            containerClassName="justify-start"
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 40,
              delay: 0,
            }}
          >
            We've got a plan that's perfect for you
          </VerticalCutReveal>
        </h2>

        <TimelineContent
          as="p"
          animationNum={0}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="md:text-base text-sm text-muted-foreground w-[80%]"
        >
          Trusted by hundreds of companies. Start with a free trial — no credit card required. Upgrade when you grow.
        </TimelineContent>

        <TimelineContent
          as="div"
          animationNum={1}
          timelineRef={pricingRef}
          customVariants={revealVariants}
        >
          <PricingSwitch onSwitch={(v) => setIsYearly(Number.parseInt(v) === 1)} className="w-fit" />
        </TimelineContent>
      </article>

      <div className="grid md:grid-cols-3 gap-6 py-6">
        {plans.map((plan, index) => {
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice

          return (
            <TimelineContent
              key={plan.name}
              as="div"
              animationNum={2 + index}
              timelineRef={pricingRef}
              customVariants={revealVariants}
            >
              <Card
                className={cn(
                  "relative border",
                  plan.popular
                    ? "ring-2 ring-primary bg-card shadow-xl shadow-primary/10"
                    : "bg-card/60"
                )}
              >
                <CardHeader className="text-left">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="xl:text-2xl md:text-xl text-2xl font-semibold text-foreground mb-2">
                        {plan.name}
                      </h3>
                      <p className="xl:text-sm md:text-xs text-sm text-muted-foreground mb-4">
                        {plan.description}
                      </p>
                    </div>
                    {plan.popular && (
                      <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium shrink-0 ml-4">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline mt-2">
                    <span className="text-4xl font-semibold text-foreground">
                      $
                      <NumberFlow
                        value={price}
                        className="text-4xl font-semibold"
                      />
                    </span>
                    <span className="text-muted-foreground ml-1.5">
                      /{isYearly ? "year" : "month"}
                    </span>
                  </div>
                  {isYearly && (
                    <p className="text-xs text-primary font-medium mt-1">
                      ${plan.yearlyPrice}/year billed annually
                    </p>
                  )}
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                  <Link href="/register">
                    <button
                      className={cn(
                        "w-full mb-2 p-3.5 text-lg rounded-xl font-medium transition-all duration-200",
                        plan.popular
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
                          : "bg-foreground text-background hover:bg-foreground/90 shadow-lg shadow-foreground/10"
                      )}
                    >
                      {plan.buttonText}
                    </button>
                  </Link>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <h4 className="font-semibold text-base text-foreground mb-3 uppercase tracking-wide">
                      Features
                    </h4>
                    <h5 className="font-medium text-sm text-muted-foreground mb-3">
                      {plan.includes[0]}
                    </h5>
                    <ul className="space-y-2.5">
                      {plan.includes.slice(1).map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <span className="h-6 w-6 bg-background border border-primary/40 rounded-full grid place-content-center mt-0.5 mr-3 shrink-0">
                            <CheckCheck className="h-3.5 w-3.5 text-primary" />
                          </span>
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <span className="text-primary shrink-0">{feature.icon}</span>
                        <span className="text-muted-foreground">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TimelineContent>
          )
        })}
      </div>
    </section>
  )
}
