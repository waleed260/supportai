import { z } from 'zod'

const uuid = z.string().uuid()

export function sanitizeText(text: string, maxLen: number = 8000): string {
  return text.trim().slice(0, maxLen)
}

export function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '').replace(/[<>]/g, '')
}

export function sanitizeInput(value: string, maxLen: number = 8000): string {
  return stripHtml(value).trim().slice(0, maxLen)
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

export const cacheInvalidateSchema = z.object({
  pattern: z.string().min(1).max(255),
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
})

export const conversationIdSchema = z.object({
  id: z.string().uuid(),
})

export const auditPostSchema = z.object({
  action: z.string().min(1).max(100),
  resourceType: z.string().max(100).optional(),
  resourceId: z.string().max(255).optional(),
  details: z.record(z.string(), z.unknown()).optional(),
})

export const adminActionSchema = z.object({
  action: z.enum(['approve_client', 'suspend_client', 'reject_client', 'reopen_client']),
  target_organization_id: z.string().min(1).max(255),
})

export const knowledgeSourceCreateSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.string().max(50).optional(),
  source_url: z.string().max(500).optional().nullable(),
})

export const membershipsPostSchema = z
  .object({
    user_id: z.string().uuid().optional(),
    email: z.string().email().max(255).optional(),
    role: z.enum(['super_admin', 'client_admin', 'team_member']).optional(),
  })
  .refine((data) => data.user_id || data.email, {
    message: 'user_id or email is required',
    path: ['user_id'],
  })

export const widgetSettingsPatchSchema = z.object({
  title: z.string().max(255).optional(),
  welcome_message: z.string().max(2000).optional(),
  primary_color: z.string().max(50).optional(),
})

export const notificationPreferencesSchema = z.object({
  organization_id: z.string().min(1).max(255),
  escalation_alerts: z.boolean().optional(),
  usage_alerts: z.boolean().optional(),
  billing_alerts: z.boolean().optional(),
})

export const notificationDispatchSchema = z.object({
  organization_id: z.string().min(1).max(255),
  title: z.string().min(1).max(255),
  body: z.string().min(1).max(4000),
  data: z.record(z.string(), z.unknown()).optional().default({}),
})

export const registerDeviceSchema = z.object({
  expo_push_token: z.string().min(1).max(512),
  platform: z.string().min(1).max(50),
  organization_id: z.string().min(1).max(255),
})

export const stripeEventSchema = z
  .object({
    id: z.string().min(1),
    object: z.literal('event'),
    type: z.string().min(1),
    created: z.number().optional(),
    data: z
      .object({
        object: z.record(z.string(), z.unknown()),
      })
      .passthrough(),
  })
  .passthrough()

export const whatsappWebhookSchema = z
  .object({
    object: z.string().min(1),
    entry: z
      .array(
        z
          .object({
            id: z.string().optional(),
            changes: z
              .array(
                z
                  .object({
                    field: z.string().optional(),
                    value: z
                      .object({
                        messaging_product: z.string().optional(),
                        metadata: z
                          .object({
                            display_phone_number: z.string().optional(),
                            phone_number_id: z.string().optional(),
                          })
                          .optional(),
                        contacts: z.array(z.record(z.string(), z.unknown())).optional(),
                        messages: z
                          .array(
                            z
                              .object({
                                from: z.string(),
                                id: z.string().optional(),
                                timestamp: z.string().optional(),
                                type: z.string().optional(),
                                text: z.object({ body: z.string() }).optional(),
                              })
                              .passthrough(),
                          )
                          .optional(),
                        statuses: z.array(z.record(z.string(), z.unknown())).optional(),
                      })
                      .passthrough(),
                  })
                  .passthrough(),
              )
              .optional(),
          })
          .passthrough(),
      )
      .optional(),
  })
  .passthrough()

export const messengerWebhookSchema = z
  .object({
    object: z.string().min(1),
    entry: z
      .array(
        z
          .object({
            id: z.string().optional(),
            time: z.number().optional(),
            messaging: z
              .array(
                z
                  .object({
                    sender: z.object({ id: z.string() }).optional(),
                    recipient: z.object({ id: z.string() }).optional(),
                    timestamp: z.number().optional(),
                    message: z
                      .object({ mid: z.string().optional(), text: z.string().optional() })
                      .passthrough()
                      .optional(),
                  })
                  .passthrough(),
              )
              .optional(),
          })
          .passthrough(),
      )
      .optional(),
  })
  .passthrough()

export const metaOAuthStartSchema = z.object({
  channel: z.enum(['whatsapp', 'instagram', 'facebook']),
  org_id: z.string().min(1).max(255),
})

export const metaOAuthStateSchema = z.object({
  org_id: z.string().min(1).max(255),
  channel: z.enum(['whatsapp', 'instagram', 'facebook']),
  uid: z.string().min(1).max(255),
})
