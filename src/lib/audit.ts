/**
 * Audit logging helper.
 * Spec: "analytics_events table logs all admin actions: approve_client, suspend_client, config_change."
 * We write to audit_logs (more appropriate for admin actions).
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import { log } from '@/lib/logger'

export async function logAudit(params: {
  userId: string
  organizationId?: string
  action: string
  resourceType?: string
  resourceId?: string
  details?: Record<string, unknown>
  ipAddress?: string
}) {
  try {
    const supabase = await createServiceRoleClient()
    await supabase.from('audit_logs').insert({
      user_id: params.userId,
      organization_id: params.organizationId ?? null,
      action: params.action,
      resource_type: params.resourceType ?? null,
      resource_id: params.resourceId ?? null,
      details: params.details ?? {},
      ip_address: params.ipAddress ?? null,
    })
  } catch (err) {
    // Audit failures must never crash the main flow
    log.error('Failed to write audit log', { error: err, route: 'audit:logAudit' })
  }
}
