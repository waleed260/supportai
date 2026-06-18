type LogContext = {
  orgId?: string
  route?: string
  channel?: string
  error?: unknown
  [key: string]: unknown
}

function formatTimestamp(): string {
  return new Date().toISOString()
}

function formatExtra(ctx: LogContext): string {
  const parts: string[] = []
  if (ctx.orgId) parts.push(`org=${ctx.orgId}`)
  if (ctx.route) parts.push(`route=${ctx.route}`)
  if (ctx.channel) parts.push(`channel=${ctx.channel}`)
  for (const [k, v] of Object.entries(ctx)) {
    if (k === 'orgId' || k === 'route' || k === 'channel' || k === 'error') continue
    parts.push(`${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`)
  }
  return parts.length ? ` [${parts.join(' ')}]` : ''
}

function extractError(err: unknown): string {
  if (err instanceof Error) return err.stack || err.message
  return String(err)
}

export const log = {
  error(message: string, ctx: LogContext = {}) {
    const extra = formatExtra(ctx)
    console.error(`[${formatTimestamp()}] [ERROR]${extra} ${message}`)
    if (ctx.error) {
      console.error(`[${formatTimestamp()}] [ERROR]  └─ cause:`, ctx.error)
    }
  },

  warn(message: string, ctx: LogContext = {}) {
    const extra = formatExtra(ctx)
    console.warn(`[${formatTimestamp()}] [WARN]${extra} ${message}`)
  },

  info(message: string, ctx: LogContext = {}) {
    const extra = formatExtra(ctx)
    console.log(`[${formatTimestamp()}] [INFO]${extra} ${message}`)
  },
}

export function getRouteName(request: Request | string): string {
  if (typeof request === 'string') return request
  try {
    const url = new URL(request.url)
    return url.pathname
  } catch {
    return 'unknown'
  }
}
