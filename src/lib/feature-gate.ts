/**
 * Feature gate — checks if an organization's active subscription plan
 * grants access to a specific feature.
 *
 * Spec features per plan:
 *   Starter  → lead_capture: false, sentiment_analysis: false, agent_memory: false
 *   Growth   → lead_capture: true,  sentiment_analysis: true,  agent_memory: false
 *   Pro      → lead_capture: true,  sentiment_analysis: true,  agent_memory: true
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import { cachedQuery, cacheDel } from '@/lib/cache'

export type PlanFeature =
  | 'lead_capture'
  | 'sentiment_analysis'
  | 'advanced_analytics'
  | 'agent_memory'
  | 'priority_support'
  | 'crm_integrations'

/**
 * Returns true if the organization's current active plan includes the feature.
 * Defaults to false on any error or missing subscription.
 */
export async function checkFeature(
  organizationId: string,
  feature: PlanFeature
): Promise<boolean> {
  const features = await getPlanFeatures(organizationId)
  return features[feature]
}

export async function getPlanFeatures(
  organizationId: string,
): Promise<Record<PlanFeature, boolean>> {
  const defaults: Record<PlanFeature, boolean> = {
    lead_capture: false,
    sentiment_analysis: false,
    advanced_analytics: false,
    agent_memory: false,
    priority_support: false,
    crm_integrations: false,
  }

  const result = await cachedQuery(
    `plan_features:${organizationId}`,
    3600,
    async () => {
      try {
        const supabase = await createServiceRoleClient()

        const { data: sub } = await supabase
          .from('subscriptions')
          .select('plan_id')
          .eq('organization_id', organizationId)
          .in('status', ['active', 'trialing'])
          .limit(1)
          .maybeSingle()

        if (!sub?.plan_id) return defaults

        const { data: plan } = await supabase
          .from('subscription_plans')
          .select('features')
          .eq('id', sub.plan_id)
          .single()

        if (!plan?.features) return defaults
        return { ...defaults, ...(plan.features as Record<PlanFeature, boolean>) }
      } catch {
        return defaults
      }
    },
  )
  return result ?? defaults
}

export async function invalidatePlanFeatures(organizationId: string) {
  await cacheDel(`plan_features:${organizationId}`)
}
