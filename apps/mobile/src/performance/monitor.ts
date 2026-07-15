import { performanceBudget } from '@supportai/config'
import { captureError } from '../analytics/sentry'

const marks: Record<string, number> = {}

export function startMark(name: string) {
  marks[name] = performance.now()
}

export function endMark(name: string): number {
  const start = marks[name]
  if (!start) return 0
  const duration = performance.now() - start
  delete marks[name]
  return duration
}

export function measureApiCall(endpoint: string, duration: number) {
  if (duration > performanceBudget.apiLatencyMs) {
    console.warn(`[Performance] API ${endpoint} took ${duration}ms (budget: ${performanceBudget.apiLatencyMs}ms)`)
  }
}

export function measureScreenRender(screenName: string, duration: number) {
  if (duration > 500) {
    console.warn(`[Performance] Screen ${screenName} render took ${duration}ms`)
  }
}

export function getMemoryUsage(): Promise<{ used: number; total: number }> {
  return new Promise((resolve) => {
    const mem = (process as any).memoryUsage?.()
    resolve({
      used: mem?.heapUsed ?? 0,
      total: mem?.heapTotal ?? 0,
    })
  })
}
