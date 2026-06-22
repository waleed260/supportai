'use client'

import { useInView } from '@/hooks/use-in-view'

const stats = [
  { value: 10000, suffix: '+', label: 'Conversations Automated', prefix: '' },
  { value: 500, suffix: '+', label: 'Active Companies', prefix: '' },
  { value: 50000, suffix: '+', label: 'Hours Saved', prefix: '' },
  { value: 99, suffix: '.9%', label: 'Platform Uptime', prefix: '' },
]

function AnimatedStat({ value, suffix, label, inView, delay }: {
  value: number
  suffix: string
  label: string
  inView: boolean
  delay: string
}) {
  const display = value >= 1000 ? `${Math.floor(value / 1000)}K` : String(value)

  return (
    <div className={`text-center transition-all duration-700 ${inView ? `animate-fade-in-up ${delay}` : 'opacity-0 translate-y-4'}`}>
      <div className="text-4xl md:text-5xl font-bold mb-2 tabular-nums">
        {inView ? (
          <span>{display}{suffix}</span>
        ) : (
          <span>0</span>
        )}
      </div>
      <div className="text-blue-100/80 text-sm md:text-base">{label}</div>
    </div>
  )
}

export function StatsSection() {
  const { ref, inView } = useInView(0.3)

  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-900" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      <div ref={ref} className="relative max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {stats.map((stat, i) => (
            <AnimatedStat
              key={stat.label}
              {...stat}
              inView={inView}
              delay={`delay-${(i + 1) * 100}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
