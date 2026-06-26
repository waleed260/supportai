import { Ratelimit } from '@upstash/ratelimit'
import type { Duration } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

function parseEnv(key: string, fallback: number): number {
  const val = process.env[key]
  if (val) {
    const n = parseInt(val, 10)
    if (!isNaN(n) && n > 0) return n
  }
  return fallback
}

function msToDuration(ms: number): Duration {
  if (ms % (60 * 1000) === 0) return `${ms / 60000} m` as Duration
  if (ms % 1000 === 0) return `${ms / 1000} s` as Duration
  return `${ms} ms` as Duration
}

function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (url && token) {
    return new Redis({ url, token })
  }
  return null
}

let redisClient: Redis | null = null
let memoryStore: Ratelimit | null = null

const memRequestCounts = new Map<string, { count: number; resetAt: number }>()

function inMemoryRatelimit(limit: number, windowMs: number) {
  return async (identifier: string): Promise<{ success: boolean; remaining: number; reset: number }> => {
    const now = Date.now()
    const key = `${limit}:${windowMs}:${identifier}`
    const entry = memRequestCounts.get(key)
    if (!entry || now >= entry.resetAt) {
      memRequestCounts.set(key, { count: 1, resetAt: now + windowMs })
      return { success: true, remaining: limit - 1, reset: now + windowMs }
    }
    if (entry.count >= limit) {
      return { success: false, remaining: 0, reset: entry.resetAt }
    }
    entry.count++
    return { success: true, remaining: limit - entry.count, reset: entry.resetAt }
  }
}

type LimitFn = (identifier: string) => Promise<{ success: boolean; remaining: number; reset: number }>

export function createLimiter(
  envLimitKey: string,
  envWindowKey: string,
  defaultLimit: number,
  defaultWindowMs: number,
): LimitFn {
  const limit = parseEnv(envLimitKey, defaultLimit)
  const windowMs = parseEnv(envWindowKey, defaultWindowMs)

  const redis = redisClient || (redisClient = getRedisClient())
  if (redis) {
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, msToDuration(windowMs)),
      prefix: 'supportai',
      analytics: true,
    })
    return async (identifier: string) => {
      const result = await ratelimit.limit(identifier)
      return {
        success: result.success,
        remaining: result.remaining,
        reset: Date.now() + windowMs,
      }
    }
  }

  return inMemoryRatelimit(limit, windowMs)
}

const PROGRESSIVE_DELAYS = [1000, 2000, 5000, 30_000]
const LOCKOUT_DURATION = 15 * 60 * 1000

type LockoutEntry = {
  count: number
  lockUntil: number
  lastAttemptAt: number
}

const accountLockouts = new Map<string, LockoutEntry>()

export interface AccountLockoutResult {
  locked: boolean
  remainingAttempts: number
}

export function checkAccountLockout(identifier: string): AccountLockoutResult {
  const now = Date.now()
  const entry = accountLockouts.get(identifier)
  if (!entry) return { locked: false, remainingAttempts: 5 }
  if (now < entry.lockUntil) {
    return { locked: true, remainingAttempts: 0 }
  }
  if (now >= entry.lockUntil && entry.count >= 5) {
    accountLockouts.delete(identifier)
    return { locked: false, remainingAttempts: 5 }
  }
  const delayIndex = Math.min(entry.count - 1, PROGRESSIVE_DELAYS.length - 1)
  const delayMs = PROGRESSIVE_DELAYS[delayIndex] ?? 0
  const waitUntil = entry.lastAttemptAt + delayMs
  if (now < waitUntil) {
    return { locked: true, remainingAttempts: Math.max(0, 5 - entry.count) }
  }
  return { locked: false, remainingAttempts: Math.max(0, 5 - entry.count) }
}

export function recordFailedAttempt(identifier: string): { remainingAttempts: number; locked: boolean } {
  const now = Date.now()
  const entry = accountLockouts.get(identifier) || { count: 0, lockUntil: 0, lastAttemptAt: 0 }
  entry.count++
  entry.lastAttemptAt = now
  if (entry.count >= 5) {
    entry.lockUntil = now + LOCKOUT_DURATION
  }
  accountLockouts.set(identifier, entry)
  return { remainingAttempts: Math.max(0, 5 - entry.count), locked: entry.count >= 5 }
}

export function resetAccountLockout(identifier: string): void {
  accountLockouts.delete(identifier)
}

export const limiters = {
  chat: createLimiter('RATE_LIMIT_CHAT', 'RATE_LIMIT_CHAT_WINDOW', 20, 60_000),
  webhook: createLimiter('RATE_LIMIT_WEBHOOK', 'RATE_LIMIT_WEBHOOK_WINDOW', 60, 60_000),
  knowledgeUpload: createLimiter('RATE_LIMIT_KNOWLEDGE_UPLOAD', 'RATE_LIMIT_KNOWLEDGE_UPLOAD_WINDOW', 10, 60_000),
  knowledgeProcess: createLimiter('RATE_LIMIT_KNOWLEDGE_PROCESS', 'RATE_LIMIT_KNOWLEDGE_PROCESS_WINDOW', 10, 60_000),
  auth: createLimiter('RATE_LIMIT_AUTH', 'RATE_LIMIT_AUTH_WINDOW', 10, 900_000),
  api: createLimiter('RATE_LIMIT_API', 'RATE_LIMIT_API_WINDOW', 60, 60_000),
}
