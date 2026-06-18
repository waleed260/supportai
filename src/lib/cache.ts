import { Redis } from '@upstash/redis'

let redisClient: Redis | null = null

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (url && token) {
    if (!redisClient) {
      redisClient = new Redis({ url, token })
    }
    return redisClient
  }
  return null
}

const memCache = new Map<string, { value: unknown; expiresAt: number }>()

function memGet<T>(key: string): T | null {
  const entry = memCache.get(key)
  if (!entry || Date.now() >= entry.expiresAt) {
    memCache.delete(key)
    return null
  }
  return entry.value as T
}

function memSet(key: string, value: unknown, ttlSeconds: number) {
  memCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
}

function memDel(key: string) {
  memCache.delete(key)
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis()
  if (redis) {
    const raw = await redis.get<string>(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  }
  return memGet<T>(key)
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number) {
  const redis = getRedis()
  if (redis) {
    await redis.set(key, JSON.stringify(value), { ex: ttlSeconds })
  } else {
    memSet(key, value, ttlSeconds)
  }
}

export async function cacheDel(key: string) {
  const redis = getRedis()
  if (redis) {
    await redis.del(key)
  } else {
    memDel(key)
  }
}

export async function cachedQuery<T>(
  cacheKey: string,
  ttlSeconds: number,
  query: () => Promise<T | null>,
): Promise<T | null> {
  const cached = await cacheGet<T>(cacheKey)
  if (cached !== null) return cached

  const result = await query()
  if (result !== null && result !== undefined) {
    await cacheSet(cacheKey, result, ttlSeconds)
  }
  return result
}
