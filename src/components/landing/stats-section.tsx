'use client'

import { useInView } from '@/hooks/use-in-view'

const stats = [
  { value: 10000, suffix: '+', label: 'Conversations Automated' },
  { value: 500, suffix: '+', label: 'Active Companies' },
  { value: 50000, suffix: '+', label: 'Hours Saved' },
  { value: 99, suffix: '.9%', label: 'Platform Uptime' },
]

export function StatsSection() {
  const { ref, inView } = useInView(0.3)

  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-[#121824] dark:bg-black" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmNTdjMDAiIGZpbGwtb3BhY2l0eT0iMC4wOCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]" />
      <div ref={ref} className="relative max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`text-white transition-all duration-700 ${inView ? `animate-fade-in-up delay-${(i + 1) * 100}` : 'opacity-0 translate-y-4'}`}
            >
              <div className="text-4xl md:text-5xl font-bold mb-2 tabular-nums text-[#f57c00]">
                {inView ? `${stat.value >= 1000 ? Math.floor(stat.value / 1000) + 'K' : stat.value}${stat.suffix}` : '0'}
              </div>
              <div className="text-white/60 text-sm md:text-base">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
