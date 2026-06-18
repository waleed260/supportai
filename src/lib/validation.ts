import { z } from 'zod'

const uuid = z.string().uuid()

const email = z.string().email().max(255)

export function sanitizeText(text: string, maxLen: number = 8000): string {
  return text.trim().slice(0, maxLen)
}

export const webchatSchema = z.object({
  organization_id: z.string().min(1),
  message: z.string().min(1).max(8000),
  customer_name: z.string().max(255).optional().default('Website Visitor'),
  customer_email: z.string().email().max(255).optional().nullable(),
  conversation_id: z.string().optional(),
})

export const authCallbackSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(512),
})

export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(128),
  name: z.string().min(1).max(255),
  companyName: z.string().min(1).max(255),
  companySize: z.string().max(100).optional(),
})

export const knowledgeUploadSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.string().max(50).optional(),
})

export const knowledgeProcessSchema = z.object({
  knowledge_source_id: uuid,
})

export const leadsPatchSchema = z.object({
  id: uuid,
  status: z.string().max(50).optional(),
  assigned_to: z.string().max(255).optional(),
})

export const escalationsPatchSchema = z.object({
  id: uuid,
  status: z.string().max(50).optional(),
  resolved_by: z.string().max(255).optional(),
})

export const conversationsPostSchema = z.object({
  channel: z.string().max(50).optional(),
  customer_name: z.string().max(255).optional(),
  customer_email: z.string().email().max(255).optional().nullable(),
  customer_phone: z.string().max(50).optional(),
})

export const conversationsPatchSchema = z.object({
  status: z.string().max(50).optional(),
  customer_name: z.string().max(255).optional(),
  customer_email: z.string().email().max(255).optional().nullable(),
  customer_phone: z.string().max(50).optional(),
  sentiment: z.string().max(50).optional(),
  lead_status: z.string().max(50).optional(),
  assigned_to: z.string().max(255).optional(),
}).passthrough()

export const messagesPostSchema = z.object({
  conversation_id: uuid,
  role: z.enum(['customer', 'assistant', 'agent', 'system']).optional(),
  content: z.string().max(8000).optional(),
}).passthrough()

export const integrationsPostSchema = z.object({
  provider: z.string().min(1).max(100),
  credentials: z.record(z.string(), z.unknown()).optional().default({}),
  settings: z.record(z.string(), z.unknown()).optional().default({}),
})

export const integrationsPatchSchema = z.object({
  provider: z.string().min(1).max(100),
  is_enabled: z.boolean().optional(),
  credentials: z.record(z.string(), z.unknown()).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
})

export const channelsPostSchema = z.object({
  channel: z.string().min(1).max(50),
  name: z.string().max(255).optional(),
  credentials: z.record(z.string(), z.unknown()).optional(),
  webhook_url: z.string().max(500).optional().nullable(),
  config: z.record(z.string(), z.unknown()).optional().default({}),
})

export const channelsPatchSchema = z.object({
  channel: z.string().min(1).max(50),
  is_connected: z.boolean().optional(),
  credentials: z.record(z.string(), z.unknown()).optional(),
  webhook_url: z.string().max(500).optional().nullable(),
  config: z.record(z.string(), z.unknown()).optional(),
})

export const createCheckoutSchema = z.object({
  price_id: z.string().min(1).max(255),
  interval: z.string().max(50).optional(),
})

export const webchatConfigSchema = z.object({
  organization_id: z.string().min(1),
})
