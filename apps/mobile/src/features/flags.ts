import { supabase } from '../lib/supabase'
import { useFeatureStore } from '../stores/featureStore'
import type { FeatureFlags } from '@supportai/types'

export async function loadFeatureFlags(orgId: string): Promise<void> {
  try {
    useFeatureStore.getState().setLoading(true)
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('organization_id', orgId)
      .single()

    if (error) throw error

    if (data) {
      const flags: Partial<FeatureFlags> = {}
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'boolean') {
          flags[key as keyof FeatureFlags] = value
        }
      }
      useFeatureStore.getState().setFlags(flags)
    }
  } catch {
    // Use defaults
  } finally {
    useFeatureStore.getState().setLoading(false)
  }
}

export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  return useFeatureStore.getState().isEnabled(flag)
}
