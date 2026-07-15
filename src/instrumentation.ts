import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }
}

export function onRequestError(error: Error, request: unknown, context: unknown) {
  Sentry.captureException(error, {
    tags: {
      route: typeof request === 'object' && request !== null ? (request as Record<string, unknown>).url as string || 'unknown' : 'unknown',
      phase: (context as Record<string, unknown>).phase as string || undefined,
    },
  })
}
