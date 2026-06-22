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
      <div className="absolute inset-0 bg-foreground dark:bg-black" aria-hidden="true" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmNTdjMDAiIGZpbGwtb3BhY2l0eT0iMC4wOCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]" aria-hidden="true" />
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
