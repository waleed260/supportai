export type MembershipRole = 'super_admin' | 'client_admin' | 'team_member'
export type ConversationStatus = 'active' | 'waiting' | 'resolved' | 'escalated'
export type ConversationChannel = 'web_chat' | 'whatsapp' | 'instagram' | 'facebook' | 'telegram' | 'email'
export type SentimentLabel = 'positive' | 'neutral' | 'negative' | 'frustrated' | 'high_risk'
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete' | 'incomplete_expired'
export type MessageRole = 'customer' | 'assistant' | 'agent' | 'system'
export type ThemeMode = 'system' | 'light' | 'dark'
export type FeatureFlag = 'realtime' | 'ai_memory' | 'push' | 'analytics' | 'crm' | 'beta_features'
export type NotificationType = 'escalation' | 'message' | 'lead' | 'billing' | 'system' | 'mention'

export interface Organization {
  id: string
  name: string
  slug: string
  logo_url?: string
  company_size?: string
  industry?: string
  is_active: boolean
  status?: string
  approved_at?: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  phone?: string
  locale?: string
  timezone?: string
}

export interface Membership {
  id: string
  user_id: string
  organization_id: string
  role: MembershipRole
  is_active: boolean
  organization?: Organization
  user?: User
}

export interface SubscriptionPlan {
  id: string
  name: string
  slug: string
  description?: string
  price_monthly: number
  price_yearly: number
  max_conversations: number
  max_seats: number
  max_knowledge_docs: number
  channels: string[]
  features: Record<string, boolean>
}

export interface Conversation {
  id: string
  organization_id: string
  channel: ConversationChannel
  channel_conversation_id?: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  status: ConversationStatus
  sentiment: SentimentLabel
  lead_status?: string
  assigned_to?: string
  escalated_to?: string
  escalation_reason?: string
  is_sales_mode: boolean
  messages?: Message[]
  message_preview?: string
  unread_count?: number
  last_activity_at?: string
  assignee?: User
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  organization_id: string
  role: MessageRole
  content: string
  sentiment?: SentimentLabel
  confidence_score?: number
  metadata?: Record<string, unknown>
  created_at: string
}

export interface Lead {
  id: string
  organization_id: string
  conversation_id?: string
  name?: string
  email?: string
  phone?: string
  product_interest?: string
  budget?: string
  source?: string
  status: string
  assigned_to?: string
  synced_to_crm?: boolean
  notes?: string
  score?: number
  created_at: string
  updated_at?: string
}

export interface AIAgent {
  id: string
  organization_id: string
  name: string
  personality: string
  tone_of_voice: string
  brand_guidelines?: string
  custom_instructions?: string
  model: string
  temperature: number
  lead_capture_enabled: boolean
  sales_mode_enabled: boolean
  sentiment_analysis_enabled: boolean
}

export interface Escalation {
  id: string
  conversation_id: string
  organization_id: string
  triggered_by: string
  reason?: string
  conversation_summary?: string
  issue_summary?: string
  resolved_by?: string
  resolved_at?: string
  status?: string
  created_at: string
}

export interface DashboardMetrics {
  total_conversations: number
  active_conversations: number
  avg_response_time: number
  resolution_rate: number
  escalation_rate: number
  lead_conversion_rate: number
  sentiment_breakdown: Record<string, number>
  conversations_by_channel: Record<string, number>
  conversations_over_time: { date: string; count: number }[]
}

export interface DeviceInfo {
  platform: 'ios' | 'android' | 'web'
  os_version: string
  device_name: string
  device_type: string
  app_version: string
  build_number: string
  release_channel: string
}

export interface SyncQueueItem {
  id: string
  operation: 'create' | 'update' | 'delete'
  table: string
  record_id: string
  payload: Record<string, unknown>
  status: 'pending' | 'processing' | 'failed' | 'completed'
  retry_count: number
  error?: string
  created_at: string
  updated_at: string
}

export interface NotificationPreferences {
  escalation_alerts: boolean
  message_alerts: boolean
  lead_alerts: boolean
  billing_alerts: boolean
  system_alerts: boolean
  mention_alerts: boolean
  quiet_hours_start?: string
  quiet_hours_end?: string
}

export interface AppVersion {
  current: string
  minimum_required: string
  latest: string
  force_update: boolean
  ota_update_available: boolean
}

export interface FeatureFlags {
  realtime: boolean
  ai_memory: boolean
  push: boolean
  analytics: boolean
  crm: boolean
  beta_features: boolean
  [key: string]: boolean
}

export interface AnalyticsEvent {
  name: string
  properties?: Record<string, unknown>
  timestamp?: string
}

export interface AudioAttachment {
  uri: string
  duration_ms: number
  mime_type: string
  transcribed_text?: string
}
