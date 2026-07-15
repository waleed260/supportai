const REDACTED = '[REDACTED]'

const patternsToRedact = [
  /password/i,
  /secret/i,
  /token/i,
  /auth/i,
  /authorization/i,
  /api.?key/i,
  /access.?key/i,
  /refresh.?token/i,
  /session/i,
  /ssn/i,
  /credit.?card/i,
  /cvv/i,
  /pin/i,
]

export function sanitizeForLogging(key: string, value: unknown): unknown {
  if (typeof value === 'string') {
    for (const pattern of patternsToRedact) {
      if (pattern.test(key)) return REDACTED
    }
  }
  return value
}

export function createSecureLogger(tag: string) {
  return {
    info: (message: string, data?: Record<string, unknown>) => {
      const sanitized = data
        ? Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, sanitizeForLogging(k, v)])
          )
        : undefined
      console.log(`[${tag}] ${message}`, sanitized ?? '')
    },
    warn: (message: string, data?: Record<string, unknown>) => {
      const sanitized = data
        ? Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, sanitizeForLogging(k, v)])
          )
        : undefined
      console.warn(`[${tag}] ${message}`, sanitized ?? '')
    },
    error: (message: string, error?: unknown, data?: Record<string, unknown>) => {
      const sanitized = data
        ? Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, sanitizeForLogging(k, v)])
          )
        : undefined
      console.error(`[${tag}] ${message}`, error, sanitized ?? '')
    },
  }
}

export const logger = createSecureLogger('SupportAI')
