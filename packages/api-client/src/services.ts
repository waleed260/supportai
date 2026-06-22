import type { ApiClientConfig } from './client'
import { createApiClient, ApiError, NetworkError, TimeoutError } from './client'
import type {
  Conversation, Lead, Escalation, DashboardMetrics, AIAgent,
  Membership, SubscriptionPlan, NotificationPreferences,
} from '@supportai/types'

export function createConversationService(config: ApiClientConfig) {
  const client = createApiClient(config)

  return {
    list: (orgId: string, signal?: AbortSignal) =>
      client.get<Conversation[]>(`/conversations?organization_id=${orgId}`, signal),
    get: (id: string) =>
      client.get<Conversation>(`/conversations/${id}`),
    update: (id: string, data: Partial<Conversation>) =>
      client.patch<Conversation>(`/conversations/${id}`, data),
    takeOver: (id: string) =>
      client.patch<Conversation>(`/conversations/${id}`, { status: 'escalated', assigned_to: 'me' }),
  }
}

export function createMessageService(config: ApiClientConfig) {
  const client = createApiClient(config)

  return {
    send: (conversationId: string, content: string, role: string = 'agent') =>
      client.post<{ id: string }>('/messages', { conversation_id: conversationId, content, role }),
    list: (conversationId: string) =>
      client.get<{ messages: import('@supportai/types').Message[] }>(`/messages?conversation_id=${conversationId}`),
  }
}

export function createLeadService(config: ApiClientConfig) {
  const client = createApiClient(config)

  return {
    list: (orgId: string) =>
      client.get<Lead[]>(`/leads?organization_id=${orgId}`),
    update: (id: string, status: string) =>
      client.patch<Lead>('/leads', { id, status }),
    get: (id: string) =>
      client.get<Lead>(`/leads/${id}`),
  }
}

export function createEscalationService(config: ApiClientConfig) {
  const client = createApiClient(config)

  return {
    list: (orgId: string) =>
      client.get<Escalation[]>(`/escalations?organization_id=${orgId}`),
    resolve: (id: string) =>
      client.patch<Escalation>('/escalations', { id, status: 'resolved', resolved_by: 'me' }),
  }
}

export function createAnalyticsService(config: ApiClientConfig) {
  const client = createApiClient(config)

  return {
    getMetrics: (orgId: string) =>
      client.get<DashboardMetrics>(`/analytics?organization_id=${orgId}`),
  }
}

export function createAgentService(config: ApiClientConfig, supabaseClient: { from: (table: string) => any }) {
  return {
    get: async (orgId: string): Promise<AIAgent> => {
      const { data, error } = await supabaseClient
        .from('ai_agents')
        .select('*')
        .eq('organization_id', orgId)
        .single()
      if (error) throw error
      return data
    },
    update: async (orgId: string, agent: Partial<AIAgent>): Promise<AIAgent> => {
      const { data, error } = await supabaseClient
        .from('ai_agents')
        .update(agent)
        .eq('organization_id', orgId)
        .select()
        .single()
      if (error) throw error
      return data
    },
  }
}

export function createMembershipService(config: ApiClientConfig, supabaseClient: { from: (table: string) => any }) {
  return {
    list: async (): Promise<Membership[]> => {
      const { data, error } = await supabaseClient
        .from('memberships')
        .select('*, organization:organizations(*)')
        .eq('is_active', true)
      if (error) throw error
      return data ?? []
    },
  }
}

export function createBillingService(config: ApiClientConfig) {
  const client = createApiClient(config)

  return {
    getPlans: () =>
      client.get<SubscriptionPlan[]>('/billing'),
    register: (email: string, password: string, name: string, companyName: string, companySize?: string) =>
      client.post('/auth/register', { email, password, name, companyName, companySize }),
  }
}

export function createNotificationService(config: ApiClientConfig) {
  const client = createApiClient(config)

  return {
    registerDevice: (expoPushToken: string, platform: string, organizationId: string) =>
      client.post('/notifications/register-device', { expo_push_token: expoPushToken, platform, organization_id: organizationId }),
    getPreferences: (orgId: string) =>
      client.get<{ preferences: NotificationPreferences }>(`/notifications/preferences?organization_id=${orgId}`),
    updatePreferences: (orgId: string, prefs: Partial<NotificationPreferences>) =>
      client.put('/notifications/preferences', { organization_id: orgId, ...prefs }),
  }
}

export { ApiError, NetworkError, TimeoutError }
