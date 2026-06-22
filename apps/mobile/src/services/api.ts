import { supabase, getApiBaseUrl } from '../lib/supabase'
import {
  createApiClient,
  createConversationService,
  createMessageService,
  createLeadService,
  createEscalationService,
  createAnalyticsService,
  createAgentService,
  createMembershipService,
  createBillingService,
  createNotificationService,
  type ApiClientConfig,
} from '@supportai/api-client'
import { captureApiError } from '../analytics/sentry'
import { measureApiCall, startMark, endMark } from '../performance/monitor'

function createConfig(): ApiClientConfig {
  return {
    baseUrl: getApiBaseUrl(),
    getAuthToken: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      return session?.access_token ?? null
    },
    onError: (error) => {
      captureApiError(error.endpoint, error.status, error.body)
    },
    timeout: 30000,
  }
}

let config: ApiClientConfig

function getConfig() {
  if (!config) config = createConfig()
  return config
}

function withPerf<T>(name: string, fn: () => Promise<T>): Promise<T> {
  startMark(name)
  return fn().finally(() => {
    const d = endMark(name)
    measureApiCall(name, d)
  })
}

export const conversationService = {
  list: (orgId: string) => withPerf('conversations.list', () => createConversationService(getConfig()).list(orgId)),
  get: (id: string) => withPerf('conversations.get', () => createConversationService(getConfig()).get(id)),
  takeOver: (id: string) => createConversationService(getConfig()).takeOver(id),
}

export const messageService = {
  send: (conversationId: string, content: string) =>
    createMessageService(getConfig()).send(conversationId, content),
}

export const leadService = {
  list: (orgId: string) => withPerf('leads.list', () => createLeadService(getConfig()).list(orgId)),
  update: (id: string, status: string) => createLeadService(getConfig()).update(id, status),
}

export const escalationService = {
  list: (orgId: string) => withPerf('escalations.list', () => createEscalationService(getConfig()).list(orgId)),
  resolve: (id: string) => createEscalationService(getConfig()).resolve(id),
}

export const analyticsService = {
  getMetrics: (orgId: string) => withPerf('analytics.metrics', () => createAnalyticsService(getConfig()).getMetrics(orgId)),
}

export const agentService = createAgentService(getConfig(), supabase)
export const membershipService = createMembershipService(getConfig(), supabase)
export const billingService = createBillingService(getConfig())
export const notificationService = createNotificationService(getConfig())

export async function register(email: string, password: string, name: string, companyName: string, companySize?: string) {
  const base = getApiBaseUrl()
  const res = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, companyName, companySize }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Registration failed')
  return data
}

export { ApiError, NetworkError, TimeoutError } from '@supportai/api-client'
