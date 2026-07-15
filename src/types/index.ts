export type MembershipRole = 'super_admin' | 'client_admin' | 'team_member'
export type ConversationStatus = 'active' | 'waiting' | 'resolved' | 'escalated'
export type ConversationChannel = 'web_chat' | 'whatsapp' | 'instagram' | 'facebook' | 'telegram' | 'email'
export type SentimentLabel = 'positive' | 'neutral' | 'negative' | 'frustrated' | 'high_risk'
export type KnowledgeSourceType = 'pdf' | 'docx' | 'txt' | 'website' | 'faq' | 'product_catalog'
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete' | 'incomplete_expired'

export interface Organization {
  id: string
  name: string
  slug: string
  website?: string
  logo_url?: string
  company_size?: string
  industry?: string
  is_active: boolean
  status?: string
  approved_at?: string
  approved_by?: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Membership {
  id: string
  user_id: string
  organization_id: string
  role: MembershipRole
  is_active: boolean
  created_at: string
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
  stripe_price_id_monthly?: string
  stripe_price_id_yearly?: string
  max_conversations: number
  max_seats: number
  max_knowledge_docs: number
  channels: string[]
  features: Record<string, boolean>
  is_active: boolean
}

export interface Subscription {
  id: string
  organization_id: string
  plan_id: string
  stripe_subscription_id?: string
  stripe_customer_id?: string
  status: SubscriptionStatus
  current_period_start?: string
  current_period_end?: string
  billing_interval: string
  trial_end?: string
  cancel_at_period_end: boolean
  plan?: SubscriptionPlan
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
  is_active: boolean
  lead_capture_enabled: boolean
  sales_mode_enabled: boolean
  sentiment_analysis_enabled: boolean
}

export interface KnowledgeSource {
  id: string
  organization_id: string
  name: string
  type: KnowledgeSourceType
  file_path?: string
  source_url?: string
  status: ProcessingStatus
  error_message?: string
  chunk_count: number
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  knowledge_source_id: string
  organization_id: string
  content: string
  metadata: Record<string, unknown>
  embedding?: number[]
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
  metadata: Record<string, unknown>
  messages?: Message[]
  assignee?: User
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  organization_id: string
  role: 'customer' | 'assistant' | 'agent' | 'system'
  content: string
  sentiment?: SentimentLabel
  confidence_score?: number
  metadata: Record<string, unknown>
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
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
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

export interface ChannelConnection {
  id: string
  organization_id: string
  channel: ConversationChannel
  name?: string
  is_connected: boolean
  webhook_url?: string
  webhook_verified: boolean
  created_at: string
  updated_at: string
}

export interface WidgetSettings {
  id: string
  organization_id: string
  title: string
  welcome_message: string
  primary_color: string
  position: string
  show_branding: boolean
  custom_css?: string
  is_active: boolean
}

export interface AnalyticsEvent {
  id: string
  organization_id: string
  event_type: string
  event_data: Record<string, unknown>
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
