import { analyticsEvents } from '@supportai/config'

type AnalyticsProvider = {
  track: (event: string, properties?: Record<string, unknown>) => void
  identify: (userId: string, traits?: Record<string, unknown>) => void
  reset: () => void
}

let provider: AnalyticsProvider | null = null

export function initAnalytics(prov: AnalyticsProvider) {
  provider = prov
}

export function trackEvent(name: string, properties?: Record<string, unknown>) {
  provider?.track(name, {
    ...properties,
    timestamp: new Date().toISOString(),
  })
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  provider?.identify(userId, traits)
}

export function resetAnalytics() {
  provider?.reset()
}

export const analytics = {
  login: (method: string) => trackEvent(analyticsEvents.LOGIN, { method }),
  logout: () => trackEvent(analyticsEvents.LOGOUT),
  register: (method: string) => trackEvent(analyticsEvents.REGISTER, { method }),
  conversationOpened: (id: string, channel: string) =>
    trackEvent(analyticsEvents.CONVERSATION_OPENED, { conversation_id: id, channel }),
  replySent: (conversationId: string, role: string) =>
    trackEvent(analyticsEvents.REPLY_SENT, { conversation_id: conversationId, role }),
  pushOpened: (notificationType: string) =>
    trackEvent(analyticsEvents.PUSH_OPENED, { type: notificationType }),
  offlineMode: () => trackEvent(analyticsEvents.OFFLINE_MODE),
  leadViewed: (id: string, status: string) =>
    trackEvent(analyticsEvents.LEAD_VIEWED, { lead_id: id, status }),
  analyticsViewed: (orgId: string) =>
    trackEvent(analyticsEvents.ANALYTICS_VIEWED, { organization_id: orgId }),
  settingsChanged: (setting: string, value: unknown) =>
    trackEvent(analyticsEvents.SETTINGS_CHANGED, { setting, value }),
  errorOccurred: (error: string, context?: string) =>
    trackEvent(analyticsEvents.ERROR_OCCURRED, { error, context }),
  syncStarted: () => trackEvent(analyticsEvents.SYNC_STARTED),
  syncCompleted: (duration: number, opsCount: number) =>
    trackEvent(analyticsEvents.SYNC_COMPLETED, { duration_ms: duration, operations: opsCount }),
  syncFailed: (error: string) =>
    trackEvent(analyticsEvents.SYNC_FAILED, { error }),
  searchPerformed: (query: string, resultCount: number) =>
    trackEvent(analyticsEvents.SEARCH_PERFORMED, { query, result_count: resultCount }),
  deepLinkOpened: (url: string) =>
    trackEvent(analyticsEvents.DEEP_LINK_OPENED, { url }),
}
