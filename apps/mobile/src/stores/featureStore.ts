import { create } from 'zustand'
import type { FeatureFlags } from '@supportai/types'

interface FeatureStore {
  flags: FeatureFlags
  isLoading: boolean
  setFlags: (flags: Partial<FeatureFlags>) => void
  setLoading: (loading: boolean) => void
  isEnabled: (flag: keyof FeatureFlags) => boolean
}

const defaultFlags: FeatureFlags = {
  realtime: true,
  ai_memory: false,
  push: true,
  analytics: true,
  crm: false,
  beta_features: false,
}

export const useFeatureStore = create<FeatureStore>((set, get) => ({
  flags: defaultFlags,
  isLoading: true,
  setFlags: (flags) => set({ flags: { ...get().flags, ...flags } as FeatureFlags }),
  setLoading: (isLoading) => set({ isLoading }),
  isEnabled: (flag) => get().flags[flag],
}))
