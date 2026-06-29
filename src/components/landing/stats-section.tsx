'use client'

import { useInView } from '@/hooks/use-in-view'

const stats = [
  { value: 10000, suffix: '+', label: 'Conversations Automated' },
  { value: 500, suffix: '+', label: 'Active Companies' },
  { value: 50000, suffix: '+', label: 'Hours Saved' },
  { value: 99, suffix: '.9%', label: 'Platform Uptime' },
]

function formatStat(value: number, suffix: string) {
  return `${value >= 1000 ? Math.floor(value / 1000) + 'K' : value}${suffix}`
}

export function StatsSection() {
  const { ref, inView } = useInView(0.3)

  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/60 to-background" aria-hidden="true" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22%23a64d00%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/svg%3E')]" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.02] via-transparent to-primary/[0.02]" aria-hidden="true" />
      <div ref={ref} className="relative max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`transition-all duration-400 ${inView ? `animate-fade-in-up delay-${(i + 1) * 100}` : 'opacity-0 translate-y-4'}`}
            >
              <div className="text-3xl md:text-4xl font-bold mb-2 tabular-nums text-primary">
                {formatStat(stat.value, stat.suffix)}
              </div>
              <div className="text-muted-foreground text-sm md:text-base">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
