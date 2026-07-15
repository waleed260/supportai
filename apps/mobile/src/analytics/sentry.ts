import * as Sentry from '@sentry/react-native'
import { sentryTags } from '@supportai/config'
import { Platform } from 'react-native'
import Constants from 'expo-constants'

export function initSentry() {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.2,
    environment: process.env.EXPO_PUBLIC_APP_ENV || 'development',
    enableAutoPerformanceTracing: true,
    attachScreenshot: false,
    attachViewHierarchy: false,
    beforeSend(event) {
      event.tags = {
        ...event.tags,
        [sentryTags.platform]: Platform.OS,
        [sentryTags.osVersion]: Platform.Version,
        [sentryTags.appVersion]: Constants.expoConfig?.version ?? 'unknown',
        [sentryTags.buildVersion]: Constants.expoConfig?.extra?.eas?.projectId ? '1' : '0',
        [sentryTags.releaseChannel]: process.env.EXPO_PUBLIC_APP_ENV || 'development',
      }
      return event
    },
  })
}

export function setSentryUser(organizationId?: string, userId?: string) {
  Sentry.setUser(organizationId || userId ? {
    id: userId,
    ...(organizationId ? { organization_id: organizationId } : {}),
  } : null)
}

export function setSentryScreen(screenName: string) {
  Sentry.setTag(sentryTags.screen, screenName)
}

export function captureError(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    extra: {
      networkStatus: undefined,
      deviceInfo: `${Platform.OS} ${Platform.Version}`,
      ...context,
    },
  })
}

export function captureApiError(endpoint: string, status: number, body: string) {
  Sentry.captureMessage(`API Error: ${endpoint}`, {
    level: 'error',
    tags: {
      [sentryTags.apiEndpoint]: endpoint,
      status_code: String(status),
    },
    extra: { responseBody: body },
  })
}
