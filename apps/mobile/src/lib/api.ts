import { getApiBaseUrl, supabase } from './supabase'
import type { Conversation, Lead, Escalation, DashboardMetrics, AIAgent, Membership, SubscriptionPlan } from '../types'

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }
  return headers
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const base = getApiBaseUrl()
  const headers = await getAuthHeaders()
  const res = await fetch(`${base}${path}`, { ...options, headers: { ...headers, ...options?.headers } })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`API ${res.status}: ${body}`)
  }
  return res.json()
}

export const api = {
  async getMemberships(): Promise<Membership[]> {
    const { data, error } = await supabase
      .from('memberships')
      .select('*, organization:organizations(*)')
      .eq('is_active', true)
    if (error) throw error
    return data ?? []
  },

  async getConversations(orgId: string): Promise<Conversation[]> {
    return fetchApi(`/conversations?organization_id=${orgId}`)
  },

  async getConversation(id: string): Promise<Conversation> {
    return fetchApi(`/conversations/${id}`)
  },

  async sendMessage(conversationId: string, content: string) {
    return fetchApi('/messages', {
      method: 'POST',
      body: JSON.stringify({ conversation_id: conversationId, content, role: 'agent' }),
    })
  },

  async takeOverConversation(id: string) {
    return fetchApi(`/conversations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'escalated', assigned_to: 'me' }),
    })
  },

  async getLeads(orgId: string): Promise<Lead[]> {
    return fetchApi(`/leads?organization_id=${orgId}`)
  },

  async updateLeadStatus(id: string, status: string) {
    return fetchApi('/leads', {
      method: 'PATCH',
      body: JSON.stringify({ id, status }),
    })
  },

  async getEscalations(orgId: string): Promise<Escalation[]> {
    return fetchApi(`/escalations?organization_id=${orgId}`)
  },

  async resolveEscalation(id: string) {
    return fetchApi('/escalations', {
      method: 'PATCH',
      body: JSON.stringify({ id, status: 'resolved', resolved_by: 'me' }),
    })
  },

  async getMetrics(orgId: string): Promise<DashboardMetrics> {
    return fetchApi(`/analytics?organization_id=${orgId}`)
  },

  async getAgent(orgId: string): Promise<AIAgent> {
    const { data, error } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('organization_id', orgId)
      .single()
    if (error) throw error
    return data
  },

  async updateAgent(orgId: string, agent: Partial<AIAgent>) {
    const { data, error } = await supabase
      .from('ai_agents')
      .update(agent)
      .eq('organization_id', orgId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getPlans(): Promise<SubscriptionPlan[]> {
    return fetchApi('/billing')
  },

  async register(email: string, password: string, name: string, companyName: string, companySize?: string) {
    const base = getApiBaseUrl()
    const res = await fetch(`${base}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, companyName, companySize }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Registration failed')
    return data
  },

  async registerDeviceToken(expoPushToken: string, platform: string, organizationId: string) {
    return fetchApi('/notifications/register-device', {
      method: 'POST',
      body: JSON.stringify({ expo_push_token: expoPushToken, platform, organization_id: organizationId }),
    })
  },

  async fetchNotificationPreferences(orgId: string): Promise<{ preferences: { escalation_alerts: boolean; usage_alerts: boolean; billing_alerts: boolean } }> {
    return fetchApi(`/notifications/preferences?organization_id=${orgId}`)
  },

  async updateNotificationPreferences(orgId: string, prefs: { escalation_alerts?: boolean; usage_alerts?: boolean; billing_alerts?: boolean }) {
    return fetchApi('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify({ organization_id: orgId, ...prefs }),
    })
  },
}
